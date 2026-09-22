"use client";

import React, { useState, useMemo } from "react";
import StreamPulseHeader, { NavTab } from "./StreamPulseHeader";
import HeroBanner from "./HeroBanner";
import ContinueWatchingSection from "./ContinueWatchingSection";
import TrendingNowSection from "./MovieSectionTwo";
import StreamPulseOriginalsSection from "./StreamPulseOriginalsSection";
import StreamPulseFooter from "./StreamPulseFooter";
import MovieDetailsModal from "./MovieDetailsModal";
import {
  MovieData,
  CONTINUE_WATCHING,
  STREAMPULSE_ORIGINALS,
  FEATURED_SLIDES,
} from "../lib/movies";
import Image from "next/image";
import { Star, Play, Film } from "lucide-react";
import MovieSectionOne from "./MovieSectionOne";
import MovieSectionTwo from "./MovieSectionTwo";

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
  const [activeTab, setActiveTab] = useState<NavTab>("Browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  // Filter movies for live search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.genres.some((g) => g.name.toLowerCase().includes(q))
    );
  }, [allMovies, searchQuery]);

  // Tab filtering
  const displayMovies = useMemo(() => {
    if (activeTab === "TV Shows") {
      return allMovies.filter((m) => m.type === "Series" || m.genres.some((g) => g.name === "Drama" || g.name === "Thriller"));
    }
    if (activeTab === "Movies") {
      return allMovies.filter((m) => m.type === "Movie" || !m.type);
    }
    if (activeTab === "New & Popular") {
      return topRatedMovies;
    }
    if (activeTab === "My List") {
      return allMovies.slice(0, 4);
    }
    return null; // Standard Browse view
  }, [activeTab, allMovies, topRatedMovies]);

  return (
    <div className="min-h-screen bg-[#0B0B0E] text-white flex flex-col select-none overflow-x-hidden">
      {/* Top StreamPulse Brand Header */}
      <StreamPulseHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main Content Body */}
      <main className="flex-1 w-full pb-8">
        {/* Search Results View */}
        {searchQuery.trim() ? (
          <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-32">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6">
              Search Results for <span className="text-[#FF5500]">&quot;{searchQuery}&quot;</span>
            </h2>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
                {searchResults.map((m) => {
                  const hours = Math.floor(m.duration / 60);
                  const mins = m.duration % 60;
                  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMovie(m)}
                      className="group cursor-pointer select-none"
                    >
                      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg group-hover:border-[#FF5500]/50 group-hover:scale-[1.03] transition-all duration-300">
                        <Image
                          src={m.posterUrl}
                          alt={m.title}
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <div className="w-11 h-11 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)]">
                            <Play className="w-5 h-5 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <div className="mt-2.5 px-0.5 space-y-0.5">
                        <h4 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">{m.title}</h4>
                        <div className="flex items-center space-x-2 text-xs text-[#8E8E93] font-medium">
                          <span>{m.releaseYear}</span>
                          <span className="text-white/30">•</span>
                          <div className="flex items-center space-x-1 text-[#FFB800] font-bold">
                            <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                            <span>{m.rating.toFixed(1)}</span>
                          </div>
                          <span className="text-white/30">•</span>
                          <span>{durationStr}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20 text-[#8E8E93]">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-40 text-white" />
                <p className="text-base font-semibold text-white">No titles matched your query</p>
                <p className="text-xs mt-1">Try searching by genre (Action, Sci-Fi, Drama) or title</p>
              </div>
            )}
          </div>
        ) : displayMovies ? (
          /* Category Filtered View - Full Width Matching Browse */
          <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-24 sm:pt-28 lg:pt-32">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                  {activeTab}
                </h2>
                <p className="text-xs sm:text-sm text-[#8E8E93] mt-1">
                  Explore full curated catalog in Ultra HD
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                {displayMovies.length} Titles
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
              {displayMovies.map((m) => {
                const hours = Math.floor(m.duration / 60);
                const mins = m.duration % 60;
                const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMovie(m)}
                    className="group cursor-pointer select-none"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg group-hover:border-[#FF5500]/50 group-hover:scale-[1.03] transition-all duration-300">
                      <Image
                        src={m.posterUrl}
                        alt={m.title}
                        fill
                        unoptimized
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <div className="w-11 h-11 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)]">
                          <Play className="w-5 h-5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="mt-2.5 px-0.5 space-y-0.5">
                      <h4 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">{m.title}</h4>
                      <div className="flex items-center space-x-2 text-xs text-[#8E8E93] font-medium">
                        <span>{m.releaseYear}</span>
                        <span className="text-white/30">•</span>
                        <div className="flex items-center space-x-1 text-[#FFB800] font-bold">
                          <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                          <span>{m.rating.toFixed(1)}</span>
                        </div>
                        <span className="text-white/30">•</span>
                        <span>{durationStr}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Full Browse Experience (Matching StreamPulse Reference Screenshot) */
          <>
            {/* 1. Cinematic Hero Banner */}
            <HeroBanner
              slides={FEATURED_SLIDES}
              onPlayMovie={(movie) => setSelectedMovie(movie)}
              onMoreInfo={(movie) => setSelectedMovie(movie)}
            />

            {/* 2. Continue Watching for Sarah */}
            <ContinueWatchingSection
              items={CONTINUE_WATCHING}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
            />

            {/* 3. Trending Now */}
            <MovieSectionOne
              movies={topRatedMovies}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
            />

            {/* 4. StreamPulse Originals */}
            <StreamPulseOriginalsSection
              movies={STREAMPULSE_ORIGINALS}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
            />

            {/* 5. Trending Now */}
            <MovieSectionTwo
              movies={topRatedMovies}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
            />
          </>
        )}
      </main>

      {/* StreamPulse Global Footer */}
      <StreamPulseFooter />

      {/* Detail / Trailer Playback Modal */}
      <MovieDetailsModal
        movie={selectedMovie}
        allMovies={allMovies}
        onSelectMovie={setSelectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
