import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";

// --- Secret & Config ---
const BCRYPT_SALT_ROUNDS = 12;
function getJwtSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL: AUTH_SECRET or JWT_SECRET environment variable must be set in production."
      );
    }
    console.warn(
      "[SECURITY WARNING] AUTH_SECRET / JWT_SECRET is not configured in environment. Using development fallback. DO NOT deploy without setting a cryptographically random secret."
    );
    return new TextEncoder().encode("lensimpact_dev_fallback_secret_must_be_overridden_in_prod");
  }
  return new TextEncoder().encode(secret);
}

const JWT_SECRET_KEY = getJwtSecret();
export const AUTH_COOKIE_NAME = "lensimpact_auth_token";
const TOKEN_EXPIRATION = "7d"; // 7 days

export interface JWTPayloadData {
  sub: string; // User ID
  email: string;
  role: string;
}

// --- 1. Password Hashing & Verification (bcryptjs) ---
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// --- 2. JWT Generation & Verification (jose) ---
export async function signAuthToken(payload: JWTPayloadData): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(JWT_SECRET_KEY);
}

export async function verifyAuthToken(token: string): Promise<JWTPayloadData | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET_KEY);
    if (!payload.sub || !payload.email) return null;
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      role: (payload.role as string) || "user",
    };
  } catch {
    return null;
  }
}

// --- 3. Input Validation ---
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function validateEmail(email?: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== "string") {
    return { valid: false, error: "Email is required." };
  }
  const cleanEmail = email.trim();
  if (cleanEmail.length > 254) {
    return { valid: false, error: "Email exceeds maximum length." };
  }
  if (!EMAIL_REGEX.test(cleanEmail)) {
    return { valid: false, error: "Please provide a valid email address syntax." };
  }
  return { valid: true };
}

export function validatePassword(password?: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Password is required." };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long." };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password exceeds maximum allowable length." };
  }
  return { valid: true };
}

// --- 4. Rate Limiter (Sliding Window: 5 attempts per 60 seconds) ---
interface RateLimitRecord {
  count: number;
  firstAttemptTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

// Clean up stale entries periodically
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitStore.entries()) {
      if (now - record.firstAttemptTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitStore.delete(key);
      }
    }
  }, 120 * 1000);
}

export function checkRateLimit(
  key: string,
  maxAttempts: number = MAX_ATTEMPTS,
  windowMs: number = RATE_LIMIT_WINDOW_MS
): { allowed: boolean; remaining: number; resetInSeconds: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    rateLimitStore.set(key, { count: 1, firstAttemptTime: now });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  // Check if window has expired
  if (now - record.firstAttemptTime > windowMs) {
    rateLimitStore.set(key, { count: 1, firstAttemptTime: now });
    return { allowed: true, remaining: maxAttempts - 1, resetInSeconds: Math.ceil(windowMs / 1000) };
  }

  // Inside current window
  record.count += 1;
  const resetInSeconds = Math.ceil((record.firstAttemptTime + windowMs - now) / 1000);

  if (record.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  return { allowed: true, remaining: maxAttempts - record.count, resetInSeconds };
}

export function getClientIp(request: Request | NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

// --- 5. Secure HTTP-Only Cookie Helpers ---
export function setAuthCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export function extractTokenFromRequest(request: Request | NextRequest): string | null {
  // 1. Check HTTP-Only Cookie
  if ("cookies" in request && typeof (request as any).cookies?.get === "function") {
    const cookie = (request as NextRequest).cookies.get(AUTH_COOKIE_NAME);
    if (cookie?.value) return cookie.value;
  }

  const cookieHeader = request.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader
      .split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
    if (match) {
      return match.substring(AUTH_COOKIE_NAME.length + 1);
    }
  }

  // 2. Check Authorization Header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  return null;
}
