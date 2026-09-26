import fs from "fs";
import path from "path";
import { PromoBanner, DEFAULT_PROMOTIONS } from "./promotions";

const DATA_FILE = path.join(process.cwd(), "src", "data", "promotions.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Retrieves all promotions from persistent storage.
 */
export function getAllPromotions(): PromoBanner[] {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      }
    }
  } catch (error) {
    console.warn("Could not read promotions.json, falling back to defaults:", error);
  }

  // If no file exists yet, initialize with defaults
  saveAllPromotions(DEFAULT_PROMOTIONS);
  return DEFAULT_PROMOTIONS;
}

/**
 * Saves all promotions to persistent storage.
 */
export function saveAllPromotions(promotions: PromoBanner[]): boolean {
  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(promotions, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Failed to persist promotions.json:", error);
    return false;
  }
}

/**
 * Retrieves active promotions sorted by order for front-end display.
 */
export function getActivePromotions(): PromoBanner[] {
  const all = getAllPromotions();
  return all.filter((p) => p.isActive).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}
