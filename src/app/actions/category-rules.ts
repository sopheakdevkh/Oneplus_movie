"use server";

import { revalidatePath } from "next/cache";
import {
  CategoryAccessLevel,
  CatalogLimits,
  CategoryRulesConfig,
} from "@/lib/category-rules";
import {
  getCategoryRulesConfig,
  saveCategoryRulesConfig,
} from "@/lib/server-category-rules";
import { getGenresWithCounts } from "./genres";

export async function getCategoryRulesAction(): Promise<CategoryRulesConfig> {
  return getCategoryRulesConfig();
}

export async function updateCategoryRuleAction(
  slug: string,
  accessLevel: CategoryAccessLevel
) {
  try {
    const current = getCategoryRulesConfig();
    const updatedRules = {
      ...current.rules,
      [slug]: accessLevel,
    };

    const saved = saveCategoryRulesConfig({ rules: updatedRules });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/genres");

    return { success: true, config: saved };
  } catch (error: any) {
    console.error("Error updating category rule:", error);
    return { success: false, error: error?.message || "Failed to update category rule" };
  }
}

export async function batchUpdateCategoryRulesAction(
  rules: Record<string, CategoryAccessLevel>
) {
  try {
    const saved = saveCategoryRulesConfig({ rules });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/genres");

    return { success: true, config: saved };
  } catch (error: any) {
    console.error("Error batch updating category rules:", error);
    return { success: false, error: error?.message || "Failed to update category rules" };
  }
}

export async function updateCatalogLimitsAction(limits: Partial<CatalogLimits>) {
  try {
    const current = getCategoryRulesConfig();
    const updatedLimits: CatalogLimits = {
      guestCategoryLimit:
        limits.guestCategoryLimit !== undefined
          ? Math.max(1, Number(limits.guestCategoryLimit))
          : current.limits.guestCategoryLimit,
      guestSearchLimit:
        limits.guestSearchLimit !== undefined
          ? Math.max(1, Number(limits.guestSearchLimit))
          : current.limits.guestSearchLimit,
      freeSearchLimit:
        limits.freeSearchLimit !== undefined
          ? Math.max(1, Number(limits.freeSearchLimit))
          : current.limits.freeSearchLimit,
    };

    const saved = saveCategoryRulesConfig({ limits: updatedLimits });

    revalidatePath("/");
    revalidatePath("/admin/categories");
    revalidatePath("/admin/genres");

    return { success: true, config: saved };
  } catch (error: any) {
    console.error("Error updating catalog limits:", error);
    return { success: false, error: error?.message || "Failed to update catalog limits" };
  }
}
