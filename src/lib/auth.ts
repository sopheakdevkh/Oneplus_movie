import { NextRequest } from "next/server";
import prisma from "@/lib/db";
import { extractTokenFromRequest, verifyAuthToken } from "@/lib/auth-security";

export interface AuthenticatedUser {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  customerId?: string | null;
  subscriptionStatus?: string | null;
  subscriptionTier?: string | null;
  subscriptionEndDate?: Date | null;
}

/**
 * Retrieves the currently authenticated user from headers, cookies, or database.
 * 1. Checks and verifies signed JWT in secure HTTP-Only cookie or Bearer header.
 * 2. Checks custom x-user-id header.
 * 3. Fallback to active demo profile (Sarah Jenkins) for testing if unauthenticated.
 */
export async function getAuthenticatedUser(
  request: Request | NextRequest
): Promise<AuthenticatedUser | null> {
  try {
    // 1. Verify signed JWT Token from HTTP-Only cookie or Bearer header
    const token = extractTokenFromRequest(request);
    if (token) {
      const verified = await verifyAuthToken(token);
      if (verified?.sub) {
        const user = await prisma.user.findUnique({
          where: { id: verified.sub },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            customerId: true,
            subscriptionStatus: true,
            subscriptionTier: true,
            subscriptionEndDate: true,
          },
        });
        if (user) return user;
      }
    }

    // 2. Check custom user header (e.g. from upstream auth gateway / proxy)
    const headerUserId = request.headers.get("x-user-id");
    if (headerUserId) {
      const user = await prisma.user.findUnique({
        where: { id: headerUserId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          customerId: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          subscriptionEndDate: true,
        },
      });
      if (user) return user;
    }

    // 2. Check Authorization Bearer token (JWT or User ID)
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7).trim();
      const user = await prisma.user.findFirst({
        where: {
          OR: [{ id: token }, { email: token }],
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          customerId: true,
          subscriptionStatus: true,
          subscriptionTier: true,
          subscriptionEndDate: true,
        },
      });
      if (user) return user;
    }

    // No valid authenticated session found -> real unauthenticated guest
    return null;
  } catch (error) {
    console.error("Error authenticating user:", error);
    return null;
  }
}
