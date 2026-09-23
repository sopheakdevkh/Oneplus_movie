import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

/**
 * GET /api/watch-history
 * Retrieves the authenticated user's watch history and saved list.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view watch history.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // 1. Fetch user's watch history with movie details
    const watchHistoryItems = await prisma.watchHistory.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          include: {
            genres: true,
          },
        },
      },
      orderBy: { watchedAt: "desc" },
    });

    // 2. Fetch user's saved watchlist
    const watchlistItems = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          include: {
            genres: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    // Combine distinct movies prioritizing watch history followed by watchlist
    const seenMovieIds = new Set<string>();
    const combinedMovies: any[] = [];

    for (const item of watchHistoryItems) {
      if (item.movie && !seenMovieIds.has(item.movie.id)) {
        seenMovieIds.add(item.movie.id);
        combinedMovies.push({
          ...item.movie,
          progressPercent: item.progressPercent,
          watchedAt: item.watchedAt,
        });
      }
    }

    for (const item of watchlistItems) {
      if (item.movie && !seenMovieIds.has(item.movie.id)) {
        seenMovieIds.add(item.movie.id);
        combinedMovies.push(item.movie);
      }
    }

    return NextResponse.json({
      movies: combinedMovies,
      historyCount: watchHistoryItems.length,
      watchlistCount: watchlistItems.length,
      totalCount: combinedMovies.length,
    });
  } catch (error: any) {
    console.error("Failed to fetch watch history:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching watch history." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watch-history
 * Records or updates video watch progress for the authenticated user.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to record watch history.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { movieId, progressPercent = 0 } = body;

    if (!movieId) {
      return NextResponse.json(
        { error: "Validation Error: 'movieId' is required." },
        { status: 400 }
      );
    }

    const record = await prisma.watchHistory.upsert({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
      update: {
        progressPercent: Math.min(100, Math.max(0, Number(progressPercent))),
        watchedAt: new Date(),
      },
      create: {
        userId: user.id,
        movieId,
        progressPercent: Math.min(100, Math.max(0, Number(progressPercent))),
      },
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    console.error("Failed to update watch history:", error);
    return NextResponse.json(
      { error: "Internal Server Error updating watch history." },
      { status: 500 }
    );
  }
}
