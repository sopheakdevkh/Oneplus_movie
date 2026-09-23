import { NextResponse } from "next/server";
import { clearAuthCookie } from "@/lib/auth-security";

/**
 * POST /api/admin/logout
 * 
 * Clears administrator session cookie.
 */
export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Administrator logged out successfully.",
  });

  clearAuthCookie(response);
  return response;
}
