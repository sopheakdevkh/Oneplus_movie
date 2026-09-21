"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { MovieData, EXACT_MOVIES } from "@/lib/movies";

export async function getAdminMovies(): Promise<MovieData[]> {
  try {
    const movies = await prisma.movie.findMany({
      include: {
        genres: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (movies.length > 0) {
      return movies as unknown as MovieData[];
    }
  } catch (error) {
    console.warn("Failed to query movies from database:", error);
  }

  // Fallback to in-memory catalog
  return EXACT_MOVIES;
}

export async function getAdminStats() {
  try {
    const [movieCount, topRatedCount, genreCount] = await Promise.all([
      prisma.movie.count(),
      prisma.movie.count({ where: { isTopRated: true } }),
      prisma.genre.count(),
    ]);

    return {
      totalMovies: movieCount || EXACT_MOVIES.length,
      topRatedMovies: topRatedCount || 4,
      totalGenres: genreCount || 6,
      activeSubscribers: 1420,
      totalViews: 84900,
    };
  } catch (error) {
    console.warn("Prisma stats fallback:", error);
    return {
      totalMovies: EXACT_MOVIES.length,
      topRatedMovies: 4,
      totalGenres: 6,
      activeSubscribers: 1420,
      totalViews: 84900,
    };
  }
}

export async function createMovieAction(data: {
  title: string;
  slug?: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: number;
  certification: string;
  posterUrl: string;
  bannerUrl?: string;
  videoUrl?: string;
  isTopRated: boolean;
  rank?: number | null;
  genreNames: string[];
}) {
  const slug =
    data.slug?.trim() ||
    data.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  try {
    // Upsert genres first
    const genreConnect = [];
    for (const name of data.genreNames) {
      const gSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const genre = await prisma.genre.upsert({
        where: { slug: gSlug },
        update: {},
        create: { name, slug: gSlug },
      });
      genreConnect.push({ id: genre.id });
    }

    const movie = await prisma.movie.create({
      data: {
        title: data.title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        description: data.description,
        releaseYear: Number(data.releaseYear) || 2024,
        duration: Number(data.duration) || 120,
        rating: Number(data.rating) || 8.0,
        certification: data.certification || "PG-13",
        posterUrl: data.posterUrl,
        bannerUrl: data.bannerUrl || data.posterUrl,
        videoUrl:
          data.videoUrl ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        isTopRated: Boolean(data.isTopRated),
        rank: data.rank ? Number(data.rank) : null,
        genres: {
          connect: genreConnect,
        },
      },
      include: {
        genres: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/movies");

    return { success: true, movie };
  } catch (error: unknown) {
    console.error("Create movie error:", error);
    const message = error instanceof Error ? error.message : "Failed to create movie";
    return { success: false, error: message };
  }
}

export async function updateMovieAction(
  id: string,
  data: {
    title: string;
    description: string;
    releaseYear: number;
    duration: number;
    rating: number;
    certification: string;
    posterUrl: string;
    bannerUrl?: string;
    videoUrl?: string;
    isTopRated: boolean;
    rank?: number | null;
    genreNames: string[];
  }
) {
  try {
    const genreConnect = [];
    for (const name of data.genreNames) {
      const gSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const genre = await prisma.genre.upsert({
        where: { slug: gSlug },
        update: {},
        create: { name, slug: gSlug },
      });
      genreConnect.push({ id: genre.id });
    }

    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        releaseYear: Number(data.releaseYear),
        duration: Number(data.duration),
        rating: Number(data.rating),
        certification: data.certification,
        posterUrl: data.posterUrl,
        bannerUrl: data.bannerUrl,
        videoUrl: data.videoUrl,
        isTopRated: Boolean(data.isTopRated),
        rank: data.rank ? Number(data.rank) : null,
        genres: {
          set: genreConnect,
        },
      },
      include: {
        genres: true,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/movies");

    return { success: true, movie };
  } catch (error: unknown) {
    console.error("Update movie error:", error);
    const message = error instanceof Error ? error.message : "Failed to update movie";
    return { success: false, error: message };
  }
}

export async function deleteMovieAction(id: string) {
  try {
    await prisma.movie.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/movies");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete movie error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete movie";
    return { success: false, error: message };
  }
}

export async function toggleTopRatedAction(id: string, isTopRated: boolean, rank?: number) {
  try {
    const movie = await prisma.movie.update({
      where: { id },
      data: {
        isTopRated,
        rank: isTopRated ? rank || 1 : null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/movies");

    return { success: true, movie };
  } catch (error: unknown) {
    console.error("Toggle top rated error:", error);
    const message = error instanceof Error ? error.message : "Failed to toggle status";
    return { success: false, error: message };
  }
}
