"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { ensureDatabaseSeeded } from "@/lib/seed";
import { getCategoryOrders, saveCategoryOrders } from "@/lib/server-category-order";

export interface GenreWithCount {
  id: string;
  name: string;
  slug: string;
  order: number;
  _count?: {
    movies: number;
  };
}

export async function getGenresWithCounts(): Promise<GenreWithCount[]> {
  const orders = getCategoryOrders();

  try {
    let dbGenres = await prisma.genre.findMany({
      include: {
        _count: {
          select: { movies: true },
        },
      },
      orderBy: { name: "asc" },
    });

    // If database is empty, auto-seed with catalog genres
    if (dbGenres.length === 0) {
      await ensureDatabaseSeeded();
      dbGenres = await prisma.genre.findMany({
        include: {
          _count: {
            select: { movies: true },
          },
        },
        orderBy: { name: "asc" },
      });
    }

    const mapped: GenreWithCount[] = dbGenres.map((g, idx) => ({
      ...g,
      order: orders[g.slug] ?? orders[g.id] ?? (idx + 1),
    }));

    // Sort by order ascending, then by name
    mapped.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    return mapped;
  } catch (error) {
    console.warn("Failed to fetch genres from DB, using fallback:", error);
    const fallbackList = [
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
    return fallbackList.map((g, idx) => ({
      ...g,
      order: orders[g.slug] ?? (idx + 1),
    })).sort((a, b) => a.order - b.order);
  }
}

export async function createGenreAction(name: string, customSlug?: string, order?: number) {
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

    if (typeof order === "number" && !isNaN(order)) {
      saveCategoryOrders({ [slug]: order, [genre.id]: order });
    }

    revalidatePath("/admin/genres");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return {
      success: true,
      genre: {
        ...genre,
        order: typeof order === "number" ? order : 99,
      },
    };
  } catch (error: unknown) {
    console.error("Create genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to create genre";
    return { success: false, error: message };
  }
}

export async function updateGenreAction(id: string, name: string, customSlug?: string, order?: number) {
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

    if (typeof order === "number" && !isNaN(order)) {
      saveCategoryOrders({ [slug]: order, [id]: order });
    }

    revalidatePath("/admin/genres");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return {
      success: true,
      genre: {
        ...genre,
        order: typeof order === "number" ? order : 99,
      },
    };
  } catch (error: unknown) {
    console.error("Update genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to update genre";
    return { success: false, error: message };
  }
}

export async function updateGenreOrderAction(slugOrId: string, order: number) {
  try {
    saveCategoryOrders({ [slugOrId]: order });
    revalidatePath("/admin/genres");
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: unknown) {
    console.error("Update genre order error:", error);
    return { success: false, error: "Failed to update genre order" };
  }
}

export async function batchUpdateGenreOrdersAction(orders: Record<string, number>) {
  try {
    const updated = saveCategoryOrders(orders);
    revalidatePath("/admin/genres");
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true, orders: updated };
  } catch (error: unknown) {
    console.error("Batch update genre orders error:", error);
    return { success: false, error: "Failed to update genre orders" };
  }
}

export async function deleteGenreAction(id: string) {
  try {
    await prisma.genre.delete({
      where: { id },
    });

    revalidatePath("/admin/genres");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/movies");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete genre error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete genre";
    return { success: false, error: message };
  }
}
