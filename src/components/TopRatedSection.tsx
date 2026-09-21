"use client";

import React from "react";
import Image from "next/image";
import { Star, Film } from "lucide-react";
import { MovieData } from "../lib/movies";
import { getPosterCardUrl } from "../lib/cloudinary";

interface TopRatedSectionProps {
  movies: MovieData[];
  onSelectMovie: (movie: MovieData) => void;
}

export default function TopRatedSection({ movies, onSelectMovie }: TopRatedSectionProps) {
  // Display the top 4 rated movies in a clean grid
  const displayMovies = movies.slice(0, 4);

  return (
    <section className="w-full pt-2 sm:pt-4 pb-6 sm:pb-8">
      {/* Section Title */}
      <div className="px-4 sm:px-8 lg:px-12 mb-3.5 sm:mb-5">
        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-white">
          Top Rated
        </h2>
      </div>

      {/* 4-Card Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-8 lg:px-12">
        {displayMovies.map((movie, index) => {
          const genreName = movie.genres[0]?.name || "Action";
          const optimizedPoster = getPosterCardUrl(movie.posterUrl, 640, 400);

          return (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="group relative cursor-pointer select-none"
            >
              {/* Landscape Thumbnail Card without numbers */}
              <div className="relative w-full aspect-[16/10] rounded-2xl overflow-hidden bg-[#161820] shadow-lg transition-transform duration-300 group-hover:scale-[1.02]">
                <Image
                  src={optimizedPoster}
                  alt={movie.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover"
                  priority={index < 2}
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Bottom Right Badges: Film Icon + Genre & Certification */}
                <div className="absolute bottom-3 right-3 flex items-center space-x-2 z-10">
                  <div className="flex items-center space-x-1.5 px-2 py-1 rounded bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    <Film className="w-3.5 h-3.5 text-white/90" />
                    <span>{genreName}</span>
                  </div>

                  <div className="px-2 py-0.5 rounded border border-white/40 bg-black/40 backdrop-blur-md text-white text-[11px] font-semibold uppercase tracking-wider">
                    {movie.certification}
                  </div>
                </div>
              </div>

              {/* Title & Star Rating Below Card */}
              <div className="mt-3 pl-1 space-y-1">
                <h3 className="text-base font-bold text-white tracking-normal truncate">
                  {movie.title}
                </h3>

                <div className="flex items-center space-x-1.5">
                  <Star className="w-4 h-4 fill-[#FF9F0A] text-[#FF9F0A]" />
                  <span className="text-sm font-bold text-white">
                    {movie.rating.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
