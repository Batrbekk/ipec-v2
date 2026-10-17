import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";

export const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60;
export const ADMIN_PASSWORD_MAX_BYTES = 1024;
export const ADMIN_PASSWORD_MIN_LENGTH = 20;

const SCRYPT_OPTIONS = { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const PASSWORD_HASH_PATTERN = /^scrypt:([a-f0-9]{64}):([a-f0-9]{128})$/i;

function deriveKey(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, 64, SCRYPT_OPTIONS, (error, key) => {
      if (error) reject(error);
      else resolve(key);
    });
  });
}

export function isValidPasswordHash(hash: unknown): hash is string {
  return typeof hash === "string" && PASSWORD_HASH_PATTERN.test(hash);
}

/** Fixed scrypt parameters; serialized as scrypt:<32-byte salt hex>:<64-byte key hex>. */
export async function createPasswordHash(password: string): Promise<string> {
  if (
    typeof password !== "string" ||
    password.length < ADMIN_PASSWORD_MIN_LENGTH ||
    Buffer.byteLength(password, "utf8") > ADMIN_PASSWORD_MAX_BYTES
  ) {
    throw new Error("Password must contain at least 20 characters and at most 1024 UTF-8 bytes.");
  }
  const salt = randomBytes(32);
  const key = await deriveKey(password, salt);
  return `scrypt:${salt.toString("hex")}:${key.toString("hex")}`;
}

export async function verifyPassword(password: unknown, hash: string): Promise<boolean> {
  if (
    typeof password !== "string" ||
    password.length === 0 ||
    Buffer.byteLength(password, "utf8") > ADMIN_PASSWORD_MAX_BYTES ||
    !isValidPasswordHash(hash)
  ) {
    return false;
  }
  const [, saltHex, keyHex] = PASSWORD_HASH_PATTERN.exec(hash)!;
  const actualKey = await deriveKey(password, Buffer.from(saltHex, "hex"));
  return timingSafeEqual(actualKey, Buffer.from(keyHex, "hex"));
}

function decodeSessionSecret(secret: unknown): Buffer | null {
  if (typeof secret !== "string" || secret.length > 4096) return null;
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(secret)) {
    return null;
  }
  const key = Buffer.from(secret, "base64");
  return key.length >= 32 && key.toString("base64") === secret ? key : null;
}

export function isValidSessionSecret(secret: unknown): secret is string {
  return decodeSessionSecret(secret) !== null;
}

export function createAdminSession(secret: string, now = Date.now()): string {
  const key = decodeSessionSecret(secret);
  if (!key || !Number.isFinite(now) || now < 0) throw new Error("Invalid session configuration.");
  const issuedAt = Math.floor(now / 1000);
  const payload = Buffer.from(JSON.stringify({
    v: 1,
    iat: issuedAt,
    exp: issuedAt + ADMIN_SESSION_TTL_SECONDS,
  })).toString("base64url");
  const signature = createHmac("sha256", key).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function decodeBase64Url(value: string): Buffer | null {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) return null;
  const decoded = Buffer.from(value, "base64url");
  return decoded.toString("base64url") === value ? decoded : null;
}

export function verifyAdminSession(token: unknown, secret: string, now = Date.now()): boolean {
  const key = decodeSessionSecret(secret);
  if (!key || typeof token !== "string" || token.length > 512 || !Number.isFinite(now) || now < 0) {
    return false;
  }
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [encodedPayload, encodedSignature] = parts;
  const signature = decodeBase64Url(encodedSignature);
  if (!signature || signature.length !== 32) return false;
  const expected = createHmac("sha256", key).update(encodedPayload).digest();
  if (!timingSafeEqual(signature, expected)) return false;
  const decodedPayload = decodeBase64Url(encodedPayload);
  if (!decodedPayload) return false;

  try {
    const payload: unknown = JSON.parse(decodedPayload.toString("utf8"));
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return false;
    const { v, iat, exp } = payload as Record<string, unknown>;
    const current = Math.floor(now / 1000);
    return (
      v === 1 &&
      typeof iat === "number" && Number.isSafeInteger(iat) && iat >= 0 && iat <= current + 60 &&
      typeof exp === "number" && Number.isSafeInteger(exp) &&
      exp === iat + ADMIN_SESSION_TTL_SECONDS && exp > current
    );
  } catch {
    return false;
  }
}

function parseOrigin(value: string): string | null {
  try {
    const url = new URL(value);
    if (
      !["https:", "http:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash
    ) return null;
    return url.origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request, configuredOrigin?: string): boolean {
  const originHeader = request.headers.get("origin");
  if (!originHeader || originHeader === "null") return false;
  const expected = configuredOrigin === undefined
    ? new URL(request.url).origin
    : parseOrigin(configuredOrigin);
  const actual = parseOrigin(originHeader);
  const fetchSite = request.headers.get("sec-fetch-site");
  return expected !== null && actual === expected && (!fetchSite || fetchSite === "same-origin");
}

/** Per-process load shedding only; callers must also use the durable limiter. */
export function createLoginAttemptLimiter() {
  const entries = new Map<string, { count: number; resetsAt: number }>();
  const windowMs = 15 * 60 * 1000;
  let global = { count: 0, resetsAt: 0 };

  return (address: string, now = Date.now()): boolean => {
    if (global.resetsAt <= now) {
      global = { count: 0, resetsAt: now + windowMs };
      for (const [key, entry] of entries) {
        if (entry.resetsAt <= now) entries.delete(key);
      }
    }
    if (global.count >= 100) return false;
    let entry = entries.get(address);
    if (!entry || entry.resetsAt <= now) {
      entry = { count: 0, resetsAt: now + windowMs };
      entries.set(address, entry);
    }
    if (entry.count >= 10) return false;
    entry.count += 1;
    global.count += 1;
    return true;
  };
}
