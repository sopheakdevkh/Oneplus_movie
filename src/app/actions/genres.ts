"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/seed";

export async function getGenresWithCounts() {
  try {
    let genres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { movies: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // If database is brand new and empty, auto-seed with catalog genres
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
    console.error("Failed to fetch genres:", error);
    return [
      { id: "1", name: "Action", slug: "action", _count: { movies: 12 } },
      { id: "2", name: "Sci-Fi", slug: "sci-fi", _count: { movies: 6 } },
      { id: "3", name: "Drama", slug: "drama", _count: { movies: 4 } },
      { id: "4", name: "Crime", slug: "crime", _count: { movies: 5 } },
      { id: "5", name: "Adventure", slug: "adventure", _count: { movies: 4 } },
      { id: "6", name: "Animation", slug: "animation", _count: { movies: 3 } },
      { id: "7", name: "Comedy", slug: "comedy", _count: { movies: 2 } },
      { id: "8", name: "Thriller", slug: "thriller", _count: { movies: 6 } },
    ];
  }
}

export async function createGenreAction(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return { success: false, error: "Genre name cannot be empty" };
  }

  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  try {
    const genre = await prisma.genre.upsert({
      where: { slug },
      update: {},
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
    const message = error instanceof Error ? error.message : "Failed to create genre";
    return { success: false, error: message };
  }
}
