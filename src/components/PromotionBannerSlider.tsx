"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
  Pause,
  Play,
} from "lucide-react";
import { PromoBanner } from "@/lib/promotions";

interface PromotionBannerSliderProps {
  promotions: PromoBanner[];
  autoPlayInterval?: number; // ms, fast & responsive default 2000ms
  className?: string;
}

export default function PromotionBannerSlider({
  promotions = [],
  autoPlayInterval = 2000,
  className = "",
}: PromotionBannerSliderProps) {
  const activeSlides = promotions.filter((p) => p.isActive);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const count = activeSlides.length;

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
    setProgress(0);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
    setProgress(0);
  }, [count]);

  // Fast & smooth autoplay ticker and progress bar
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const stepMs = 20;
    const increment = (stepMs / autoPlayInterval) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          handleNext();
          return 0;
        }
        return prev + increment;
      });
    }, stepMs);

    return () => clearInterval(timer);
  }, [count, isPaused, autoPlayInterval, handleNext]);

  // Touch swipe support for mobile devices
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const distance = touchStartX.current - touchEndX.current;
      if (distance > 40) {
        handleNext();
      } else if (distance < -40) {
        handlePrev();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (count === 0) return null;

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];
  const hasTheme = Boolean(
    currentSlide.themeColor &&
    currentSlide.themeColor !== "none" &&
    currentSlide.themeColor !== "transparent"
  );
  const themeColor = hasTheme ? currentSlide.themeColor : null;

  return (
    <section className={`relative w-full px-3 sm:px-8 md:px-12 lg:px-16 py-3 sm:py-6 select-none ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2.5 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-2.5 min-w-0">
          <div
            className="p-1.5 rounded-lg border backdrop-blur-md shrink-0"
            style={{
              backgroundColor: themeColor ? `${themeColor}15` : "rgba(255, 255, 255, 0.05)",
              borderColor: themeColor ? `${themeColor}40` : "rgba(255, 255, 255, 0.1)",
              color: themeColor || "#ffffff",
            }}
          >
            <Megaphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-xl font-black text-white tracking-tight flex items-center gap-1.5 sm:gap-2">
              <span className="truncate">
                <span className="hidden xs:inline">Promotions</span>
              </span>
              <span
                className="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 sm:px-2 py-0.5 rounded-full border shrink-0"
                style={{
                  backgroundColor: themeColor ? `${themeColor}20` : "rgba(255, 255, 255, 0.08)",
                  borderColor: themeColor ? `${themeColor}40` : "rgba(255, 255, 255, 0.15)",
                  color: themeColor || "rgba(255, 255, 255, 0.8)",
                }}
              >
                Exclusive
              </span>
            </h2>
          </div>
        </div>

        {/* Prev / Next & Pause Controls */}
        {count > 1 && (
          <div className="flex items-center space-x-1 sm:space-x-1.5 shrink-0 ml-2">
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[#8E8E93] hover:text-white border border-white/5 transition-all text-xs"
              title={isPaused ? "Resume Autoplay" : "Pause Autoplay"}
              aria-label={isPaused ? "Play" : "Pause"}
            >
              {isPaused ? <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" /> : <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
              aria-label="Previous Slide"
            >
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 sm:p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95"
              aria-label="Next Slide"
            >
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Main Billboard Container - 2.5:1 Aspect Ratio Matching Widescreen Promotional Banners */}
      <div
        className="relative w-full rounded-xl sm:rounded-3xl overflow-hidden border border-white/10 bg-[#0E1017] shadow-2xl group aspect-[2.5/1] flex items-center"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          boxShadow: themeColor ? `0 10px 40px -15px ${themeColor}30` : undefined,
        }}
      >
        {/* Render all active slides with smooth crossfade */}
        {activeSlides.map((slide, idx) => {
          const isCurrent = idx === currentIndex;
          const hasError = imageErrors[slide.id];

          const slideContent = (
            <div className="relative w-full h-full">
              {slide.imageUrl && !hasError ? (
                <>
                  {/* Ambient background blur for edge blending */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <Image
                      src={slide.imageUrl}
                      alt=""
                      fill
                      unoptimized
                      referrerPolicy="no-referrer"
                      className="object-cover object-center blur-xl opacity-30 scale-105"
                    />
                  </div>
                  {/* Main graphic banner image: full width & height, 2.5:1 ratio preserves all banner text */}
                  <Image
                    src={slide.imageUrl}
                    alt={slide.title || "Promotional Banner"}
                    fill
                    priority={idx === 0}
                    unoptimized
                    referrerPolicy="no-referrer"
                    onError={() =>
                      setImageErrors((prev) => ({ ...prev, [slide.id]: true }))
                    }
                    className="object-cover object-center brightness-100 group-hover:scale-[1.01] transition-transform duration-500 ease-out"
                  />
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-[#12131C] via-[#1A1C28] to-[#0A0B10] flex items-center justify-center text-white/40 text-xs sm:text-sm font-medium">
                  Promotional Banner
                </div>
              )}
            </div>
          );

          if (slide.linkUrl) {
            return (
              <Link
                key={slide.id}
                href={slide.linkUrl}
                target={slide.linkUrl.startsWith("http") ? "_blank" : undefined}
                rel={slide.linkUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                className={`absolute inset-0 w-full h-full block cursor-pointer transition-opacity duration-500 ease-in-out ${
                  isCurrent ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
                aria-label={slide.title || "Promotional Banner"}
              >
                {slideContent}
              </Link>
            );
          }

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                isCurrent ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
              }`}
            >
              {slideContent}
            </div>
          );
        })}

        {/* Slide Indicators & Auto-progress along bottom */}
        {count > 1 && (
          <div className="absolute bottom-2 right-2 sm:bottom-4 sm:right-6 z-30 flex items-center space-x-1 sm:space-x-1.5 bg-black/80 backdrop-blur-md px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/10 shadow-lg scale-75 sm:scale-100 origin-bottom-right">
            {activeSlides.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setProgress(0);
                  }}
                  className={`relative h-1 sm:h-1.5 rounded-full overflow-hidden transition-all duration-300 ${
                    isActive ? "w-5 sm:w-8 bg-white/20" : "w-1.5 sm:w-2.5 bg-white/30 hover:bg-white/50"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                >
                  {isActive && (
                    <div
                      className="h-full transition-all ease-linear"
                      style={{
                        width: `${progress}%`,
                        backgroundColor: themeColor || "#ffffff",
                      }}
                    />
                  )}
                </button>
              );
            })}
            <span className="text-[8px] sm:text-[10px] font-mono text-white/80 ml-0.5">
              {currentIndex + 1}/{count}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
