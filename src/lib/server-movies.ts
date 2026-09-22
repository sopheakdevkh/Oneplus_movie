import prisma from "./db";
import {
  MovieData,
  EXACT_MOVIES,
  TRENDING_MOVIES,
  FEATURED_SERIES,
} from "./movies";

export async function getTopRatedMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (dbMovies.length > 0) {
        // Merge with our trending list to ensure rich visual catalogue
        const dbList = dbMovies as unknown as MovieData[];
        const dbTitles = new Set(dbList.map((m) => m.title.toLowerCase()));
        const additions = TRENDING_MOVIES.filter((m) => !dbTitles.has(m.title.toLowerCase()));
        return [...dbList, ...additions];
      }
    }
  } catch (error) {
    console.warn("Prisma query fallback:", error);
  }

  return TRENDING_MOVIES;
}

export async function getActionMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        include: { genres: true },
        orderBy: { rating: "desc" },
      });
      if (dbMovies.length > 0) {
        return dbMovies as unknown as MovieData[];
      }
    }
  } catch (error) {
    console.warn("Prisma query fallback:", error);
  }

  return EXACT_MOVIES;
}

export async function getAllMovies(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbMovies = await prisma.movie.findMany({
        include: { genres: true },
        orderBy: { createdAt: "desc" },
      });
      if (dbMovies.length > 0) {
        const dbList = dbMovies as unknown as MovieData[];
        const dbTitles = new Set(dbList.map((m) => m.title.toLowerCase()));
        const additions = EXACT_MOVIES.filter((m) => !dbTitles.has(m.title.toLowerCase()));
        return [...dbList, ...additions];
      }
    }
  } catch (error) {
    console.warn("Prisma query fallback:", error);
  }

  return EXACT_MOVIES;
}

export async function getFeaturedSpotlight(): Promise<MovieData> {
  return FEATURED_SERIES;
}

export async function getHeroSlides(): Promise<MovieData[]> {
  try {
    if (process.env.DATABASE_URL) {
      const dbHero = await prisma.movie.findMany({
        where: { isTopRated: true },
        include: { genres: true },
        orderBy: { rank: "asc" },
      });
      if (dbHero.length > 0) {
        return dbHero as unknown as MovieData[];
      }
    }
  } catch (error) {
    console.warn("Prisma hero slides fallback:", error);
  }

  return FEATURED_SLIDES;
}
