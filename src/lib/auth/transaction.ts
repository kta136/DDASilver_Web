import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { authConfig } from "@/lib/auth/config";

export type AuthTransaction = {
  state: string;
  nonce: string;
  verifier: string;
  returnTo: string;
  expiresAt: number;
};

function encode(value: string | Buffer) {
  return Buffer.from(value).toString("base64url");
}

function signature(payload: string) {
  if (!authConfig.cookieSecret) {
    throw new Error("Authentication cookie secret is not configured.");
  }

  return createHmac("sha256", authConfig.cookieSecret)
    .update(payload)
    .digest("base64url");
}

export function randomUrlSafeValue(size = 32) {
  return randomBytes(size).toString("base64url");
}

export function createAuthTransaction(returnTo: string): AuthTransaction {
  return {
    state: randomUrlSafeValue(),
    nonce: randomUrlSafeValue(),
    verifier: randomUrlSafeValue(48),
    returnTo,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };
}

export function signAuthTransaction(transaction: AuthTransaction) {
  const payload = encode(JSON.stringify(transaction));
  return `${payload}.${signature(payload)}`;
}

export function verifyAuthTransaction(value?: string) {
  if (!value) {
    return null;
  }

  const [payload, suppliedSignature] = value.split(".");
  if (!payload || !suppliedSignature) {
    return null;
  }

  const expectedSignature = signature(payload);
  const supplied = Buffer.from(suppliedSignature);
  const expected = Buffer.from(expectedSignature);
  if (
    supplied.length !== expected.length ||
    !timingSafeEqual(supplied, expected)
  ) {
    return null;
  }

  try {
    const transaction = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    ) as AuthTransaction;
    if (
      !transaction.state ||
      !transaction.nonce ||
      !transaction.verifier ||
      !transaction.returnTo ||
      transaction.expiresAt <= Date.now()
    ) {
      return null;
    }
    return transaction;
  } catch {
    return null;
  }
}

export function createPkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function isSafeReturnTo(value: string | null) {
  if (!value) {
    return "/";
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }

  try {
    const url = new URL(value, "https://ddasilver.invalid");
    return url.origin === "https://ddasilver.invalid"
      ? `${url.pathname}${url.search}${url.hash}`
      : "/";
  } catch {
    return "/";
  }
}

export function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
