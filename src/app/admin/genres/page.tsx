import React from "react";
import { getGenresWithCounts } from "@/app/actions/genres";
import GenreManagerClient from "@/components/admin/GenreManagerClient";

export const metadata = {
  title: "Manage Genres | Oneplus Movie Admin",
};

export default async function AdminGenresPage() {
  const genres = await getGenresWithCounts();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Genre Categories
        </h1>
        <p className="text-xs text-[#8E8E93] mt-1">
          Catalog genres and total associated streaming titles.
        </p>
      </div>

      <GenreManagerClient initialGenres={genres} />
    </div>
  );
}
