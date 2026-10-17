import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import test from "node:test";
import {
  ADMIN_SESSION_TTL_SECONDS,
  createAdminSession,
  createLoginAttemptLimiter,
  createPasswordHash,
  isSameOriginRequest,
  isValidPasswordHash,
  isValidSessionSecret,
  verifyAdminSession,
  verifyPassword,
} from "../src/lib/admin/auth-core";

const secret = randomBytes(32).toString("base64");
const now = 1_800_000_000_000;

test("scrypt accepts the correct password, rejects a wrong password, and uses random salts", async () => {
  const password = "a long private example password 123!";
  const hash = await createPasswordHash(password);
  const secondHash = await createPasswordHash(password);
  assert.ok(isValidPasswordHash(hash));
  assert.notEqual(hash, secondHash);
  assert.equal(await verifyPassword(password, hash), true);
  assert.equal(await verifyPassword("a different private password 456!", hash), false);
});

test("password and hash input validation rejects malformed and oversized inputs", async () => {
  const syntacticallyValidHash = `scrypt:${"ab".repeat(32)}:${"cd".repeat(64)}`;
  await assert.rejects(createPasswordHash("too short"));
  await assert.rejects(createPasswordHash("я".repeat(513)));
  assert.equal(isValidPasswordHash("scrypt:abcd:1234"), false);
  assert.equal(isValidPasswordHash(`scrypt:${"ab".repeat(32)}:${"xy".repeat(64)}`), false);
  for (const password of [null, {}, "", "x".repeat(1025), "я".repeat(513)]) {
    assert.equal(await verifyPassword(password, syntacticallyValidHash), false);
  }
  assert.equal(await verifyPassword("some long enough password", "bad-hash"), false);
});

test("session is valid until its eight-hour expiration and invalid under a different secret", () => {
  const token = createAdminSession(secret, now);
  assert.equal(verifyAdminSession(token, secret, now), true);
  assert.equal(verifyAdminSession(token, secret, now + ADMIN_SESSION_TTL_SECONDS * 1000 - 1), true);
  assert.equal(verifyAdminSession(token, secret, now + ADMIN_SESSION_TTL_SECONDS * 1000), false);
  assert.equal(verifyAdminSession(token, randomBytes(32).toString("base64"), now), false);
});

test("session rejects tampering, malformed encodings and impossible timestamps", () => {
  const token = createAdminSession(secret, now);
  const [payload, signature] = token.split(".");
  const changedPayload = Buffer.from(JSON.stringify({ v: 1, iat: now / 1000, exp: now / 1000 + 999999 })).toString("base64url");
  const tamperedSignature = `${signature[0] === "A" ? "B" : "A"}${signature.slice(1)}`;
  for (const candidate of [undefined, "", `${payload}.${tamperedSignature}`, `${changedPayload}.${signature}`, `${token}.extra`, `${payload}=.${signature}`, "x".repeat(513)]) {
    assert.equal(verifyAdminSession(candidate, secret, now), false);
  }
  const sign = (value: unknown) => {
    const encoded = Buffer.from(JSON.stringify(value)).toString("base64url");
    return `${encoded}.${createHmac("sha256", Buffer.from(secret, "base64")).update(encoded).digest("base64url")}`;
  };
  for (const value of [
    { v: 2, iat: now / 1000, exp: now / 1000 + ADMIN_SESSION_TTL_SECONDS },
    { v: 1, iat: now / 1000 + 61, exp: now / 1000 + 61 + ADMIN_SESSION_TTL_SECONDS },
    { v: 1, iat: now / 1000, exp: now / 1000 + ADMIN_SESSION_TTL_SECONDS + 1 },
    { v: 1, iat: "1800000000", exp: now / 1000 + ADMIN_SESSION_TTL_SECONDS },
    null,
  ]) assert.equal(verifyAdminSession(sign(value), secret, now), false);
});

test("weak, absent, and malformed session secrets cannot create or verify sessions", () => {
  const token = createAdminSession(secret, now);
  assert.equal(isValidSessionSecret(secret), true);
  for (const invalid of [undefined, "", "not base64", randomBytes(31).toString("base64"), `${secret}\n`]) {
    assert.equal(isValidSessionSecret(invalid), false);
    assert.equal(verifyAdminSession(token, invalid as string, now), false);
    assert.throws(() => createAdminSession(invalid as string, now));
  }
});

test("mutation origins must match the configured canonical origin", () => {
  const makeRequest = (origin?: string, fetchSite?: string) => new Request("https://preview.vercel.app/api/admin/login", {
    method: "POST",
    headers: { ...(origin === undefined ? {} : { origin }), ...(fetchSite ? { "sec-fetch-site": fetchSite } : {}) },
  });
  const canonical = "https://www.ipec-energy.com";
  assert.equal(isSameOriginRequest(makeRequest(canonical), canonical), true);
  assert.equal(isSameOriginRequest(makeRequest(canonical, "same-origin"), canonical), true);
  for (const origin of [undefined, "null", "https://evil.example", "https://www.ipec-energy.com.evil.example", "http://www.ipec-energy.com", `${canonical}:444`, `${canonical}/path`, `${canonical}?query=1`]) {
    assert.equal(isSameOriginRequest(makeRequest(origin), canonical), false);
  }
  assert.equal(isSameOriginRequest(makeRequest(canonical, "cross-site"), canonical), false);
  assert.equal(isSameOriginRequest(makeRequest(canonical, "same-site"), canonical), false);
  assert.equal(isSameOriginRequest(makeRequest(canonical), ""), false);
  assert.equal(isSameOriginRequest(makeRequest(canonical), `${canonical}/admin`), false);
  assert.equal(isSameOriginRequest(makeRequest("https://preview.vercel.app")), true);
  assert.equal(isSameOriginRequest(new Request("http://localhost:3000/api/admin/login", {
    method: "POST", headers: { origin: "http://localhost:3000" },
  })), true);
});

test("additional process limiter enforces per-address and global windows", () => {
  const allow = createLoginAttemptLimiter();
  for (let attempt = 0; attempt < 10; attempt++) assert.equal(allow("one", now), true);
  assert.equal(allow("one", now), false);
  assert.equal(allow("two", now), true);
  assert.equal(allow("one", now + 15 * 60 * 1000), true);
  const globalAllow = createLoginAttemptLimiter();
  for (let address = 0; address < 100; address++) assert.equal(globalAllow(`ip-${address}`, now), true);
  assert.equal(globalAllow("another", now), false);
});
