import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { extractTokenFromRequest, verifyAuthToken, verifyPassword, hashPassword } from "@/lib/auth-security";

/**
 * GET /api/auth/me
 * 
 * Verifies current session / token from HTTP-only cookie or Bearer header.
 * Returns current authenticated user: { id, email, role, subscription_status, subscription_end_date }
 */
export const dynamic = "force-dynamic";

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
          created_at: user.createdAt,
          createdAt: user.createdAt,
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

/**
 * PATCH /api/auth/me
 * 
 * Allows the authenticated user to update their display name or password.
 */
export async function PATCH(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request);
    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized", message: "You must be signed in to update your profile." },
        { status: 401 }
      );
    }

    const payload = await verifyAuthToken(token);
    if (!payload?.sub) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Invalid or expired session." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const updateData: { name?: string; passwordHash?: string } = {};

    // 1. Update Name if provided
    if (typeof name === "string") {
      const trimmed = name.trim();
      if (trimmed.length > 50) {
        return NextResponse.json(
          { error: "Name cannot exceed 50 characters." },
          { status: 400 }
        );
      }
      updateData.name = trimmed;
    }

    // 2. Update Password if requested
    if (newPassword) {
      if (typeof newPassword !== "string" || newPassword.length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      if (!currentPassword) {
        return NextResponse.json(
          { error: "Current password is required to change your password." },
          { status: 400 }
        );
      }

      if (!user.passwordHash) {
        return NextResponse.json(
          { error: "Account does not have a local password configured." },
          { status: 400 }
        );
      }

      const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
      if (!isCurrentValid) {
        return NextResponse.json(
          { error: "Incorrect current password." },
          { status: 400 }
        );
      }

      updateData.passwordHash = await hashPassword(newPassword);
    }

    // 3. Save updates
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role.toLowerCase(),
        subscription_status: updated.subscriptionStatus,
        subscription_tier: updated.subscriptionTier,
        subscription_end_date: updated.subscriptionEndDate,
        created_at: updated.createdAt,
        createdAt: updated.createdAt,
      },
    });
  } catch (error: any) {
    console.error("Error updating profile in PATCH /api/auth/me:", error);
    return NextResponse.json(
      { error: "Internal Server Error", message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
