"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Bell, LayoutGrid, Shield } from "lucide-react";

export type CategoryTab = "Movies" | "Series" | "Animation" | "Genres";

interface HeaderProps {
  activeCategory: CategoryTab;
  onCategoryChange: (category: CategoryTab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const CATEGORIES: CategoryTab[] = ["Movies", "Series", "Animation", "Genres"];

export default function Header({
  activeCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: HeaderProps) {
  const [internalSearch, setInternalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(internalSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [internalSearch, onSearchChange]);

  return (
    <header className="w-full px-4 sm:px-8 lg:px-12 pt-4 md:pt-7 pb-3 md:pb-4 bg-black">
      <div className="flex items-center justify-between gap-3 sm:gap-6">
        {/* Category Navigation Links */}
        <nav className="flex items-center space-x-5 sm:space-x-7 md:space-x-10 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((category) => {
            const isActive = activeCategory === category;
            return (
              <button
                key={category}
                onClick={() => onCategoryChange(category)}
                className={`text-sm sm:text-base font-medium tracking-normal whitespace-nowrap transition-colors ${
                  isActive ? "text-white font-semibold" : "text-[#8E8E93] hover:text-white"
                }`}
              >
                {category}
              </button>
            );
          })}
        </nav>

        {/* Right: Search bar, Bell, Grid, User Avatar */}
        <div className="flex items-center space-x-2.5 sm:space-x-5 md:space-x-7 flex-shrink-0">
          {/* Pill-shaped search bar */}
          <div className="relative flex items-center w-28 xs:w-36 sm:w-52 md:w-64">
            <Search className="absolute left-3 w-3.5 h-3.5 sm:left-4 sm:w-4 sm:h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => setInternalSearch(e.target.value)}
              placeholder="Search..."
              className="w-full h-8 sm:h-11 pl-8 sm:pl-11 pr-2.5 sm:pr-4 rounded-full bg-[#121316] text-xs sm:text-sm text-white placeholder-[#8E8E93] border border-white/5 focus:outline-none focus:border-white/20 transition-all"
            />
          </div>

          {/* Notification Bell */}
          <button
            className="hidden sm:flex text-white hover:opacity-80 transition-opacity p-1"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
          </button>

          {/* 4-square Grid Icon */}
          <button
            className="hidden sm:flex text-white hover:opacity-80 transition-opacity p-1"
            aria-label="Grid view"
          >
            <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 stroke-[1.8]" />
          </button>

          {/* User Profile Avatar with Admin Dropdown */}
          <div className="relative group cursor-pointer flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-1 ring-white/10 group-hover:ring-[#FF9F0A] transition-all">
            <Image
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
              alt="User Avatar"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>

          {/* Profile Popover with Admin Portal Link */}
          <div className="absolute right-0 top-11 hidden group-hover:flex flex-col w-52 p-3 rounded-2xl bg-[#161820] border border-white/10 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center space-x-2 pb-2 border-b border-white/10">
              <span className="text-xs font-bold text-white">Alex Rivera</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40">
                ADMIN
              </span>
            </div>

            <Link
              href="/admin"
              className="flex items-center space-x-2 mt-2 px-2.5 py-2 rounded-xl text-xs font-bold text-[#FF9F0A] hover:bg-[#FF9F0A]/10 transition-colors"
            >
              <Shield className="w-4 h-4 fill-[#FF9F0A]" />
              <span>Admin Dashboard</span>
            </Link>

            <Link
              href="/admin/movies"
              className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl text-xs text-[#8E8E93] hover:text-white hover:bg-white/5 transition-colors"
            >
              <span>Manage Catalog</span>
            </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
