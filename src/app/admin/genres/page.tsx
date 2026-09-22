import React from "react";
import { getGenresWithCounts } from "@/app/actions/genres";
import GenreManagerClient from "@/components/admin/GenreManagerClient";

export const metadata = {
  title: "Genres Management | LensImpact Film Club Admin",
  description: "Create, edit, and organize movie genre classifications",
};

export default async function AdminGenresPage() {
  const genres = await getGenresWithCounts();

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <GenreManagerClient initialGenres={genres} />
    </div>
  );
}
