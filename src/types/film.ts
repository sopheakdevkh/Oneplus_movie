/**
 * Film & Gated Content Domain Models
 * LensImpact Film Club
 */

export interface PremiumResourceItem {
  id: string;
  title: string;
  type: "pdf_syllabus" | "worksheet" | "reflection_journal" | "audio_commentary";
  downloadUrl: string;
  fileSizeBytes?: number;
  pageCount?: number;
}

export interface PremiumResourcesPayload {
  pdfSyllabusUrl?: string;
  discussionPrompts?: string[];
  actionTakeaways?: string[];
  exerciseItems?: PremiumResourceItem[];
}

export interface FilmPublicContent {
  id: string;
  title: string;
  slug: string;
  releaseYear: number;
  duration: number;
  rating: number;
  certification: string;
  posterUrl: string;
  bannerUrl?: string | null;
  publicSynopsis: string;
  youtubeVideoId?: string | null;
  genres: Array<{ id: string; name: string; slug: string }>;
}

export interface FilmGatedContent {
  premiumBreakdown?: string | null;
  premiumResources?: PremiumResourcesPayload | string | null;
}

export type FilmFullData = FilmPublicContent & FilmGatedContent;

/**
 * Strips premium gated fields for Guests and Free Users,
 * ensuring sensitive breakdown data is never leaked in public payloads.
 */
export function sanitizeFilmForUser(
  film: FilmFullData,
  canAccessPremium: boolean
): FilmPublicContent | FilmFullData {
  if (canAccessPremium) {
    return film;
  }

  // Omit confidential analysis and lesson notes
  const { premiumBreakdown, premiumResources, ...publicOnly } = film;
  return publicOnly;
}
