import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import prisma from "@/lib/db";

/**
 * Admin CMS Route: GET /api/admin/movies
 * Protected by requireRole(['admin']).
 */
export async function GET(request: NextRequest) {
  const authCheck = await requireRole(request, ["admin"]);
  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const movies = await prisma.movie.findMany({
      include: { genres: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      movies,
      total: movies.length,
      adminUser: authCheck.user.email,
    });
  } catch (error) {
    console.error("Failed to query admin movies:", error);
    return NextResponse.json({ error: "Failed to fetch movies." }, { status: 500 });
  }
}

/**
 * Admin CMS Route: POST /api/admin/movies
 *
 * Protected by requireRole(['admin']).
 * Blocks anyone who is not an Admin with HTTP 403 Forbidden.
 */
export async function POST(request: NextRequest) {
  // 1. Authorization Guard: Require 'admin' role
  const authCheck = await requireRole(request, ["admin"]);

  if (!authCheck.authorized) {
    return authCheck.response;
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      description,
      publicSynopsis,
      youtubeVideoId,
      premiumBreakdown,
      premiumResources,
      releaseYear = new Date().getFullYear(),
      duration = 120,
      rating = 8.5,
      certification = "PG-13",
      posterUrl,
      bannerUrl,
      videoUrl,
      genreIds = [],
    } = body;

    if (!title || !slug) {
      return NextResponse.json(
        { error: "Validation Error: 'title' and 'slug' are required fields." },
        { status: 400 }
      );
    }

    // 2. Persist curated film with separated public and premium fields
    const movie = await prisma.movie.create({
      data: {
        title,
        slug,
        description: description || publicSynopsis || title,
        publicSynopsis: publicSynopsis || description,
        youtubeVideoId: youtubeVideoId || null,
        premiumBreakdown: premiumBreakdown || null,
        premiumResources: premiumResources || null,
        releaseYear: Number(releaseYear),
        duration: Number(duration),
        rating: Number(rating),
        certification,
        posterUrl: posterUrl || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba",
        bannerUrl: bannerUrl || null,
        videoUrl: videoUrl || (youtubeVideoId ? `https://www.youtube.com/watch?v=${youtubeVideoId}` : null),
        genres: {
          connect: genreIds.map((id: string) => ({ id })),
        },
      },
      include: {
        genres: true,
      },
    });

    return NextResponse.json(
      {
        message: "Film created and curated successfully by Admin.",
        adminUser: authCheck.user.email,
        movie,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin movie creation error:", error);
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A movie with this slug already exists in catalog." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create movie record." },
      { status: 500 }
    );
  }
}
