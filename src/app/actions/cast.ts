"use server";

import { revalidatePath } from "next/cache";
import { CastDataConfig, CastMember } from "@/lib/cast";
import {
  getCastDataConfig,
  saveCastDataConfig,
  saveMovieCast,
  deleteMovieCast,
} from "@/lib/server-cast";

/**
 * Fetch the latest dynamic Cast & Crew configuration.
 */
export async function getCastConfigAction(): Promise<CastDataConfig> {
  return getCastDataConfig();
}

/**
 * Save custom cast list for a specific movie title.
 */
export async function saveMovieCastAction(
  movieTitle: string,
  cast: CastMember[]
): Promise<{ success: boolean; config: CastDataConfig }> {
  const updated = saveMovieCast(movieTitle, cast);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cast");
  revalidatePath("/admin/movies");

  return { success: true, config: updated };
}

/**
 * Delete cast list for a movie title (reverts to defaultCast).
 */
export async function deleteMovieCastAction(
  movieTitle: string
): Promise<{ success: boolean; config: CastDataConfig }> {
  const updated = deleteMovieCast(movieTitle);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cast");
  revalidatePath("/admin/movies");

  return { success: true, config: updated };
}

/**
 * Update the global fallback/default cast.
 */
export async function saveDefaultCastAction(
  defaultCast: CastMember[]
): Promise<{ success: boolean; config: CastDataConfig }> {
  const updated = saveCastDataConfig({ defaultCast });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cast");
  revalidatePath("/admin/movies");

  return { success: true, config: updated };
}

/**
 * Replace entire cast configuration.
 */
export async function saveAllCastConfigAction(
  config: CastDataConfig
): Promise<{ success: boolean; config: CastDataConfig }> {
  const updated = saveCastDataConfig(config);

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/cast");
  revalidatePath("/admin/movies");

  return { success: true, config: updated };
}
