import {
  getTopRatedMovies,
  getActionMovies,
  getAllMovies,
  getFeaturedSpotlight,
} from "@/lib/movies";
import StreamingAppClient from "@/components/StreamingAppClient";

export default async function HomePage() {
  const [topRatedMovies, actionMovies, allMovies, featuredMovie] =
    await Promise.all([
      getTopRatedMovies(),
      getActionMovies(),
      getAllMovies(),
      getFeaturedSpotlight(),
    ]);

  return (
    <StreamingAppClient
      topRatedMovies={topRatedMovies}
      actionMovies={actionMovies}
      allMovies={allMovies}
      featuredMovie={featuredMovie}
    />
  );
}
