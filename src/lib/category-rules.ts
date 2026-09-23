import { UserState } from "@/types/user";

export type CategoryAccessLevel = "public" | "free" | "vip";

export interface CatalogLimits {
  guestCategoryLimit: number; // Max open categories for guest before shelf gating
  guestSearchLimit: number;   // Max search results returned for guest
  freeSearchLimit: number;    // Max search results returned for free user
}

export interface CategoryRulesConfig {
  rules: Record<string, CategoryAccessLevel>;
  limits: CatalogLimits;
}

export const DEFAULT_CATEGORY_RULES: Record<string, CategoryAccessLevel> = {
  "mindset-growth": "public",
  "award-shorts": "public",
  "action": "public",
  "adventure": "public",
  "animation": "public",
  "comedy": "public",
  "social-impact": "free",
  "drama": "free",
  "sci-fi": "free",
  "crime": "free",
  "fantasy": "free",
  "philosophical-cinema": "vip",
  "leadership-resilience": "vip",
  "thriller": "vip",
};

export const DEFAULT_CATALOG_LIMITS: CatalogLimits = {
  guestCategoryLimit: 3,
  guestSearchLimit: 4,
  freeSearchLimit: 8,
};

/**
 * Checks whether a category is unlocked for a given user state.
 * Safe to call on both client and server.
 */
export function isCategoryAccessibleForUser(
  categorySlug: string,
  userState: UserState,
  rules: Record<string, CategoryAccessLevel> = DEFAULT_CATEGORY_RULES
): boolean {
  if (userState === "admin" || userState === "paid_member") {
    return true;
  }

  const requiredLevel = rules[categorySlug] || "public";

  if (requiredLevel === "public") {
    return true;
  }

  if (requiredLevel === "free") {
    return userState === "free_user";
  }

  // "vip" requires paid_member or admin
  return false;
}
