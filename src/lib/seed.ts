import prisma from "./db";
import { EXACT_MOVIES } from "./movies";

export async function ensureDatabaseSeeded() {
  try {
    const movieCount = await prisma.movie.count();
    if (movieCount > 0) {
      return;
    }

    console.log("Seeding Neon PostgreSQL database with initial catalog...");

    for (const item of EXACT_MOVIES) {
      // Connect or create genres
      const genreConnect = [];
      for (const g of item.genres) {
        const genre = await prisma.genre.upsert({
          where: { slug: g.slug },
          update: {},
          create: { name: g.name, slug: g.slug },
        });
        genreConnect.push({ id: genre.id });
      }

      await prisma.movie.upsert({
        where: { slug: item.slug },
        update: {},
        create: {
          title: item.title,
          slug: item.slug,
          description: item.description,
          releaseYear: item.releaseYear,
          duration: item.duration,
          rating: item.rating,
          certification: item.certification,
          posterUrl: item.posterUrl,
          bannerUrl: item.bannerUrl || item.posterUrl,
          videoUrl:
            item.videoUrl ||
            "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
          isTopRated: item.isTopRated,
          rank: item.rank || null,
          genres: {
            connect: genreConnect,
          },
        },
      });
    }

    // Ensure common genres exist even if not attached yet
    const allCommonGenres = [
      { name: "Action", slug: "action" },
      { name: "Sci-Fi", slug: "sci-fi" },
      { name: "Drama", slug: "drama" },
      { name: "Crime", slug: "crime" },
      { name: "Adventure", slug: "adventure" },
      { name: "Animation", slug: "animation" },
      { name: "Comedy", slug: "comedy" },
      { name: "Thriller", slug: "thriller" },
      { name: "Fantasy", slug: "fantasy" },
    ];

    for (const cg of allCommonGenres) {
      await prisma.genre.upsert({
        where: { slug: cg.slug },
        update: {},
        create: { name: cg.name, slug: cg.slug },
      });
    }

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Auto-seed error:", error);
  }
}
