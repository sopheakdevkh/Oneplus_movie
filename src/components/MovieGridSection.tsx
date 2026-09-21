"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { MovieData } from "../lib/movies";
import { getPosterCardUrl } from "../lib/cloudinary";

interface MovieGridSectionProps {
  title: string;
  movies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

export default function MovieGridSection({
  title,
  movies,
  onSelectMovie,
}: MovieGridSectionProps) {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  // Split movies into 2 rows (4 cards per row, displaying 8 cards total per view)
  const half = Math.ceil(movies.length / 2);
  const row1Movies = movies.slice(0, half);
  const row2Movies = movies.slice(half);

  const handleScroll = (direction: "left" | "right") => {
    if (row1Ref.current && row2Ref.current) {
      // Scroll by exactly one viewport width (4 cards)
      const scrollAmount = (row1Ref.current.clientWidth + 24) * (direction === "left" ? -1 : 1);
      row1Ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
      row2Ref.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className="relative w-full pt-2 sm:pt-4 pb-10 sm:pb-14">
      {/* Section Header with Circular Arrow Navigation */}
      <div className="flex items-center justify-between px-4 sm:px-8 lg:px-12 mb-3.5 sm:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
          {title}
        </h2>

        {/* Circular Arrow Navigation Controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={() => handleScroll("left")}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#181920] text-white hover:bg-white/20 transition-all active:scale-95 shadow-lg"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>

          <button
            onClick={() => handleScroll("right")}
            className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#E5E7EB] text-black hover:bg-white transition-all active:scale-95 shadow-lg"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2-Row Horizontal Scrollable Grid */}
      <div className="space-y-4 sm:space-y-6">
        {/* Row 1: 4 cards visible across the screen on desktop */}
        <div
          ref={row1Ref}
          className="flex items-center gap-3.5 sm:gap-6 px-4 sm:px-8 lg:px-12 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {row1Movies.map((movie) => renderMovieCard(movie, onSelectMovie))}
        </div>

        {/* Row 2: 4 cards visible across the screen on desktop */}
        <div
          ref={row2Ref}
          className="flex items-center gap-3.5 sm:gap-6 px-4 sm:px-8 lg:px-12 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {row2Movies.map((movie) => renderMovieCard(movie, onSelectMovie))}
        </div>
      </div>
    </section>
  );
}

function renderMovieCard(
  movie: MovieData,
  onSelectMovie: (movie: MovieData) => void
) {
  const optimizedCard = getPosterCardUrl(movie.posterUrl, 640, 400);

  return (
    <div
      key={movie.id}
      onClick={() => onSelectMovie(movie)}
      className="group relative flex-shrink-0 w-[72vw] sm:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4.5rem)/4)] aspect-[16/10] rounded-2xl overflow-hidden bg-[#161820] cursor-pointer select-none transition-transform duration-300 hover:scale-[1.02] shadow-xl"
    >
      {/* Background Poster Image */}
      <Image
        src={optimizedCard}
        alt={movie.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        className="object-cover"
      />

      {/* Bottom Frosted Glass Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 p-4 pt-10 bg-gradient-to-t from-black/85 via-black/45 to-transparent backdrop-blur-[6px] flex flex-col justify-end">
        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-normal truncate mb-1">
          {movie.title}
        </h3>

        {/* Metadata: ⭐ 4.6 | Action • Movie */}
        <div className="flex items-center space-x-2 text-xs text-[#C5C5CE]">
          <div className="flex items-center space-x-1">
            <Star className="w-3.5 h-3.5 fill-[#FF9F0A] text-[#FF9F0A]" />
            <span className="font-bold text-white">{movie.rating.toFixed(1)}</span>
          </div>
          <span className="text-white/40">|</span>
          <span className="font-medium">Action • Movie</span>
        </div>
      </div>
    </div>
  );
}
