/**
 * User & Subscription Domain Types
 * LensImpact Film Club
 *
 * Supports 4 User States:
 * 1. Guest (Unauthenticated)
 * 2. Free Registered User
 * 3. Paid Member
 * 4. Admin
 */

export type UserRole = "user" | "admin";

export type SubscriptionStatus = "free" | "active" | "past_due" | "cancelled";

export type SubscriptionTier = "monthly" | "annual";

export type UserState = "guest" | "free_user" | "paid_member" | "admin";

export interface UserSubscriptionData {
  role: UserRole;
  subscriptionStatus: SubscriptionStatus;
  subscriptionTier: SubscriptionTier | string | null;
  subscriptionEndDate: Date | string | null;
  customerId: string | null;
}

export interface AuthenticatedUserPayload {
  id: string;
  email: string;
  name?: string | null;
  role?: UserRole | string | null;
  subscriptionStatus?: SubscriptionStatus | string | null;
  subscriptionTier?: SubscriptionTier | string | null;
  subscriptionEndDate?: Date | string | null;
  customerId?: string | null;
}

/**
 * Resolves the user's active state into one of the 4 defined tiers.
 */
export function resolveUserState(user: AuthenticatedUserPayload | null | undefined): UserState {
  if (!user || !user.id) {
    return "guest";
  }

  // Admin has superuser privileges across all modules
  if (user.role?.toLowerCase() === "admin") {
    return "admin";
  }

  // Check if subscription is active and within valid period
  const isActive =
    user.subscriptionStatus === "active" &&
    (!user.subscriptionEndDate || new Date(user.subscriptionEndDate).getTime() > Date.now());

  if (isActive) {
    return "paid_member";
  }

  return "free_user";
}


/**
 * Checks whether a user's subscription is currently active and within its valid date range.
 */
export function isSubscriptionActive(user: {
  subscriptionStatus?: string | null;
  subscriptionEndDate?: Date | string | null;
}): boolean {
  if (user.subscriptionStatus !== "active") {
    return false;
  }
  if (!user.subscriptionEndDate) {
    return true;
  }
  return new Date(user.subscriptionEndDate).getTime() > Date.now();
}
