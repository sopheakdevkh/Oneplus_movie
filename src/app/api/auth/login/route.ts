import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  verifyPassword,
  signAuthToken,
  validateEmail,
  checkRateLimit,
  getClientIp,
  setAuthCookie,
} from "@/lib/auth-security";

/**
 * POST /api/auth/login
 * 
 * Secure login endpoint:
 * - Rate limited: max 5 attempts per minute per IP to prevent credential brute-forcing
 * - Constant-time safe error messaging (prevents account enumeration)
 * - Verifies bcrypt password hash
 * - Issues signed JWT in secure HTTP-Only cookie + response body
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting (5 attempts / min)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`login:${clientIp}`, 5, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Too many login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.resetInSeconds),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    // 2. Validate format
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid || !password || typeof password !== "string") {
      return NextResponse.json(
        {
          error: "Invalid Credentials",
          message: "Please provide a valid email and password.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 3. Lookup user
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        passwordHash: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
      },
    });

    // Uniform response for non-existent users and password mismatches to prevent user enumeration
    if (!user || !user.passwordHash) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid email or password.",
        },
        {
          status: 401,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": String(rateCheck.remaining),
          },
        }
      );
    }

    // 4. Verify password with bcrypt
    const passwordMatches = await verifyPassword(password, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid email or password.",
        },
        {
          status: 401,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": String(rateCheck.remaining),
          },
        }
      );
    }

    // 5. Sign JWT session token
    const token = await signAuthToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    // 6. Build response and set secure HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role.toLowerCase(),
          subscription_status: user.subscriptionStatus,
          subscription_end_date: user.subscriptionEndDate,
        },
        token,
      },
      {
        status: 200,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Login endpoint error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "An unexpected error occurred during authentication." },
      { status: 500 }
    );
  }
}
