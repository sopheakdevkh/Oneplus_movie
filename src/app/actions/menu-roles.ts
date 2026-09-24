"use server";

import { revalidatePath } from "next/cache";
import {
  MenuRolesConfig,
  MovieMenuRule,
  NavMenuTarget,
  MovieRoleAccess,
} from "@/lib/menu-roles";
import {
  getMenuRolesConfig,
  saveMovieMenuRule,
  batchSaveMovieMenuRules,
  enrichMoviesWithMenuRoles,
} from "@/lib/server-menu-roles";
import { getAllMovies } from "@/lib/server-movies";
import { MovieData } from "@/lib/movies";

/**
 * Fetch the latest menu & role access configuration.
 */
export async function getMenuRolesConfigAction(): Promise<MenuRolesConfig> {
  return getMenuRolesConfig();
}

/**
 * Update the menu display and role access for a single movie.
 */
export async function updateMovieMenuRoleAction(
  key: string,
  rule: MovieMenuRule
): Promise<{ success: boolean; config?: MenuRolesConfig; error?: string }> {
  try {
    const config = saveMovieMenuRule(key, rule);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/menus");
    revalidatePath("/admin/movies");

    return { success: true, config };
  } catch (error: any) {
    console.error("Error updating movie menu rule:", error);
    return { success: false, error: error?.message || "Failed to update rule" };
  }
}

/**
 * Batch update menu display and role access for multiple movies.
 */
export async function batchUpdateMenuRolesAction(
  rules: Record<string, MovieMenuRule>
): Promise<{ success: boolean; config?: MenuRolesConfig; error?: string }> {
  try {
    const config = batchSaveMovieMenuRules(rules);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/menus");
    revalidatePath("/admin/movies");

    return { success: true, config };
  } catch (error: any) {
    console.error("Error batch updating movie menu rules:", error);
    return { success: false, error: error?.message || "Failed to update rules" };
  }
}

/**
 * Fetches all movies from DB or fallback catalog, enriched with their menu and role assignments.
 */
export async function getEnrichedMoviesAction(): Promise<MovieData[]> {
  try {
    const movies = await getAllMovies();
    return enrichMoviesWithMenuRoles(movies);
  } catch (error) {
    console.error("Failed to fetch enriched movies:", error);
    return [];
  }
}
