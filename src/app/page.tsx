import {
  getHeroSlides,
  getTopRatedMovies,
  getActionMovies,
  getAllMovies,
  getFeaturedSpotlight,
} from "@/lib/server-movies";
import StreamingAppClient from "@/components/StreamingAppClient";

export default async function HomePage() {
  const [heroSlides, topRatedMovies, actionMovies, allMovies, featuredMovie] =
    await Promise.all([
      getHeroSlides(),
      getTopRatedMovies(),
      getActionMovies(),
      getAllMovies(),
      getFeaturedSpotlight(),
    ]);

  return (
    <StreamingAppClient
      heroSlides={heroSlides}
      topRatedMovies={topRatedMovies}
      actionMovies={actionMovies}
      allMovies={allMovies}
      featuredMovie={featuredMovie}
    />
  );
}
