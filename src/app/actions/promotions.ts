"use server";

import { revalidatePath } from "next/cache";
import { PromoBanner } from "@/lib/promotions";
import {
  getAllPromotions,
  saveAllPromotions,
  getActivePromotions,
} from "@/lib/server-promotions";

/**
 * Fetch all promotions for the admin manager.
 */
export async function getPromotionsAction(): Promise<PromoBanner[]> {
  return getAllPromotions();
}

/**
 * Fetch only active promotions for public streaming layout.
 */
export async function getActivePromotionsAction(): Promise<PromoBanner[]> {
  return getActivePromotions();
}

/**
 * Create a new promotional / advertisement banner.
 */
export async function createPromotionAction(
  data: Omit<PromoBanner, "id" | "order" | "createdAt" | "updatedAt">
): Promise<{ success: boolean; promotion?: PromoBanner; error?: string }> {
  try {
    const list = getAllPromotions();
    const newId = `promo-${Date.now()}`;
    const nextOrder = list.length > 0 ? Math.max(...list.map((p) => p.order || 0)) + 1 : 1;

    const newPromo: PromoBanner = {
      ...data,
      id: newId,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    list.push(newPromo);
    saveAllPromotions(list);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/promotions");
    revalidatePath("/admin/hero");

    return { success: true, promotion: newPromo };
  } catch (error: unknown) {
    console.error("Create promotion action error:", error);
    const msg = error instanceof Error ? error.message : "Failed to create banner";
    return { success: false, error: msg };
  }
}

/**
 * Update an existing promotional banner.
 */
export async function updatePromotionAction(
  id: string,
  data: Partial<Omit<PromoBanner, "id" | "createdAt">>
): Promise<{ success: boolean; promotion?: PromoBanner; error?: string }> {
  try {
    const list = getAllPromotions();
    const index = list.findIndex((p) => p.id === id);

    if (index === -1) {
      return { success: false, error: "Promotion banner not found." };
    }

    const updated: PromoBanner = {
      ...list[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    list[index] = updated;
    saveAllPromotions(list);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/promotions");
    revalidatePath("/admin/hero");

    return { success: true, promotion: updated };
  } catch (error: unknown) {
    console.error("Update promotion action error:", error);
    const msg = error instanceof Error ? error.message : "Failed to update banner";
    return { success: false, error: msg };
  }
}

/**
 * Toggle active status of a banner.
 */
export async function togglePromotionActiveAction(
  id: string,
  isActive: boolean
): Promise<{ success: boolean; error?: string }> {
  return updatePromotionAction(id, { isActive });
}

/**
 * Delete a promotion banner.
 */
export async function deletePromotionAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const list = getAllPromotions();
    const filtered = list.filter((p) => p.id !== id);

    // Re-normalize order
    filtered.forEach((p, idx) => {
      p.order = idx + 1;
    });

    saveAllPromotions(filtered);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/promotions");
    revalidatePath("/admin/hero");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete promotion action error:", error);
    const msg = error instanceof Error ? error.message : "Failed to delete banner";
    return { success: false, error: msg };
  }
}

/**
 * Reorder promotion banners.
 */
export async function reorderPromotionsAction(
  orderedIds: string[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const list = getAllPromotions();
    const map = new Map(list.map((p) => [p.id, p]));

    const reordered: PromoBanner[] = [];
    orderedIds.forEach((id, idx) => {
      const item = map.get(id);
      if (item) {
        item.order = idx + 1;
        reordered.push(item);
      }
    });

    // Add any remaining
    list.forEach((item) => {
      if (!orderedIds.includes(item.id)) {
        item.order = reordered.length + 1;
        reordered.push(item);
      }
    });

    saveAllPromotions(reordered);

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/promotions");
    revalidatePath("/admin/hero");

    return { success: true };
  } catch (error: unknown) {
    console.error("Reorder promotions action error:", error);
    const msg = error instanceof Error ? error.message : "Failed to reorder banners";
    return { success: false, error: msg };
  }
}
