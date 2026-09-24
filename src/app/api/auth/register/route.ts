import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  hashPassword,
  signAuthToken,
  validateEmail,
  validatePassword,
  checkRateLimit,
  getClientIp,
  setAuthCookie,
} from "@/lib/auth-security";

/**
 * POST /api/auth/register
 * 
 * Secure user registration endpoint:
 * - Rate limited: max 5 attempts per minute per IP
 * - Input validation: RFC email check, min 8 char password
 * - Password hashing: bcrypt (salt rounds: 12)
 * - Initial state: role='USER', subscription_status='free'
 * - Session: Secure HTTP-Only cookie + Bearer token
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Rate Limiting (5 attempts / min)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`register:${clientIp}`, 5, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Registration rate limit exceeded. Please try again in ${rateCheck.resetInSeconds} seconds.`,
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
    const { email, password, full_name, name } = body;

    // 2. Input Validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: "Validation Error", message: emailValidation.error },
        { status: 400 }
      );
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: "Validation Error", message: passwordValidation.error },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = (full_name || name || cleanEmail.split("@")[0]).trim();

    // 3. Prevent duplicate account registration
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: "Conflict",
          message: "An account with this email address already exists.",
        },
        { status: 409 }
      );
    }

    // 4. Secure password hashing with bcrypt (12 rounds)
    const passwordHash = await hashPassword(password);

    // 5. Initialize user: role='USER', subscription_status='free'
    const newUser = await prisma.user.create({
      data: {
        email: cleanEmail,
        name: cleanName,
        passwordHash,
        role: "USER",
        subscriptionStatus: "free",
        subscriptionTier: null,
        subscriptionEndDate: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        subscriptionStatus: true,
        subscriptionEndDate: true,
        createdAt: true,
      },
    });

    // 6. Sign JWT token
    const token = await signAuthToken({
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    // 7. Response with secure HTTP-only cookie
    const response = NextResponse.json(
      {
        message: "User registered successfully.",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          avatar: newUser.avatar,
          role: newUser.role.toLowerCase(),
          subscription_status: newUser.subscriptionStatus,
          subscription_end_date: newUser.subscriptionEndDate,
        },
        token,
      },
      {
        status: 201,
        headers: {
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": String(rateCheck.remaining),
        },
      }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to create user account." },
      { status: 500 }
    );
  }
}
