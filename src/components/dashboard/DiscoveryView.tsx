"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { Compass, Play, Star, Film, Sparkles } from "lucide-react";
import { MovieData } from "@/lib/movies";

interface DiscoveryViewProps {
  allMovies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

const GENRE_FILTERS = [
  "All",
  "Action",
  "Sci-Fi",
  "Drama",
  "Animation",
  "Comedy",
  "Crime",
  "Fantasy",
];

export default function DiscoveryView({
  allMovies,
  onSelectMovie,
}: DiscoveryViewProps) {
  const [selectedGenre, setSelectedGenre] = useState("All");

  const filteredMovies = useMemo(() => {
    if (selectedGenre === "All") return allMovies;
    return allMovies.filter((m) =>
      m.genres.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase())
    );
  }, [allMovies, selectedGenre]);

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Compass className="w-5 h-5 text-[#E50914]" />
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Discovery
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-white/60">
            Explore all {allMovies.length} movies, original series, and animations in 4K HDR
          </p>
        </div>

        {/* Total Count Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-[#161822] border border-white/10 text-xs text-white/80 font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
          <span>{filteredMovies.length} Titles Available</span>
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pb-1">
        {GENRE_FILTERS.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]"
                  : "bg-[#161822] text-white/60 hover:text-white hover:bg-[#1E202B] border border-white/5"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Responsive Movie Grid */}
      {filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-5">
          {filteredMovies.map((movie) => {
            const primaryGenre = movie.genres[0]?.name || "Movie";

            return (
              <div
                key={movie.id}
                onClick={() => onSelectMovie(movie)}
                className="group relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#161822] border border-white/10 shadow-lg cursor-pointer hover:border-white/30 hover:scale-[1.03] transition-all duration-300 select-none"
              >
                {/* Poster Artwork */}
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 180px, (max-width: 1024px) 210px, 240px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Dark Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/20" />

                {/* Top Age Certification Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/15 text-[10px] font-bold text-white/90">
                    {movie.certification}
                  </span>
                </div>

                {/* Bottom Overlay Info & Circular Play Trigger */}
                <div className="absolute bottom-3 inset-x-3 z-10 flex items-end justify-between">
                  <div className="space-y-1 max-w-[75%]">
                    {/* Genre Tag */}
                    <span className="inline-block px-2 py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[9px] font-semibold text-white/90">
                      {primaryGenre}
                    </span>

                    {/* Title */}
                    <h4 className="font-bold text-white text-xs sm:text-sm tracking-tight leading-tight truncate">
                      {movie.title}
                    </h4>

                    {/* Rating & Year */}
                    <div className="flex items-center space-x-1.5 text-[10px] text-white/60">
                      <span>{movie.releaseYear}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-0.5 text-amber-400 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
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
      ) : (
        <div className="text-center py-24 text-white/50 space-y-2">
          <Film className="w-12 h-12 mx-auto opacity-30 text-white" />
          <p className="font-bold text-white text-sm">No titles found for &quot;{selectedGenre}&quot;</p>
          <p className="text-xs">Try selecting &quot;All&quot; to view all titles in the library</p>
        </div>
      )}
    </div>
  );
}
