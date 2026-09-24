import {
  getHeroSlides,
  getTopRatedMovies,
  getActionMovies,
  getAllMovies,
  getFeaturedSpotlight,
} from "@/lib/server-movies";
import { getCategoryRulesAction } from "@/app/actions/category-rules";
import { getCastConfigAction } from "@/app/actions/cast";
import { getGenresWithCounts } from "@/app/actions/genres";
import StreamingAppClient from "@/components/StreamingAppClient";

export default async function HomePage() {
  const [
    heroSlides,
    topRatedMovies,
    actionMovies,
    allMovies,
    featuredMovie,
    categoryRulesConfig,
    castConfig,
    genres,
  ] = await Promise.all([
    getHeroSlides(),
    getTopRatedMovies(),
    getActionMovies(),
    getAllMovies(),
    getFeaturedSpotlight(),
    getCategoryRulesAction(),
    getCastConfigAction(),
    getGenresWithCounts(),
  ]);

  return (
    <StreamingAppClient
      heroSlides={heroSlides}
      topRatedMovies={topRatedMovies}
      actionMovies={actionMovies}
      allMovies={allMovies}
      genres={genres}
      featuredMovie={featuredMovie}
      categoryRulesConfig={categoryRulesConfig}
      castConfig={castConfig}
    />
  );
}
