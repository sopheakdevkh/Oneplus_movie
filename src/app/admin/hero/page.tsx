import React from "react";
import { getAdminMovies, getHeroBannerSlides } from "@/app/actions/movies";
import HeroManagerClient from "@/components/admin/HeroManagerClient";

export const metadata = {
  title: "Hero Banner Management | LensImpact Film Club Admin",
  description:
    "Curate featured movie slides, 15s mobile video previews, backdrop artwork, and carousel order.",
};

export default async function AdminHeroPage() {
  const [dbHeroSlides, allMovies] = await Promise.all([
    getHeroBannerSlides(),
    getAdminMovies(),
  ]);

  // Fallback to top database movies if no hero slides configured yet
  const initialHeroSlides =
    dbHeroSlides.length > 0 ? dbHeroSlides : allMovies.slice(0, 3);

  return <HeroManagerClient initialHeroSlides={initialHeroSlides} allMovies={allMovies} />;
}
