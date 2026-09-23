"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface BackToCatalogButtonProps {
  href?: string;
  className?: string;
}

/**
 * Reusable, fully responsive "Back to Catalog" pill button.
 * 
 * Responsive Behavior:
 * - Mobile (< 640px): Compact pill `px-3 py-1.5 text-xs`, shows "← Catalog" on a single line.
 * - Desktop (>= 640px): Full pill `sm:px-4 sm:py-2 sm:text-sm`, shows "← Back to Catalog".
 * - Guaranteed `whitespace-nowrap flex-shrink-0` so text NEVER wraps or breaks vertically.
 */
export default function BackToCatalogButton({
  href = "/",
  className = "",
}: BackToCatalogButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center space-x-1.5 sm:space-x-2 text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-all px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 hover:border-white/30 backdrop-blur-md shadow-sm active:scale-95 group flex-shrink-0 whitespace-nowrap select-none ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5 text-[#FF5500] group-hover:-translate-x-0.5 transition-transform flex-shrink-0" />
      <span className="hidden sm:inline">Back to </span>
      <span>Catalog</span>
    </Link>
  );
}
