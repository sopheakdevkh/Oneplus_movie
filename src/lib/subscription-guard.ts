import { NextRequest, NextResponse } from "next/server";
import { redirect } from "next/navigation";
import { getAuthenticatedUser, AuthenticatedUser } from "@/lib/auth";
import { isSubscriptionActive } from "@/types/user";

export interface SubscriptionGuardOptions {
  /**
   * If true (default in page components), redirects to /pricing if subscription is not active.
   * If false (default in API routes), returns a 403 JSON Response.
   */
  redirectOnForbidden?: boolean;
  redirectUrl?: string;
}

export type SubscriptionCheckResult =
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse };

/**
 * Backend route and middleware check for active subscription.
 * Inspects the logged-in user:
 * - If subscription_status !== 'active' (or expired), returns a 403 status or redirects to /pricing.
 * - If subscription_status === 'active' and within validity period, grants access.
 */
export async function requireActiveSubscription(
  request?: Request | NextRequest,
  options: SubscriptionGuardOptions = {}
): Promise<SubscriptionCheckResult> {
  const {
    redirectOnForbidden = false,
    redirectUrl = "/pricing?reason=subscription_required",
  } = options;

  // 1. Retrieve the authenticated user
  const user = request ? await getAuthenticatedUser(request) : null;

  // 2. Check if user exists and has an active subscription or admin role
  const isAdmin = user?.role?.toLowerCase() === "admin";
  const hasActiveSubscription =
    user &&
    (isAdmin ||
      (user.subscriptionStatus === "active" &&
        (!user.subscriptionEndDate || new Date(user.subscriptionEndDate).getTime() > Date.now())));

  if (!user) {
    if (redirectOnForbidden) {
      redirect("/pricing?reason=auth_required");
    }
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Authentication required to access premium film content.",
          code: "UNAUTHORIZED",
        },
        { status: 401 }
      ),
    };
  }

  if (!hasActiveSubscription) {
    if (redirectOnForbidden) {
      redirect(redirectUrl);
    }
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "Forbidden: Active Premium subscription required.",
          code: "SUBSCRIPTION_REQUIRED",
          status: user.subscriptionStatus || "free",
          pricingUrl: "/pricing",
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}
