import React from "react";
import { getAdminMovies } from "@/app/actions/movies";
import MovieTableClient from "@/components/admin/MovieTableClient";

export const metadata = {
  title: "Movies Catalog | LensImpact Film Club Admin",
  description: "Curate titles, ratings, video trailers, and certifications for LensImpact Film Club",
};

export default async function AdminMoviesPage() {
  const movies = await getAdminMovies();

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <MovieTableClient initialMovies={movies} />
    </div>
  );
}
