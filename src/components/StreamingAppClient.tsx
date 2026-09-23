"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import StreamPulseHeader, { NavTab } from "./Navigation";
import HeroBanner from "./HeroBanner";
import ContinueWatchingSection from "./ContinueWatchingSection";
import StreamPulseFooter from "./StreamPulseFooter";
import MovieDetailsModal from "./MovieDetailsModal";
import {
  MovieData,
  CONTINUE_WATCHING,
  FEATURED_SLIDES,
} from "../lib/movies";
import Image from "next/image";
import { Star, Play, Film, Loader2, Lock, Crown, ArrowRight } from "lucide-react";
import CategoryCatalog from "./CategoryCatalog";
import { useAuth } from "@/context/AuthContext";
import { CategoryRulesConfig } from "@/lib/category-rules";
import { CastDataConfig } from "@/lib/cast";

interface StreamingAppClientProps {
  heroSlides?: MovieData[];
  topRatedMovies: MovieData[];
  actionMovies: MovieData[];
  allMovies: MovieData[];
  featuredMovie: MovieData;
  categoryRulesConfig?: CategoryRulesConfig;
  castConfig?: CastDataConfig;
}

export default function StreamingAppClient({
  heroSlides,
  topRatedMovies,
  actionMovies,
  allMovies,
  featuredMovie,
  categoryRulesConfig,
  castConfig,
}: StreamingAppClientProps) {
  const { user, isAuthenticated, userState, openAuthModal } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>("Browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieData | null>(null);

  // Real user watch history & watchlist items fetched from backend
  const [userWatchHistory, setUserWatchHistory] = useState<MovieData[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      setUserWatchHistory([]);
      return;
    }

    let isMounted = true;
    setIsLoadingHistory(true);

    fetch("/api/watch-history")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch watch history");
        return res.json();
      })
      .then((data) => {
        if (isMounted && Array.isArray(data?.movies)) {
          setUserWatchHistory(data.movies);
        }
      })
      .catch((err) => {
        console.warn("Could not load user watch history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, activeTab]);

  // Filter movies for live search with tiered limits
  const { limitedSearchResults, hiddenSearchCount } = useMemo(() => {
    if (!searchQuery.trim()) return { limitedSearchResults: [], hiddenSearchCount: 0 };
    const q = searchQuery.toLowerCase().trim();
    const allMatches = allMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.genres.some((g) => g.name.toLowerCase().includes(q))
    );

    const isGuest = userState === "guest";
    const isFree = userState === "free_user";

    const cap = isGuest
      ? (categoryRulesConfig?.limits.guestSearchLimit ?? 4)
      : isFree
      ? (categoryRulesConfig?.limits.freeSearchLimit ?? 8)
      : Infinity;

    return {
      limitedSearchResults: allMatches.slice(0, cap),
      hiddenSearchCount: Math.max(0, allMatches.length - cap),
    };
  }, [allMovies, searchQuery, userState, categoryRulesConfig]);

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
      return userWatchHistory;
    }
    return null; // Standard Browse view
  }, [activeTab, allMovies, topRatedMovies, userWatchHistory]);

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
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Search Results for <span className="text-[#FF5500]">&quot;{searchQuery}&quot;</span>
              </h2>
              {userState === "guest" && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/60">
                  Guest Preview (Capped at {categoryRulesConfig?.limits.guestSearchLimit || 4})
                </span>
              )}
            </div>

            {limitedSearchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 min-[1920px]:grid-cols-8 gap-4 sm:gap-5 lg:gap-6">
                {limitedSearchResults.map((m) => {
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
              <div>
                <div className="flex items-center space-x-2.5 mb-1">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {activeTab}
                  </h2>
                  {activeTab === "My List" && (
                    <span className="px-2 py-0.5 rounded-full bg-[#EB0029]/15 text-[#EB0029] border border-[#EB0029]/30 text-[10px] font-black uppercase tracking-wider">
                      Saved Queue
                    </span>
                  )}
                  {activeTab === "New & Popular" && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-400/15 text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider">
                      Trending
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-[#8E8E93]">
                  {activeTab === "My List"
                    ? "Your personal bookmarked cinema queue and saved titles."
                    : activeTab === "TV Shows"
                    ? "Acclaimed episodic dramas, limited series, and philosophical sagas."
                    : activeTab === "Movies"
                    ? "Curated feature films, auteur cinema, and festival award-winners."
                    : activeTab === "New & Popular"
                    ? "High-rated spotlight releases and trending member favorites."
                    : "Explore full curated catalog in Ultra HD"}
                </p>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/70 self-start sm:self-center">
                {displayMovies.length} Titles
              </span>
            </div>

            {isLoadingHistory && activeTab === "My List" ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 border-2 border-[#EB0029] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-sm text-[#8E8E93] font-medium">Loading your watch history...</p>
              </div>
            ) : displayMovies.length > 0 ? (
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
            ) : (
              <div className="text-center py-20 px-4 max-w-md mx-auto text-[#8E8E93]">
                <Film className="w-12 h-12 mx-auto mb-3 opacity-30 text-white" />
                <h3 className="text-base font-bold text-white mb-1">
                  {activeTab === "My List" ? "Your watch history queue is empty" : `No titles found in ${activeTab}`}
                </h3>
                <p className="text-xs text-[#8E8E93] mb-6">
                  {activeTab === "My List"
                    ? "Start watching films or save titles to your queue. They will automatically appear here so you can pick up right where you left off."
                    : "Check back later for new releases added to this category."}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab("Browse")}
                  className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#EB0029] to-[#FF5500] text-white text-xs font-bold hover:brightness-110 shadow-lg shadow-[#EB0029]/20 transition-all cursor-pointer"
                >
                  Explore Catalog
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Full Browse Experience (Matching StreamPulse Reference Screenshot) */
          <>
            {/* 1. Cinematic Hero Banner */}
            <HeroBanner
              slides={heroSlides && heroSlides.length > 0 ? heroSlides : FEATURED_SLIDES}
              onPlayMovie={(movie) => setSelectedMovie(movie)}
              onMoreInfo={(movie) => setSelectedMovie(movie)}
            />

            {/* 2. Continue Watching for Sarah */}
            <ContinueWatchingSection
              items={CONTINUE_WATCHING}
              onSelectMovie={(movie) => setSelectedMovie(movie)}
            />

            {/* 3. Category-Based Shelves (auto-grouped from allMovies) */}
            <CategoryCatalog
              movies={allMovies}
              categoryRules={categoryRulesConfig?.rules}
              catalogLimits={categoryRulesConfig?.limits}
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
        castConfig={castConfig}
        onSelectMovie={setSelectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
