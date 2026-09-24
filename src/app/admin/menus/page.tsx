import React from "react";
import { getAdminMovies } from "@/app/actions/movies";
import { getMenuRolesConfigAction } from "@/app/actions/menu-roles";
import MenuManagerClient from "@/components/admin/MenuManagerClient";

export const metadata = {
  title: "Menu & Role Video Access | LensImpact Film Club Admin",
  description:
    "Manage movie and video display on TV Shows, Movies, and New & Popular navigation tabs by user role access.",
};

export default async function AdminMenuRolesPage() {
  const [movies, config] = await Promise.all([
    getAdminMovies(),
    getMenuRolesConfigAction(),
  ]);

  return <MenuManagerClient initialMovies={movies} initialConfig={config} />;
}
