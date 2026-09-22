import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-middleware";
import prisma from "@/lib/db";

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/movies/[id]
 * Protected: requireRole(['admin'])
 */
export async function GET(request: NextRequest, { params }: Params) {
  const authCheck = await requireRole(request, ["admin"]);
  if (!authCheck.authorized) return authCheck.response;

  const { id } = await params;
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { genres: true },
  });

  if (!movie) {
    return NextResponse.json({ error: "Movie not found" }, { status: 404 });
  }

  return NextResponse.json({ movie });
}

/**
 * PUT /api/admin/movies/[id]
 * Updates film CMS record with split public and member-only fields.
 * Protected: requireRole(['admin'])
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const authCheck = await requireRole(request, ["admin"]);
  if (!authCheck.authorized) return authCheck.response;

  const { id } = await params;

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
      releaseYear,
      duration,
      rating,
      certification,
      posterUrl,
      bannerUrl,
      videoUrl,
      genreIds,
    } = body;

    const dataToUpdate: any = {};
    if (title !== undefined) dataToUpdate.title = title;
    if (slug !== undefined) dataToUpdate.slug = slug;
    if (description !== undefined) dataToUpdate.description = description;
    if (publicSynopsis !== undefined) dataToUpdate.publicSynopsis = publicSynopsis;
    if (youtubeVideoId !== undefined) dataToUpdate.youtubeVideoId = youtubeVideoId;
    if (premiumBreakdown !== undefined) dataToUpdate.premiumBreakdown = premiumBreakdown;
    if (premiumResources !== undefined) dataToUpdate.premiumResources = premiumResources;
    if (releaseYear !== undefined) dataToUpdate.releaseYear = Number(releaseYear);
    if (duration !== undefined) dataToUpdate.duration = Number(duration);
    if (rating !== undefined) dataToUpdate.rating = Number(rating);
    if (certification !== undefined) dataToUpdate.certification = certification;
    if (posterUrl !== undefined) dataToUpdate.posterUrl = posterUrl;
    if (bannerUrl !== undefined) dataToUpdate.bannerUrl = bannerUrl;
    if (videoUrl !== undefined) dataToUpdate.videoUrl = videoUrl;

    if (Array.isArray(genreIds)) {
      dataToUpdate.genres = {
        set: genreIds.map((gId: string) => ({ id: gId })),
      };
    }

    const updated = await prisma.movie.update({
      where: { id },
      data: dataToUpdate,
      include: { genres: true },
    });

    return NextResponse.json({
      message: "Film updated successfully by Admin.",
      movie: updated,
      adminUser: authCheck.user.email,
    });
  } catch (error: any) {
    console.error("Film update error:", error);
    return NextResponse.json({ error: "Failed to update movie." }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/movies/[id]
 * Protected: requireRole(['admin'])
 */
export async function DELETE(request: NextRequest, { params }: Params) {
  const authCheck = await requireRole(request, ["admin"]);
  if (!authCheck.authorized) return authCheck.response;

  const { id } = await params;

  try {
    await prisma.movie.delete({ where: { id } });
    return NextResponse.json({ message: "Movie deleted successfully.", id });
  } catch (error: any) {
    console.error("Movie deletion error:", error);
    return NextResponse.json({ error: "Failed to delete movie." }, { status: 500 });
  }
}
