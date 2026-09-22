"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Play, Sparkles } from "lucide-react";
import { MovieData } from "../lib/movies";

interface StreamPulseOriginalsSectionProps {
  movies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

export default function StreamPulseOriginalsSection({
  movies,
  onSelectMovie,
}: StreamPulseOriginalsSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -380 : 380;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-5 sm:py-7">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            MAKE YOU WANT TO WORK HARD
          </h2>
          <span className="hidden sm:inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-[#EB0028]/15 border border-[#EB0028]/30 text-[#EB0028] text-[10px] font-extrabold uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5" />
            <span>LensImpact Exclusive</span>
          </span>
        </div>

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
        {movies.map((movie) => {
          return (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group flex-shrink-0 w-64 sm:w-72 md:w-80 cursor-pointer select-none"
            >
              {/* 16:9 Stylized Original Card */}
              <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg group-hover:border-[#FF5500]/50 group-hover:scale-[1.02] transition-all duration-300">
                <Image
                  src={movie.bannerUrl || movie.posterUrl}
                  alt={movie.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 260px, (max-width: 1024px) 300px, 340px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark atmospheric overlay for title presentation */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />

                {/* 1+ Brand Mini Pill top left */}
                <div className="absolute top-3 left-3 flex items-center space-x-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-black text-[#EB0028]">
                  <span>1+ ORIGINAL</span>
                </div>

                {/* Stylized Center Display Title */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                  <span className="font-black text-lg sm:text-xl md:text-2xl text-white uppercase tracking-wider drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
                    {movie.title}
                  </span>
                </div>

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30 backdrop-blur-[2px]">
                  <div className="w-11 h-11 rounded-full bg-[#FF5500] text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,85,0,0.6)]">
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Metadata Line Below Card */}
              <div className="mt-2.5 px-0.5 space-y-0.5">
                <h3 className="font-bold text-white text-sm sm:text-base tracking-tight truncate">
                  {movie.title}
                </h3>

                <div className="flex items-center space-x-2 text-xs text-[#8E8E93] font-medium">
                  <span>{movie.releaseYear}</span>
                  <span className="text-white/30">•</span>
                  <div className="flex items-center space-x-1 text-[#FFB800] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-white/30">•</span>
                  <span>{movie.duration}m</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
