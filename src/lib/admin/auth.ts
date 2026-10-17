import "server-only";
import { isIP } from "node:net";
import { cookies } from "next/headers";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createLoginAttemptLimiter,
  isSameOriginRequest,
  isValidPasswordHash,
  isValidSessionSecret,
  verifyAdminSession,
} from "./auth-core";

export class AdminAuthError extends Error {
  constructor(public readonly status: number, message = "Доступ запрещён.") {
    super(message);
    this.name = "AdminAuthError";
  }
}

export function isAdminConfigured(): boolean {
  return isValidPasswordHash(process.env.ADMIN_PASSWORD_HASH) &&
    isValidSessionSecret(process.env.ADMIN_SESSION_SECRET);
}

export function adminCookieName(): string {
  return process.env.NODE_ENV === "production" ? "__Host-ipec_admin" : "ipec_admin";
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  };
}

export async function hasAdminSession(): Promise<boolean> {
  if (!isAdminConfigured()) return false;
  const cookieStore = await cookies();
  return verifyAdminSession(cookieStore.get(adminCookieName())?.value, process.env.ADMIN_SESSION_SECRET!);
}

export function assertSameOrigin(request: Request): void {
  if (!isSameOriginRequest(request, process.env.ADMIN_ORIGIN)) {
    throw new AdminAuthError(403, "Недопустимый источник запроса.");
  }
}

export async function requireAdminRequest(request: Request): Promise<void> {
  if (!(await hasAdminSession())) throw new AdminAuthError(401, "Необходим вход в админ-панель.");
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method.toUpperCase())) assertSameOrigin(request);
}

export const allowInMemoryLoginAttempt = createLoginAttemptLimiter();

export function loginAttemptAddress(request: Request): string {
  if (process.env.VERCEL === "1") {
    // Vercel overwrites this header. Other forwarded headers are attacker-controlled.
    const address = request.headers.get("x-vercel-forwarded-for")?.trim();
    if (!address || !isIP(address)) {
      throw new AdminAuthError(503, "Вход временно недоступен.");
    }
    return address;
  }
  // A shared bucket is safer than trusting proxy headers on an unknown host.
  return "shared-non-vercel";
}
