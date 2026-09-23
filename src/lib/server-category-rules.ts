import fs from "fs";
import path from "path";
import {
  CategoryRulesConfig,
  DEFAULT_CATEGORY_RULES,
  DEFAULT_CATALOG_LIMITS,
} from "./category-rules";

const DATA_FILE = path.join(process.cwd(), "src", "data", "category-rules.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Retrieves category access rules and catalog discovery limits from disk.
 * Server-only function.
 */
export function getCategoryRulesConfig(): CategoryRulesConfig {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        rules: { ...DEFAULT_CATEGORY_RULES, ...(parsed.rules || {}) },
        limits: { ...DEFAULT_CATALOG_LIMITS, ...(parsed.limits || {}) },
      };
    }
  } catch (error) {
    console.warn("Could not read category-rules.json, using defaults:", error);
  }

  return {
    rules: { ...DEFAULT_CATEGORY_RULES },
    limits: { ...DEFAULT_CATALOG_LIMITS },
  };
}

/**
 * Persists category access rules and limits to disk.
 * Server-only function.
 */
export function saveCategoryRulesConfig(
  config: Partial<CategoryRulesConfig>
): CategoryRulesConfig {
  const current = getCategoryRulesConfig();
  const updated: CategoryRulesConfig = {
    rules: { ...current.rules, ...(config.rules || {}) },
    limits: { ...current.limits, ...(config.limits || {}) },
  };

  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist category rules:", error);
  }

  return updated;
}
