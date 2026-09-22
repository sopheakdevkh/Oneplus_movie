"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Play, Plus, Star, Info } from "lucide-react";
import { MovieData, FEATURED_SLIDES } from "../lib/movies";

interface HeroBannerProps {
  slides?: MovieData[];
  onPlayMovie: (movie: MovieData) => void;
  onMoreInfo: (movie: MovieData) => void;
}

export default function HeroBanner({
  slides = FEATURED_SLIDES,
  onPlayMovie,
  onMoreInfo,
}: HeroBannerProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const activeSlide = slides[currentSlideIndex] || slides[0];

  // Auto slide advance every 8 seconds
  useEffect(() => {
    if (slides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  if (!activeSlide) return null;

  const genresText = activeSlide.genres.map((g) => g.name).join(" | ");

  return (
    <div className="relative w-full min-h-[580px] sm:min-h-[660px] lg:min-h-[760px] flex items-center select-none overflow-hidden">
      {/* Background Backdrop Image */}
      <div className="absolute inset-0 z-0">
        <Image
          key={activeSlide.id}
          src={activeSlide.bannerUrl || activeSlide.posterUrl}
          alt={activeSlide.title}
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover object-center animate-in fade-in duration-700 brightness-[0.85]"
        />

        {/* Cinematic Vignette Gradients */}
        {/* Left darkening for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        {/* Bottom smooth fade to content background */}
        <div className="absolute inset-x-0 bottom-0 h-44 sm:h-64 bg-gradient-to-t from-[#0B0B0E] via-[#0B0B0E]/80 to-transparent" />
        {/* Top subtle fade for header */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
      </div>

      {/* Hero Content Information Container */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-28 sm:pt-36 pb-16 flex flex-col justify-center">
        <div className="max-w-2xl space-y-3 sm:space-y-4">
          {/* Eyebrow / Kicker */}
          <div className="flex items-center space-x-2">
            <span className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-white/80 drop-shadow">
              {activeSlide.tagline || "Featured Original Series"}
            </span>
          </div>

          {/* Huge Cinematic Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] font-sans">
            {activeSlide.title}
          </h1>

          {/* Metadata Row: Genres | Star Rating */}
          <div className="flex items-center space-x-3 text-xs sm:text-sm text-white/90 font-medium">
            <span>{genresText}</span>
            <span className="text-white/40">•</span>
            <div className="flex items-center space-x-1.5 text-[#FFB800] font-bold">
              <Star className="w-4 h-4 fill-[#FFB800] text-[#FFB800]" />
              <span>{activeSlide.rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Synopsis Description */}
          <p className="text-sm sm:text-base md:text-lg text-white/80 max-w-xl line-clamp-3 leading-relaxed drop-shadow">
            {activeSlide.description}
          </p>

          {/* Action Buttons Row */}
          <div className="flex items-center space-x-3.5 sm:space-x-4 pt-3 sm:pt-5">
            {/* Primary Orange Play Now Button */}
            <button
              onClick={() => onPlayMovie(activeSlide)}
              className="flex items-center space-x-2.5 px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] active:scale-95 text-white font-black text-sm sm:text-base shadow-[0_0_30px_rgba(255,85,0,0.45)] transition-all duration-200 group"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-white text-white" />
              <span>Play Now</span>
            </button>

            {/* Secondary More Info Button */}
            <button
              onClick={() => onMoreInfo(activeSlide)}
              className="flex items-center space-x-2.5 px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm sm:text-base backdrop-blur-md border border-white/20 shadow-lg transition-all duration-200"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span>More Info</span>
            </button>
          </div>
        </div>

        {/* Carousel Slide Indicators at bottom */}
        {slides.length > 1 && (
          <div className="flex items-center justify-center space-x-2.5 pt-12 sm:pt-16">
            {slides.map((s, idx) => {
              const isActive = idx === currentSlideIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-8 sm:w-10 bg-[#FF5500] shadow-[0_0_10px_#FF5500]"
                      : "w-4 sm:w-6 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
