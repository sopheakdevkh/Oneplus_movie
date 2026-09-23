import React from "react";
import { getGenresWithCounts } from "@/app/actions/genres";
import { getCategoryRulesAction } from "@/app/actions/category-rules";
import CategoryRulesClient from "@/components/admin/CategoryRulesClient";

export const metadata = {
  title: "Category Access & Catalog Limits | LensImpact Film Club Admin",
  description: "Manage role-based category visibility, discovery limits, and search result caps.",
};

export default async function AdminCategoriesPage() {
  const [genres, config] = await Promise.all([
    getGenresWithCounts(),
    getCategoryRulesAction(),
  ]);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <CategoryRulesClient initialConfig={config} genres={genres} />
    </div>
  );
}
