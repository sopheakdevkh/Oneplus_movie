import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Controller: GET /api/movies/:id (or /api/movies/:slug)
 *
 * Security & Data Leak Prevention:
 * 1. Checks user session & subscription status from signed JWT or session token.
 * 2. If Member (subscription_status === 'active') or Admin (role === 'admin'):
 *    - Returns the full movie record including raw `premium_breakdown` and downloadable assets.
 *    - Sets `is_locked: false`.
 * 3. If Guest (unauthenticated) or Free User (subscription_status === 'free'):
 *    - Never sends raw `premium_breakdown` or downloadable asset links (zero data leak).
 *    - Truncates `premium_breakdown` to a 200-character `preview_text` or returns only `public_synopsis`.
 *    - Sets `is_locked: true` so the frontend triggers the paywall card.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getAuthenticatedUser(request);

    // 1. Fetch movie record by id or slug
    const movie = await prisma.movie.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        genres: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!movie) {
      return NextResponse.json(
        { error: "Movie not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 2. Authorization Security Logic:
    const role = user?.role?.toLowerCase();
    const subscriptionStatus = user?.subscriptionStatus?.toLowerCase();
    const subscriptionEndDate = user?.subscriptionEndDate;
    const isSubscriptionValid =
      !subscriptionEndDate || new Date(subscriptionEndDate).getTime() > Date.now();

    const isAdmin = role === "admin";
    const isMember = subscriptionStatus === "active" && isSubscriptionValid;
    const isAuthorized = isAdmin || isMember;

    // Base safe metadata for all audiences
    const baseResponse = {
      id: movie.id,
      title: movie.title,
      slug: movie.slug,
      description: movie.description,
      public_synopsis: movie.publicSynopsis || movie.description,
      publicSynopsis: movie.publicSynopsis || movie.description,
      youtube_video_id: movie.youtubeVideoId,
      youtubeVideoId: movie.youtubeVideoId,
      video_url: movie.videoUrl,
      videoUrl: movie.videoUrl,
      release_year: movie.releaseYear,
      releaseYear: movie.releaseYear,
      duration: movie.duration,
      rating: movie.rating,
      certification: movie.certification,
      poster_url: movie.posterUrl,
      posterUrl: movie.posterUrl,
      banner_url: movie.bannerUrl,
      bannerUrl: movie.bannerUrl,
      genres: movie.genres,
    };

    // 3. Authorized Paid Members & Admins: Complete object with full breakdown & resources
    if (isAuthorized) {
      return NextResponse.json({
        ...baseResponse,
        premium_breakdown: movie.premiumBreakdown,
        premiumBreakdown: movie.premiumBreakdown,
        premium_resources: movie.premiumResources,
        premiumResources: movie.premiumResources,
        access_tier: isAdmin ? "admin" : "member",
        is_locked: false,
        isLocked: false,
      });
    }

    // 4. Guests & Free Users: Data Leak Guard Enforced
    // - Truncate premium_breakdown to max 200 characters preview_text
    // - Zero raw premium_breakdown or asset download links emitted
    // - Sets is_locked: true for client paywall triggering
    const rawBreakdown = movie.premiumBreakdown || "";
    const previewText =
      rawBreakdown.length > 200
        ? rawBreakdown.slice(0, 200).trim() + "..."
        : rawBreakdown || (movie.publicSynopsis ? movie.publicSynopsis.slice(0, 200) : "");

    return NextResponse.json({
      ...baseResponse,
      premium_breakdown: null, // Zero data leak
      premiumBreakdown: null,  // Zero data leak
      premium_resources: null, // Zero asset download link leaks
      premiumResources: null,
      preview_text: previewText,
      previewText: previewText,
      is_locked: true,
      isLocked: true,
      access_tier: user ? "free" : "guest",
      upgrade_url: "/pricing",
      upgradeNotice:
        "Full psychological analysis, moral breakdowns, and printable syllabus guides require an active LensImpact VIP Membership.",
    });
  } catch (error: any) {
    console.error("Error in GET /api/movies/:id:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
