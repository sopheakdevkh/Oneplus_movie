"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/seed";

export interface GenreWithCount {
  id: string;
  name: string;
  slug: string;
  _count?: {
    movies: number;
  };
}

export async function getGenresWithCounts(): Promise<GenreWithCount[]> {
  try {
    let genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { movies: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // If database is empty, auto-seed with catalog genres
    if (genres.length === 0) {
      await ensureDatabaseSeeded();
      genres = await prisma.genre.findMany({
        include: {
          _count: {
            select: { movies: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    return genres;
  } catch (error) {
    console.warn("Failed to fetch genres from DB, using fallback:", error);
    return [
      { id: "1", name: "Action", slug: "action", _count: { movies: 12 } },
      { id: "2", name: "Sci-Fi", slug: "sci-fi", _count: { movies: 6 } },
      { id: "3", name: "Drama", slug: "drama", _count: { movies: 4 } },
      { id: "4", name: "Crime", slug: "crime", _count: { movies: 5 } },
      { id: "5", name: "Adventure", slug: "adventure", _count: { movies: 4 } },
      { id: "6", name: "Animation", slug: "animation", _count: { movies: 3 } },
      { id: "7", name: "Comedy", slug: "comedy", _count: { movies: 2 } },
      { id: "8", name: "Thriller", slug: "thriller", _count: { movies: 6 } },
      { id: "9", name: "Fantasy", slug: "fantasy", _count: { movies: 3 } },
    ];
  }
}

export async function createGenreAction(name: string, customSlug?: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Genre name cannot be empty" };
  }

  const slug = (customSlug?.trim() || trimmed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const genre = await prisma.genre.upsert({
      where: { slug },
      update: { name: trimmed },
      create: {
        name: trimmed,
        slug,
      },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return { success: true, genre };
  } catch (error: unknown) {
    console.error("Create genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to create genre";
    return { success: false, error: message };
  }
}

export async function updateGenreAction(id: string, name: string, customSlug?: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Genre name cannot be empty" };
  }

  const slug = (customSlug?.trim() || trimmed)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const genre = await prisma.genre.update({
      where: { id },
      data: {
        name: trimmed,
        slug,
      },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return { success: true, genre };
  } catch (error: unknown) {
    console.error("Update genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to update genre";
    return { success: false, error: message };
  }
}

export async function deleteGenreAction(id: string) {
  try {
    await prisma.genre.delete({
      where: { id },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete genre";
    return { success: false, error: message };
  }
}
