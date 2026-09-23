import {
  getHeroSlides,
  getTopRatedMovies,
  getActionMovies,
  getAllMovies,
  getFeaturedSpotlight,
} from "@/lib/server-movies";
import { getCategoryRulesAction } from "@/app/actions/category-rules";
import { getCastConfigAction } from "@/app/actions/cast";
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
  ] = await Promise.all([
    getHeroSlides(),
    getTopRatedMovies(),
    getActionMovies(),
    getAllMovies(),
    getFeaturedSpotlight(),
    getCategoryRulesAction(),
    getCastConfigAction(),
  ]);

  return (
    <StreamingAppClient
      heroSlides={heroSlides}
      topRatedMovies={topRatedMovies}
      actionMovies={actionMovies}
      allMovies={allMovies}
      featuredMovie={featuredMovie}
      categoryRulesConfig={categoryRulesConfig}
      castConfig={castConfig}
    />
  );
}
