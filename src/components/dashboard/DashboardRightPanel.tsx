"use client";

import React from "react";
import Image from "next/image";
import { Search, Play, ArrowUpDown } from "lucide-react";
import {
  MovieData,
  RIGHT_TRENDING_CARDS,
  RIGHT_CONTINUE_WATCHING,
} from "@/lib/movies";

interface DashboardRightPanelProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  trendingCards?: MovieData[];
  continueWatching?: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

export default function DashboardRightPanel({
  searchQuery,
  onSearchChange,
  trendingCards = RIGHT_TRENDING_CARDS,
  continueWatching = RIGHT_CONTINUE_WATCHING,
  onSelectMovie,
}: DashboardRightPanelProps) {
  return (
    <aside className="w-80 lg:w-96 flex-shrink-0 flex flex-col py-6 px-4 sm:px-6 bg-[#0E0F14] border-l border-white/5 space-y-6 overflow-y-auto no-scrollbar select-none h-screen sticky top-0">
      {/* 1. Search Bar */}
      <div className="relative">
        <div className="flex items-center bg-[#181A22] border border-white/5 rounded-full px-4 py-2.5 focus-within:border-white/20 transition-all shadow-inner">
          <Search className="w-4 h-4 text-white/50 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search movies"
            className="bg-transparent text-xs sm:text-sm text-white placeholder-white/40 focus:outline-none w-full"
          />
        </div>
      </div>

      {/* 2. Trending Now Section */}
      <div className="space-y-3">
        {/* Header with Sort Filter */}
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Trending Now
          </h3>

          <div className="flex items-center space-x-1 text-[11px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer">
            <span>Sort by : <strong className="text-white">Today</strong></span>
            <ArrowUpDown className="w-3 h-3" />
          </div>
        </div>

        {/* 2 Big Trending Cards */}
        <div className="space-y-3">
          {trendingCards.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg cursor-pointer hover:border-white/25 hover:scale-[1.02] transition-all duration-300"
            >
              {/* Artwork Background */}
              <Image
                src={movie.bannerUrl || movie.posterUrl}
                alt={movie.title}
                fill
                unoptimized
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Dark Overlay Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30" />

              {/* Netflix Mini N Logo / Tagline */}
              <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-10">
                <span className="text-[#E50914] font-black text-sm drop-shadow">N</span>
              </div>

              {/* Center/Bottom Overlay Title & Tagline */}
              <div className="absolute bottom-3 left-3 z-10 max-w-[70%] space-y-0.5">
                <span className="text-[10px] font-bold text-white/60 uppercase tracking-widest block">
                  {movie.tagline || "NEW SERIES"}
                </span>
                <h4 className="font-black text-white text-sm sm:text-base tracking-wide uppercase truncate drop-shadow">
                  {movie.title}
                </h4>
              </div>

              {/* Bottom Right Circular Play Button */}
              <div className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:bg-[#E50914] group-hover:text-white transition-all">
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Continue Watching Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
          Continue Watching
        </h3>

        {/* List of 3 items */}
        <div className="space-y-2">
          {continueWatching.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectMovie(item)}
              className="group flex items-center justify-between p-2 rounded-2xl bg-[#161822]/60 hover:bg-[#1C1F2B] border border-white/5 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3 min-w-0 pr-2">
                {/* Square Rounded Thumbnail */}
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/60 flex-shrink-0 border border-white/10">
                  <Image
                    src={item.posterUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>

                {/* Show Title & Episode info */}
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-white/50 font-medium truncate">
                    {item.episode || "Episode"}
                  </p>
                </div>
              </div>

              {/* Circular Play Button */}
              <div className="w-7 h-7 rounded-full bg-white/10 text-white flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all flex-shrink-0">
                <Play className="w-3 h-3 fill-current ml-0.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
