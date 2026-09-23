import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth-security";

/**
 * POST /api/auth/logout
 * 
 * Clears the session and invalidates the secure HTTP-Only cookie.
 */
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    {
      message: "Successfully logged out. Session invalidated.",
      authenticated: false,
    },
    { status: 200 }
  );

  // Invalidate cookie by setting maxAge=0 and expiration in the past
  clearAuthCookie(response);

  return response;
}
