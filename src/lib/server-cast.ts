import fs from "fs";
import path from "path";
import { CastDataConfig, INITIAL_CAST_CONFIG, CastMember } from "./cast";

const DATA_FILE = path.join(process.cwd(), "src", "data", "cast-data.json");

function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
}

/**
 * Retrieves the full Cast & Crew configuration from persistent disk storage.
 * Server-only function.
 */
export function getCastDataConfig(): CastDataConfig {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        movies: {
          ...INITIAL_CAST_CONFIG.movies,
          ...(parsed.movies || {}),
        },
        defaultCast:
          Array.isArray(parsed.defaultCast) && parsed.defaultCast.length > 0
            ? parsed.defaultCast
            : INITIAL_CAST_CONFIG.defaultCast,
      };
    }
  } catch (error) {
    console.warn("Could not read cast-data.json, using defaults:", error);
  }

  return INITIAL_CAST_CONFIG;
}

/**
 * Persists the entire Cast & Crew configuration to disk.
 * Server-only function.
 */
export function saveCastDataConfig(
  config: Partial<CastDataConfig>
): CastDataConfig {
  const current = getCastDataConfig();
  const updated: CastDataConfig = {
    movies: {
      ...current.movies,
      ...(config.movies || {}),
    },
    defaultCast:
      config.defaultCast !== undefined ? config.defaultCast : current.defaultCast,
  };

  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to persist cast data to file:", error);
  }

  return updated;
}

/**
 * Saves or updates cast members for a specific movie title.
 */
export function saveMovieCast(
  movieTitle: string,
  cast: CastMember[]
): CastDataConfig {
  const current = getCastDataConfig();
  const updatedMovies = {
    ...current.movies,
    [movieTitle]: cast,
  };

  return saveCastDataConfig({
    movies: updatedMovies,
  });
}

/**
 * Deletes cast configuration for a specific movie title (falling back to default).
 */
export function deleteMovieCast(movieTitle: string): CastDataConfig {
  const current = getCastDataConfig();
  const updatedMovies = { ...current.movies };
  delete updatedMovies[movieTitle];

  try {
    ensureDirectoryExistence(DATA_FILE);
    fs.writeFileSync(
      DATA_FILE,
      JSON.stringify({ ...current, movies: updatedMovies }, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to delete movie cast from file:", error);
  }

  return {
    ...current,
    movies: updatedMovies,
  };
}
