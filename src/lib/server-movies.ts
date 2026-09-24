import prisma from "./db";
import { MovieData } from "./movies";
import {
  enrichMovieWithMenuRoles,
  enrichMoviesWithMenuRoles,
} from "./server-menu-roles";

/**
 * Returns Top Rated movies directly from database.
 * No static or unmanaged movies are merged.
 */
export async function getTopRatedMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (dbMovies.length > 0) {
        return enrichMoviesWithMenuRoles(dbMovies as unknown as MovieData[]);
      }
    }
  } catch (error) {
    console.warn("Prisma top rated query fallback:", error);
  }

  return [];
}

/**
 * Returns movies ordered by rating directly from database.
 */
export async function getActionMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        include: { genres: true },
        orderBy: { rating: "desc" },
      });
      if (dbMovies.length > 0) {
        return enrichMoviesWithMenuRoles(dbMovies as unknown as MovieData[]);
      }
    }
  } catch (error) {
    console.warn("Prisma action query fallback:", error);
  }

  return [];
}

/**
 * Returns ALL movies managed in the database.
 * Does NOT merge any static or mock movies.
 */
export async function getAllMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        include: { genres: true },
        orderBy: { createdAt: "desc" },
      });
      if (dbMovies.length > 0) {
        return enrichMoviesWithMenuRoles(dbMovies as unknown as MovieData[]);
      }
    }
  } catch (error) {
    console.warn("Prisma all movies query fallback:", error);
  }

  return [];
}

/**
 * Returns the spotlight movie from the database (top-rated or highest-rated).
 */
export async function getFeaturedSpotlight(): Promise<MovieData | null> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovie = await prisma.movie.findFirst({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (dbMovie) {
        return enrichMovieWithMenuRoles(dbMovie as unknown as MovieData);
      }
      const anyMovie = await prisma.movie.findFirst({
        include: { genres: true },
        orderBy: { rating: "desc" },
      });
      if (anyMovie) {
        return enrichMovieWithMenuRoles(anyMovie as unknown as MovieData);
      }
    }
  } catch (error) {
    console.warn("Prisma featured spotlight query fallback:", error);
  }

  return null;
}

/**
 * Returns hero carousel slides from the database.
 * Defaults to top-rated movies or highest-rated movies in DB.
 */
export async function getHeroSlides(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbHero = await prisma.movie.findMany({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (dbHero.length > 0) {
        return enrichMoviesWithMenuRoles(dbHero as unknown as MovieData[]);
      }

      // Fallback: If no top-rated flag set, take the top 5 database movies
      const anyMovies = await prisma.movie.findMany({
        take: 5,
        include: { genres: true },
        orderBy: { rating: "desc" },
      });
      if (anyMovies.length > 0) {
        return enrichMoviesWithMenuRoles(anyMovies as unknown as MovieData[]);
      }
    }
  } catch (error) {
    console.warn("Prisma hero slides fallback:", error);
  }

  return [];
}
