import React from "react";
import { getAdminMovies, getHeroBannerSlides } from "@/app/actions/movies";
import HeroManagerClient from "@/components/admin/HeroManagerClient";
import { FEATURED_SLIDES } from "@/lib/movies";

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

  // Fallback to default featured slides if no DB slides configured yet
  const initialHeroSlides =
    dbHeroSlides.length > 0 ? dbHeroSlides : FEATURED_SLIDES;

  return <HeroManagerClient initialHeroSlides={initialHeroSlides} allMovies={allMovies} />;
}
