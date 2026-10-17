import { NextResponse } from "next/server";
import { AdminAuthError, adminCookieName, adminCookieOptions, assertSameOrigin } from "@/lib/admin/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Idempotent logout also clears an expired or invalid cookie.
    assertSameOrigin(request);
    const response = NextResponse.json({ success: true }, { headers: { "Cache-Control": "private, no-store" } });
    response.cookies.set(adminCookieName(), "", { ...adminCookieOptions(), maxAge: 0, expires: new Date(0) });
    return response;
  } catch (error) {
    return NextResponse.json({ error: "Доступ запрещён." }, {
      status: error instanceof AdminAuthError ? error.status : 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
}
