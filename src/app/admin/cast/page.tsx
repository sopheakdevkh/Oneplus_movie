import React from "react";
import { getAdminMovies } from "@/app/actions/movies";
import { getCastConfigAction } from "@/app/actions/cast";
import CastManagementClient from "@/components/admin/CastManagementClient";

export const metadata = {
  title: "Cast & Crew Management | LensImpact Film Club Admin",
  description: "Dynamically configure lead actors, character roles, and avatars per movie or manage global fallback cast.",
};

export default async function AdminCastPage() {
  const [movies, castConfig] = await Promise.all([
    getAdminMovies(),
    getCastConfigAction(),
  ]);

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <CastManagementClient
        initialConfig={castConfig}
        movies={movies}
      />
    </div>
  );
}
