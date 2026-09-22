import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parseVideoSource } from "@/lib/video";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * Public Film Route: GET /api/movies/:id/public
 *
 * Open to all users (Guests, Free Users, Paid Members, Admins).
 * Returns ONLY public content:
 * - public_synopsis
 * - youtube_video_id
 * - basic metadata & genres
 *
 * Gated impact breakdowns and study syllabus downloads are strictly omitted.
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  const movie = await prisma.movie.findFirst({
    where: {
      OR: [{ id }, { slug: id }],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      description: true,
      publicSynopsis: true,
      youtubeVideoId: true,
      videoUrl: true,
      releaseYear: true,
      duration: true,
      rating: true,
      certification: true,
      posterUrl: true,
      bannerUrl: true,
      genres: {
        select: { id: true, name: true, slug: true },
      },
      // Explicitly EXCLUDE premiumBreakdown and premiumResources
    },
  });

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  // Derive youtube_video_id if not stored directly
  let youtubeVideoId = movie.youtubeVideoId;
  if (!youtubeVideoId && movie.videoUrl) {
    const parsed = parseVideoSource(movie.videoUrl);
    if (parsed?.type === "youtube") {
      youtubeVideoId = parsed.videoId || null;
    }
  }

  return NextResponse.json({
    id: movie.id,
    title: movie.title,
    slug: movie.slug,
    publicSynopsis: movie.publicSynopsis || movie.description,
    youtubeVideoId: youtubeVideoId || null,
    youtubeEmbedUrl: youtubeVideoId
      ? `https://www.youtube-nocookie.com/embed/${youtubeVideoId}?rel=0&modestbranding=1`
      : null,
    releaseYear: movie.releaseYear,
    duration: movie.duration,
    rating: movie.rating,
    certification: movie.certification,
    posterUrl: movie.posterUrl,
    bannerUrl: movie.bannerUrl,
    genres: movie.genres,
    accessTier: "public",
    premiumAvailable: true,
    upgradeNotice:
      "Looking for in-depth psychological breakdowns & lesson notes? Upgrade to Premium at /pricing.",
  });
}
