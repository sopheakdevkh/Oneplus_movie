/**
 * Shared category definitions used by Admin CMS forms and the public catalog.
 * Key = slug (stored in DB as a Genre), Value = human-readable label.
 */
export const CATEGORIES: Record<string, string> = {
  "mindset-growth": "Mindset & Personal Growth",
  "leadership-resilience": "Leadership & Resilience",
  "social-impact": "Social Impact & Society",
  "philosophical-cinema": "Deep Philosophical Cinema",
  "award-shorts": "Award-Winning Short Films",
};

/** Ordered array of category slugs for consistent rendering order. */
export const CATEGORY_ORDER = Object.keys(CATEGORIES);

/** Get the human-readable label for a category slug. */
export function getCategoryLabel(slug: string): string {
  return CATEGORIES[slug] || slug;
}
