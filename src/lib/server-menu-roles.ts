import fs from "fs";
import path from "path";
import {
  MenuRolesConfig,
  MovieMenuRule,
  DEFAULT_MENU_ROLES_CONFIG,
  resolveMovieRule,
  NavMenuTarget,
  MovieRoleAccess,
} from "./menu-roles";
import { MovieData } from "./movies";

const DATA_FILE = path.join(process.cwd(), "src", "data", "menu-roles.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Retrieves the full menu & role configuration from persistent storage.
 */
export function getMenuRolesConfig(): MenuRolesConfig {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        movies: {
          ...DEFAULT_MENU_ROLES_CONFIG.movies,
          ...(parsed.movies || {}),
        },
      };
    }
  } catch (error) {
    console.warn("Could not read menu-roles.json, falling back to defaults:", error);
  }

  return DEFAULT_MENU_ROLES_CONFIG;
}

/**
 * Persists the menu & role configuration to disk.
 */
export function saveMenuRolesConfig(config: Partial<MenuRolesConfig>): MenuRolesConfig {
  const current = getMenuRolesConfig();
  const updated: MenuRolesConfig = {
    movies: {
      ...current.movies,
      ...(config.movies || {}),
    },
  };

  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist menu-roles.json:", error);
  }

  return updated;
}

/**
 * Saves menu assignment and role access for a specific movie (by ID or title).
 */
export function saveMovieMenuRule(
  key: string,
  rule: MovieMenuRule
): MenuRolesConfig {
  const current = getMenuRolesConfig();
  const updatedMovies = {
    ...current.movies,
    [key]: rule,
  };

  return saveMenuRolesConfig({
    movies: updatedMovies,
  });
}

/**
 * Batch updates multiple movie menu & role rules.
 */
export function batchSaveMovieMenuRules(
  rules: Record<string, MovieMenuRule>
): MenuRolesConfig {
  const current = getMenuRolesConfig();
  const updatedMovies = {
    ...current.movies,
    ...rules,
  };

  return saveMenuRolesConfig({
    movies: updatedMovies,
  });
}

/**
 * Enriches a single movie with its assigned menus and role access.
 */
export function enrichMovieWithMenuRoles(
  movie: MovieData,
  config: MenuRolesConfig = getMenuRolesConfig()
): MovieData {
  const rule = resolveMovieRule(config, movie);
  return {
    ...movie,
    menus: rule.menus,
    roleAccess: rule.roleAccess,
  };
}

/**
 * Enriches a collection of movies with their assigned menus and role access.
 */
export function enrichMoviesWithMenuRoles(
  movies: MovieData[],
  config: MenuRolesConfig = getMenuRolesConfig()
): MovieData[] {
  return movies.map((m) => enrichMovieWithMenuRoles(m, config));
}
