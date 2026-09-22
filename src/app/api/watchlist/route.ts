import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { resolveUserState } from "@/types/user";

export const FREE_WATCHLIST_LIMIT = 5;

/**
 * GET /api/watchlist
 * Retrieves the current user's watchlist items with quota metadata.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        { error: "Authentication required to view watchlist.", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const userState = resolveUserState(user);
    const isUnlimited = userState === "paid_member" || userState === "admin";

    const items = await prisma.watchlist.findMany({
      where: { userId: user.id },
      include: {
        movie: {
          select: {
            id: true,
            title: true,
            slug: true,
            posterUrl: true,
            rating: true,
            releaseYear: true,
            duration: true,
          },
        },
      },
      orderBy: { addedAt: "desc" },
    });

    return NextResponse.json({
      watchlist: items,
      currentCount: items.length,
      limit: isUnlimited ? null : FREE_WATCHLIST_LIMIT,
      isUnlimited,
      userTier: userState,
    });
  } catch (error: any) {
    console.error("Failed to fetch watchlist:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching watchlist." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/watchlist
 * Toggles or adds a movie to the authenticated user's watchlist.
 * 
 * Enforces Tier Constraints:
 * - Guest: 401 Unauthorized (Frontend opens Auth Modal)
 * - Free User: Maximum 5 saved movies. 6th attempt returns 403 Forbidden with upgrade prompt.
 * - Paid Member & Admin: Unlimited saves.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json(
        {
          error: "Please sign in to save movies to your watchlist.",
          code: "AUTH_REQUIRED",
          requiresAuth: true,
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { movieId, action = "toggle" } = body;

    if (!movieId) {
      return NextResponse.json(
        { error: "Validation Error: 'movieId' is required." },
        { status: 400 }
      );
    }

    // Verify movie exists
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
      select: { id: true, title: true },
    });

    if (!movie) {
      return NextResponse.json(
        { error: `Movie with id '${movieId}' not found.` },
        { status: 404 }
      );
    }

    const userState = resolveUserState(user);
    const isUnlimited = userState === "paid_member" || userState === "admin";

    // Check if the movie is already saved in the user's watchlist
    const existingEntry = await prisma.watchlist.findUnique({
      where: {
        userId_movieId: {
          userId: user.id,
          movieId,
        },
      },
    });

    // If already bookmarked and action is toggle or remove, remove it
    if (existingEntry && (action === "toggle" || action === "remove")) {
      await prisma.watchlist.delete({
        where: { id: existingEntry.id },
      });

      const remainingCount = await prisma.watchlist.count({
        where: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        action: "removed",
        inWatchlist: false,
        movieTitle: movie.title,
        currentCount: remainingCount,
        maxAllowed: isUnlimited ? null : FREE_WATCHLIST_LIMIT,
        isUnlimited,
      });
    }

    // If already bookmarked and action is "add", return current state
    if (existingEntry && action === "add") {
      const currentCount = await prisma.watchlist.count({
        where: { userId: user.id },
      });

      return NextResponse.json({
        success: true,
        action: "already_present",
        inWatchlist: true,
        currentCount,
        isUnlimited,
      });
    }

    // Movie is not in watchlist -> Attempting to save
    const currentCount = await prisma.watchlist.count({
      where: { userId: user.id },
    });

    // Enforce Free Tier limit (5/5)
    if (!isUnlimited && currentCount >= FREE_WATCHLIST_LIMIT) {
      return NextResponse.json(
        {
          error: "Free limit reached (5/5). Upgrade to Member for unlimited watchlists.",
          code: "WATCHLIST_LIMIT_REACHED",
          currentCount,
          maxAllowed: FREE_WATCHLIST_LIMIT,
          userTier: userState,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }

    // Save to watchlist
    await prisma.watchlist.create({
      data: {
        userId: user.id,
        movieId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        action: "added",
        inWatchlist: true,
        movieTitle: movie.title,
        currentCount: currentCount + 1,
        maxAllowed: isUnlimited ? null : FREE_WATCHLIST_LIMIT,
        isUnlimited,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Watchlist modification error:", error);
    return NextResponse.json(
      { error: "Internal Server Error modifying watchlist." },
      { status: 500 }
    );
  }
}
