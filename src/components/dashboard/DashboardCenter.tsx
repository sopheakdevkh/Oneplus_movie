"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Bell,
  ChevronDown,
  Play,
  Download,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Flame,
  Film,
  Search,
  X,
} from "lucide-react";
import { MovieData, UserProfile, HERO_SPIDERMAN, RECOMMENDED_MOVIES } from "@/lib/movies";

interface DashboardCenterProps {
  activeCategory: string;
  onCategoryChange: (cat: string) => void;
  activeProfile: UserProfile;
  recommendedMovies?: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

const CATEGORIES = ["Movies", "Tv series", "Animation", "More"];

export default function DashboardCenter({
  activeCategory,
  onCategoryChange,
  activeProfile,
  recommendedMovies = RECOMMENDED_MOVIES,
  onSelectMovie,
  searchQuery = "",
  onSearchChange,
}: DashboardCenterProps) {
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex-1 flex flex-col min-w-0 py-6 px-4 sm:px-6 lg:px-8 space-y-6 overflow-y-auto no-scrollbar">
      {/* 1. Top Bar: Category Filter Pills, Search Bar, Notification Bell & Profile Badge */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Category Filter Pills */}
        <div className="flex items-center space-x-2 sm:space-x-3 bg-[#161822] p-1.5 rounded-full border border-white/5">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-[#252836] text-white shadow-md font-bold"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Center/Right Search Bar */}
        {onSearchChange && (
          <div className="flex-1 max-w-sm min-w-[200px] relative">
            <div className="flex items-center bg-[#161822] border border-white/5 rounded-full px-4 py-2 focus-within:border-white/20 transition-all">
              <Search className="w-4 h-4 text-white/50 mr-2 flex-shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search movies..."
                className="bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none w-full"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange("")}
                  className="text-white/40 hover:text-white ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Top HUD: Bell & Profile Badge */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Bell Icon with Red Dot */}
          <button
            className="relative p-2.5 rounded-full bg-[#161822] border border-white/5 text-white/80 hover:text-white hover:bg-[#1E202B] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E50914] shadow-[0_0_8px_#E50914]" />
          </button>

          {/* User Profile Badge (Suriya sharma) */}
          <div className="flex items-center space-x-3 bg-[#161822] border border-white/5 py-1.5 px-3 rounded-full hover:bg-[#1E202B] transition-colors cursor-pointer select-none">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold">
              👤
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-white leading-tight">
                {activeProfile.name}
              </p>
              <p className="text-[10px] text-white/50 leading-tight">
                {activeProfile.handle || "@uxid.sharmaasd..."}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-white/60 ml-1" />
          </div>
        </div>
      </div>

      {/* 2. Featured Floating Theater Hero Card */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] md:aspect-[21/9] rounded-3xl overflow-hidden bg-[#161822] border border-white/10 shadow-2xl group select-none">
        {/* Backdrop Image */}
        <Image
          src={HERO_SPIDERMAN.bannerUrl || HERO_SPIDERMAN.posterUrl}
          alt={HERO_SPIDERMAN.title}
          fill
          priority
          unoptimized
          className="object-cover object-right-top transition-transform duration-700 group-hover:scale-105"
        />

        {/* Ambient Dark Gradient Vignette for Text Legibility */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Top Left Badge: 🔥 Now Trending */}
        <div className="absolute top-5 left-5 sm:top-6 sm:left-6 z-10 flex items-center space-x-2">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-xs font-bold text-white">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>Now Trending</span>
          </div>
        </div>

        {/* Card Content Overlay */}
        <div className="absolute inset-0 p-5 sm:p-7 md:p-8 flex flex-col justify-end max-w-xl space-y-2.5 sm:space-y-3 z-10">
          {/* Genre Pills */}
          <div className="flex items-center space-x-2 pt-8">
            {HERO_SPIDERMAN.genres.map((g) => (
              <span
                key={g.id}
                className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-semibold text-white/90 border border-white/10"
              >
                {g.name}
              </span>
            ))}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight whitespace-pre-line drop-shadow-md">
            {HERO_SPIDERMAN.title}
          </h2>

          {/* Description */}
          <p className="text-xs sm:text-sm text-white/80 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-md drop-shadow">
            {HERO_SPIDERMAN.description}
          </p>

          {/* Action Buttons Row */}
          <div className="flex items-center space-x-3 pt-2 sm:pt-3">
            {/* Primary ▶ Watch Button */}
            <button
              onClick={() => onSelectMovie(HERO_SPIDERMAN)}
              className="flex items-center space-x-2 px-5 sm:px-6 py-2.5 rounded-full bg-white text-black font-black text-xs sm:text-sm hover:bg-[#F2F2F2] hover:scale-105 active:scale-95 transition-all shadow-lg shadow-white/20"
            >
              <Play className="w-3.5 h-3.5 fill-black text-black ml-0.5" />
              <span>Watch</span>
            </button>

            {/* Download Button */}
            <button
              onClick={() => onSelectMovie(HERO_SPIDERMAN)}
              className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm backdrop-blur-md border border-white/15 active:scale-95 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            {/* More Options Button */}
            <button
              onClick={() => onSelectMovie(HERO_SPIDERMAN)}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/15 active:scale-95 transition-all"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Right Controls: Mute Toggle & U/A 13+ Certification */}
        <div className="absolute bottom-5 right-5 sm:bottom-7 sm:right-7 z-10 flex items-center space-x-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white backdrop-blur-md border border-white/15 transition-all"
            aria-label="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/15 text-[11px] font-bold text-white/90">
            {HERO_SPIDERMAN.certification}
          </span>
        </div>
      </div>

      {/* 3. Recommended Movies Section */}
      <div className="space-y-4 pt-1">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            Recommended movies
          </h3>
          <button className="text-xs text-white/60 hover:text-white transition-colors font-medium">
            See all
          </button>
        </div>

        {/* 4-Card Responsive Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {recommendedMovies.map((movie) => {
            const genre = movie.genres[0]?.name || "Sci-Fi";

            return (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg cursor-pointer hover:border-white/25 hover:scale-[1.03] transition-all duration-300 select-none"
              >
                {/* Poster Artwork */}
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  unoptimized
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Gradient Vignette for Card Info */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/40" />

                {/* Top Row: Age Certification & More Menu */}
                <div className="absolute top-3 inset-x-3 flex items-center justify-between z-10">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white/90">
                    {movie.certification}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMovie(movie);
                    }}
                    className="p-1 rounded-full bg-black/40 text-white/70 hover:text-white backdrop-blur-sm"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Bottom Overlay: Genre Pill, Title, Meta, and Circular Play Trigger */}
                <div className="absolute bottom-3 inset-x-3 z-10 flex items-end justify-between">
                  <div className="space-y-1 pr-2 max-w-[75%]">
                    {/* Genre Tag */}
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[9px] font-semibold text-white/90">
                      {genre}
                    </span>

                    {/* Movie Title */}
                    <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight leading-tight truncate">
                      {movie.title}
                    </h4>

                    {/* Meta string (IMDb 8.1 • 2h 10min • 2011) */}
                    <p className="text-[10px] text-white/60 font-medium truncate">
                      {movie.subMeta || `${movie.releaseYear} • ★ ${movie.rating.toFixed(1)}`}
                    </p>
                  </div>

                  {/* Circular Floating White Play Button */}
                  <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#E50914] group-hover:text-white transition-all flex-shrink-0">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
