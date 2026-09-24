import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "src", "data", "category-orders.json");

export const DEFAULT_CATEGORY_ORDERS: Record<string, number> = {
  "action": 1,
  "sci-fi": 2,
  "drama": 3,
  "crime": 4,
  "adventure": 5,
  "animation": 6,
  "comedy": 7,
  "thriller": 8,
  "fantasy": 9,
  "mindset-growth": 10,
  "leadership-resilience": 11,
};

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Retrieves category order numbering from persistent storage.
 */
export function getCategoryOrders(): Record<string, number> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_CATEGORY_ORDERS, ...parsed };
    }
  } catch (error) {
    console.warn("Could not read category-orders.json, using defaults:", error);
  }
  return { ...DEFAULT_CATEGORY_ORDERS };
}

/**
 * Persists updated category orders to disk.
 */
export function saveCategoryOrders(orders: Record<string, number>): Record<string, number> {
  const current = getCategoryOrders();
  const normalized: Record<string, number> = {};
  for (const [k, v] of Object.entries(orders)) {
    normalized[k] = v;
    normalized[k.toLowerCase()] = v;
  }
  const updated = { ...current, ...normalized };

  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save category-orders.json:", error);
  }

  return updated;
}
