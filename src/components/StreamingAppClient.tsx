"use client";

import React, { useState, useMemo } from "react";
import SidebarNav from "./SidebarNav";
import Header, { CategoryTab } from "./Header";
import TopRatedSection from "./TopRatedSection";
import MovieGridSection from "./MovieGridSection";
import MovieDetailsModal from "./MovieDetailsModal";
import { MovieData } from "../lib/movies";
import { getBannerBackdropUrl } from "../lib/cloudinary";

interface StreamingAppClientProps {
  topRatedMovies: MovieData[];
  actionMovies: MovieData[];
  allMovies: MovieData[];
  featuredMovie: MovieData;
}

export default function StreamingAppClient({
  topRatedMovies,
  actionMovies,
  allMovies,
  featuredMovie,
}: StreamingAppClientProps) {
  const [activeTab, setActiveTab] = useState("featured");
  const [activeCategory, setActiveCategory] = useState<CategoryTab>("Movies");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  // Filter movies for live search
  const filteredActionMovies = useMemo(() => {
    if (!searchQuery.trim()) return actionMovies;
    const q = searchQuery.toLowerCase().trim();
    return allMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.genres.some((g) => g.name.toLowerCase().includes(q))
    );
  }, [actionMovies, allMovies, searchQuery]);

  return (
    <div className="min-h-screen bg-black text-white flex select-none">
      {/* Fixed Left Sidebar */}
      <SidebarNav activeTab={activeTab} onTabSelect={setActiveTab} />

      {/* Main Content */}
      <div className="pl-0 md:pl-20 lg:pl-24 pb-20 md:pb-12 flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden bg-black">
        {/* Top Header */}
        <Header
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        <main className="flex-1 w-full space-y-6">
          {/* Section 1: Top Rated with overlapping numbers 1, 2, 3, 4 */}
          <TopRatedSection
            movies={topRatedMovies}
            onSelectMovie={setSelectedMovie}
          />

          {/* Section 2: Best of Action (2-row horizontal layout) */}
          <MovieGridSection
            title="Best of Action"
            movies={filteredActionMovies}
            onSelectMovie={setSelectedMovie}
          />
        </main>
      </div>

      {/* Detail / Trailer Preview Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        allMovies={allMovies}
        onSelectMovie={setSelectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
