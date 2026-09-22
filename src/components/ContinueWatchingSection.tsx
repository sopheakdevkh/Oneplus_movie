"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { ContinueWatchingItem, MovieData } from "../lib/movies";
import { useAuth } from "@/context/AuthContext";

interface ContinueWatchingSectionProps {
  items: ContinueWatchingItem[];
  onSelectMovie: (movie: MovieData) => void;
}

export default function ContinueWatchingSection({
  items,
  onSelectMovie,
}: ContinueWatchingSectionProps) {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!items || items.length === 0) return null;

  const firstName = user?.name ? user.name.split(" ")[0] : null;
  const sectionTitle = firstName ? `Continue Watching for ${firstName}` : "Continue Watching";

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-5 sm:py-7">
      {/* Section Header with Title & Arrow Controls */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {sectionTitle}
        </h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => scroll("left")}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors border border-white/10 active:scale-90"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-colors border border-white/10 active:scale-90"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel List */}
      <div
        ref={scrollRef}
        className="flex space-x-4 sm:space-x-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {items.map((item) => {
          return (
            <div
              key={item.id}
              onClick={() => onSelectMovie(item.movie)}
              className="group flex-shrink-0 w-64 sm:w-72 md:w-80 cursor-pointer select-none"
            >
              {/* 16:9 Landscape Card with Progress Bar */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg group-hover:border-[#FF5500]/50 group-hover:scale-[1.02] transition-all duration-300">
                <Image
                  src={item.posterUrl}
                  alt={item.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 340px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Ambient dark gradient vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Center Hover Play Icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)]">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Progress Bar Container at bottom of card */}
                <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-[#FF5500] shadow-[0_0_8px_#FF5500]"
                    style={{ width: `${item.progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Card Metadata Below */}
              <div className="flex items-center justify-between mt-2.5 px-0.5">
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base tracking-tight truncate max-w-[180px]">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-[#8E8E93] font-medium">
                    {item.episode}
                  </p>
                </div>

                <span className="text-[11px] sm:text-xs text-[#8E8E93] font-medium whitespace-nowrap">
                  {item.progressPercent}% complete
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
