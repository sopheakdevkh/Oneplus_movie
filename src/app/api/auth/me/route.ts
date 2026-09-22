import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { extractTokenFromRequest, verifyAuthToken } from "@/lib/auth-security";

/**
 * GET /api/auth/me
 * 
 * Verifies current session / token from HTTP-only cookie or Bearer header.
 * Returns current authenticated user: { id, email, role, subscription_status, subscription_end_date }
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract and verify JWT token
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthorized",
          message: "No authentication token provided in session cookie or Authorization header.",
        },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthorized",
          message: "Invalid or expired authentication session.",
        },
        { status: 401 }
      );
    }

    // 2. Fetch fresh user record from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        subscriptionStatus: true,
        subscriptionTier: true,
        subscriptionEndDate: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "Unauthorized",
          message: "User account associated with this session no longer exists.",
        },
        { status: 401 }
      );
    }

    // 3. Return verified user profile
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase(),
          subscription_status: user.subscriptionStatus,
          subscription_tier: user.subscriptionTier,
          subscription_end_date: user.subscriptionEndDate,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Auth /me endpoint error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error: "Internal Server Error",
        message: "Failed to verify user session.",
      },
      { status: 500 }
    );
  }
}
