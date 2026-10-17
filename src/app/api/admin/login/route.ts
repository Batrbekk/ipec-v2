import { NextResponse } from "next/server";
import {
  AdminAuthError,
  adminCookieName,
  adminCookieOptions,
  allowInMemoryLoginAttempt,
  assertSameOrigin,
  isAdminConfigured,
  loginAttemptAddress,
} from "@/lib/admin/auth";
import { createAdminSession, verifyPassword } from "@/lib/admin/auth-core";
import { allowLoginAttempt } from "@/lib/admin/login-rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BODY_BYTES = 2048;
const NO_STORE = { "Cache-Control": "private, no-store" };

async function readPassword(request: Request): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
    throw new AdminAuthError(415, "Ожидается JSON-запрос.");
  }
  const contentLength = request.headers.get("content-length");
  if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > MAX_BODY_BYTES)) {
    throw new AdminAuthError(413, "Слишком большой запрос.");
  }
  if (!request.body) throw new AdminAuthError(400, "Некорректный запрос.");
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BODY_BYTES) {
        await reader.cancel();
        throw new AdminAuthError(413, "Слишком большой запрос.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new AdminAuthError(400, "Некорректный запрос.");
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      Object.keys(parsed).length !== 1 || !("password" in parsed)) {
    throw new AdminAuthError(400, "Некорректный запрос.");
  }
  return parsed.password;
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    if (!isAdminConfigured()) throw new AdminAuthError(503, "Вход временно недоступен.");
    const password = await readPassword(request);
    const address = loginAttemptAddress(request);
    if (!allowInMemoryLoginAttempt(address) || !(await allowLoginAttempt(address))) {
      return NextResponse.json({ error: "Слишком много попыток. Попробуйте через 15 минут." }, {
        status: 429,
        headers: { ...NO_STORE, "Retry-After": "900" },
      });
    }
    if (!(await verifyPassword(password, process.env.ADMIN_PASSWORD_HASH!))) {
      throw new AdminAuthError(401, "Неверный пароль.");
    }
    const response = NextResponse.json({ success: true }, { headers: NO_STORE });
    response.cookies.set(adminCookieName(), createAdminSession(process.env.ADMIN_SESSION_SECRET!), adminCookieOptions());
    return response;
  } catch (error) {
    // Never return crypto, storage, token, or environment details to the browser.
    return NextResponse.json({
      error: error instanceof AdminAuthError ? error.message : "Вход временно недоступен.",
    }, {
      status: error instanceof AdminAuthError ? error.status : 503,
      headers: NO_STORE,
    });
  }
}
