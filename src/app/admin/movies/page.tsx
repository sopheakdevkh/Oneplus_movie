import React from "react";
import { getAdminMovies } from "@/app/actions/movies";
import MovieTableClient from "@/components/admin/MovieTableClient";

export const metadata = {
  title: "Manage Movies | Oneplus Movie Admin",
  description: "Create, edit, and curate movies on Oneplus Movie streaming catalog",
};

export default async function AdminMoviesPage() {
  const movies = await getAdminMovies();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Movies Catalog Management
        </h1>
        <p className="text-xs text-[#8E8E93] mt-1">
          Add new titles, edit ratings, adjust certification, and promote movies to the Top Rated section.
        </p>
      </div>

      <MovieTableClient initialMovies={movies} />
    </div>
  );
}
