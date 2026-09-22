"use client";

import React from "react";
import Link from "next/link";

export function OnePlusSignSvg({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      className={className}
      role="img"
      aria-label="LensImpact Film Club Emblem"
    >
      {/* Red Rounded Square Base */}
      <rect x="10" y="10" width="80" height="80" rx="18" fill="#EB0029" />

      {/* Cinema Clapper Slanted Stripes (Top Edge) */}
      <path d="M 22 20 L 32 20 L 26 30 L 22 30 Z" fill="#FFFFFF" />
      <path d="M 40 20 L 50 20 L 44 30 L 34 30 Z" fill="#FFFFFF" />
      <path d="M 58 20 L 68 20 L 62 30 L 52 30 Z" fill="#FFFFFF" />
      <path d="M 76 20 L 78 20 L 78 24 L 72 30 L 70 30 Z" fill="#FFFFFF" />

      {/* Film Frame Divider Line */}
      <line x1="18" y1="33" x2="82" y2="33" stroke="#EB0029" strokeWidth="2" />

      {/* Play Symbol (Movie Element) */}
      <polygon points="42,44 42,72 66,58" fill="#FFFFFF" />

      {/* Floating Badge */}
      <circle cx="82" cy="18" r="11" fill="#FFFFFF" />
      <path d="M 82 12 L 82 24 M 76 18 L 88 18" stroke="#EB0029" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export const LensImpactSignSvg = OnePlusSignSvg;

interface OnePlusLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  href?: string;
  className?: string;
}

export function LensImpactLogo({
  size = "md",
  showText = true,
  href = "/",
  className = "",
}: OnePlusLogoProps) {
  // Dimensions map
  const dimensions = {
    sm: { box: "w-7 h-7", text: "text-base", badge: "text-[9px] px-1.5 py-0.5" },
    md: { box: "w-8 h-8 sm:w-9 sm:h-9", text: "text-lg sm:text-xl", badge: "text-[10px] sm:text-xs px-1.5 py-0.5" },
    lg: { box: "w-10 h-10 sm:w-11 sm:h-11", text: "text-xl sm:text-2xl", badge: "text-xs px-2 py-0.5" },
    xl: { box: "w-14 h-14", text: "text-3xl", badge: "text-sm px-2.5 py-1" },
  }[size];

  const content = (
    <div className={`flex items-center space-x-2.5 select-none group ${className}`}>
      {/* Authentic Vector LensImpact Film Club SVG Emblem */}
      <div className={`relative ${dimensions.box} flex-shrink-0 drop-shadow-[0_0_15px_rgba(235,0,41,0.5)] group-hover:scale-105 transition-transform duration-200`}>
        <OnePlusSignSvg />
      </div>

      {/* Typography: LENSIMPACT FILM CLUB */}
      {showText && (
        <div className="flex items-center space-x-2">
          <span className={`font-black ${dimensions.text} tracking-wider text-white group-hover:text-white/95 transition-colors`}>
            LENS<span className="text-[#EB0029]">IMPACT</span>
          </span>
          <span className={`font-bold ${dimensions.badge} tracking-widest text-[#EB0029] uppercase bg-[#EB0029]/15 rounded border border-[#EB0029]/30 shadow-xs whitespace-nowrap`}>
            FILM CLUB
          </span>
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export default LensImpactLogo;
