"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star, Play, Film } from "lucide-react";
import { MovieData } from "../lib/movies";

function PosterImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1C1F2B] to-[#0F1015] p-4 text-center">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2">
          <Film className="w-5 h-5 text-[#FF5500]" />
        </div>
        <span className="font-bold text-white text-xs line-clamp-2 px-1">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      onError={() => setHasError(true)}
      sizes="(max-width: 640px) 180px, (max-width: 1024px) 210px, 240px"
      className="object-cover transition-transform duration-500 group-hover:scale-105"
    />
  );
}

interface MovieSectionThreeProps {
  movies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
  title?: string;
}

export default function MovieSectionThree({
  movies,
  onSelectMovie,
  title = "BEST AI",
}: MovieSectionThreeProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const offset = direction === "left" ? -320 : 320;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="w-full px-4 sm:px-8 md:px-12 lg:px-16 py-5 sm:py-7">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3.5 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          {title}
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

      {/* Horizontal Scroll of Vertical Poster Cards */}
      <div
        ref={scrollRef}
        className="flex space-x-4 sm:space-x-5 overflow-x-auto no-scrollbar scroll-smooth pb-2"
      >
        {movies.map((movie) => {
          const hours = Math.floor(movie.duration / 60);
          const mins = movie.duration % 60;
          const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

          return (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group flex-shrink-0 w-44 sm:w-48 md:w-56 cursor-pointer select-none"
            >
              {/* Vertical Card Poster */}
              <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg group-hover:border-[#FF5500]/50 group-hover:scale-[1.03] transition-all duration-300">
                <PosterImage src={movie.posterUrl} alt={movie.title} />

                {/* Subtle vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                {/* Hover Play Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
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
                  <span>{durationStr}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
