import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  signAuthToken,
  setAuthCookie,
  checkRateLimit,
  getClientIp,
} from "@/lib/auth-security";

/**
 * POST /api/admin/login
 * 
 * High-security administrative authentication endpoint.
 * - Rate-limited to prevent brute-forcing.
 * - Requires explicit administrator credentials (email + password).
 * - Verifies against database Admin records (role === 'ADMIN') with bcrypt password hash.
 * - Supports configured ADMIN_EMAIL & ADMIN_PASSWORD environment variables.
 * - Issues cryptographically signed JWT with role: "admin" in secure HTTP-Only cookie.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // 1. Rate limiting (10 attempts / min per IP)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`admin-login:${clientIp}`, 10, 60 * 1000);

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: "Too Many Requests",
        message: `Too many administrative login attempts. Please wait ${rateCheck.resetInSeconds} seconds before trying again.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateCheck.resetInSeconds),
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    // Strict input verification
    if (!email || typeof email !== "string" || !password || typeof password !== "string") {
      return NextResponse.json(
        {
          error: "Invalid Credentials",
          message: "Both administrator email and password are required.",
        },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    let isAuthorized = false;
    let adminUserId = "usr_admin_master";
    let adminUserName = "System Administrator";

    // 2. Priority 1: Check database for user with ADMIN role and verified password hash
    try {
      const dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
      });

      if (dbUser && dbUser.role?.toUpperCase() === "ADMIN" && dbUser.passwordHash) {
        const matches = await verifyPassword(password, dbUser.passwordHash);
        if (matches) {
          isAuthorized = true;
          adminUserId = dbUser.id;
          adminUserName = dbUser.name || "System Administrator";
        }
      }
    } catch (dbErr) {
      console.warn("Database error during admin authentication check:", dbErr);
    }

    // 3. Priority 2: Check server-side configured ADMIN_EMAIL & ADMIN_PASSWORD environment variables
    const envAdminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD;

    if (!isAuthorized && envAdminEmail && envAdminPassword) {
      if (cleanEmail === envAdminEmail && password === envAdminPassword) {
        isAuthorized = true;
        // Securely sync or create the admin in DB using bcrypt hash of their actual configured password
        try {
          const hashedPassword = await hashPassword(password);
          const upserted = await prisma.user.upsert({
            where: { email: cleanEmail },
            update: {
              role: "ADMIN",
              passwordHash: hashedPassword,
              subscriptionStatus: "active",
              subscriptionTier: "admin_vip",
            },
            create: {
              email: cleanEmail,
              name: "System Administrator",
              role: "ADMIN",
              passwordHash: hashedPassword,
              subscriptionStatus: "active",
              subscriptionTier: "admin_vip",
            },
            select: {
              id: true,
              email: true,
              name: true,
              role: true,
            },
          });
          adminUserId = upserted.id;
          adminUserName = upserted.name || adminUserName;
        } catch (dbErr) {
          console.warn("Could not sync env admin account to database:", dbErr);
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          message: "Invalid administrator credentials. Access to the Admin Console is restricted.",
        },
        { status: 401 }
      );
    }

    // 4. Issue signed admin JWT token
    const token = await signAuthToken({
      sub: adminUserId,
      email: cleanEmail,
      role: "admin",
    });

    const response = NextResponse.json({
      success: true,
      message: "Administrator authenticated successfully. Redirecting to Admin Console...",
      user: {
        id: adminUserId,
        email: cleanEmail,
        name: adminUserName,
        role: "admin",
        subscriptionStatus: "active",
        subscriptionTier: "admin_vip",
      },
    });

    // 5. Set secure HTTP-Only cookie
    setAuthCookie(response, token);

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        message: "An unexpected error occurred during administrative authentication.",
      },
      { status: 500 }
    );
  }
}
