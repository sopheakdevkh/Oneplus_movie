import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, AuthenticatedUser } from "@/lib/auth";

export type RouteHandler<T = any> = (
  request: NextRequest,
  context: { params: Promise<T> | T; user: AuthenticatedUser }
) => Promise<NextResponse> | NextResponse;

export type GuardResult =
  | { authorized: true; user: AuthenticatedUser }
  | { authorized: false; response: NextResponse };

/**
 * 1. Role-Based Authorization Guard: requireRole
 *
 * Verifies the user is authenticated and matches one of the allowed roles.
 * Returns:
 * - 401 Unauthorized if no logged-in user is detected.
 * - 403 Forbidden if the user's role is not within allowedRoles.
 */
export async function requireRole(
  request: Request | NextRequest,
  allowedRoles: string[]
): Promise<GuardResult> {
  const user = await getAuthenticatedUser(request);

  if (!user || !user.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Authentication is required to access this endpoint.",
        },
        { status: 401 }
      ),
    };
  }

  const normalizedUserRole = user.role?.toLowerCase() || "user";
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  if (!normalizedAllowed.includes(normalizedUserRole)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "FORBIDDEN",
          message: `Access denied. Requires one of the following roles: [${allowedRoles.join(
            ", "
          )}]. Your current role is: '${user.role || "user"}'.`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * 2. Subscription-Based Authorization Guard: requireActiveSubscription
 *
 * Verifies the user is logged in.
 * Allows access if:
 *   user.role === 'admin'
 *   OR (user.role === 'user' AND user.subscription_status === 'active' AND user.subscription_end_date > NOW())
 *
 * If not active, returns HTTP 403 with:
 *   { error: "SUBSCRIPTION_REQUIRED", redirect: "/pricing" }
 */
export async function requireActiveSubscription(
  request: Request | NextRequest
): Promise<GuardResult> {
  const user = await getAuthenticatedUser(request);

  // 1. Verify user is logged in
  if (!user || !user.id) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "UNAUTHORIZED",
          message: "Authentication required. Please sign in to access member content.",
        },
        { status: 401 }
      ),
    };
  }

  const role = user.role?.toLowerCase() || "user";
  const status = user.subscriptionStatus?.toLowerCase() || "free";
  const now = Date.now();

  const isEndDateValid =
    !user.subscriptionEndDate || new Date(user.subscriptionEndDate).getTime() > now;

  // 2. Authorization Condition:
  // Admin bypass OR Active subscriber with valid end date
  const isAuthorized =
    role === "admin" ||
    (role === "user" && status === "active" && isEndDateValid);

  if (!isAuthorized) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "SUBSCRIPTION_REQUIRED",
          redirect: "/pricing",
          message:
            "Active Premium membership required to access in-depth analysis and study materials.",
          currentStatus: status,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, user };
}

/**
 * Higher-Order Route Wrapper: withRole
 * Ergonomic wrapper for route handlers requiring specific roles.
 */
export function withRole<T = any>(allowedRoles: string[], handler: RouteHandler<T>) {
  return async (request: NextRequest, context: { params: Promise<T> | T }) => {
    const check = await requireRole(request, allowedRoles);
    if (!check.authorized) {
      return check.response;
    }
    return handler(request, { ...context, user: check.user });
  };
}

/**
 * Higher-Order Route Wrapper: withActiveSubscription
 * Ergonomic wrapper for route handlers requiring active membership or admin rights.
 */
export function withActiveSubscription<T = any>(handler: RouteHandler<T>) {
  return async (request: NextRequest, context: { params: Promise<T> | T }) => {
    const check = await requireActiveSubscription(request);
    if (!check.authorized) {
      return check.response;
    }
    return handler(request, { ...context, user: check.user });
  };
}
