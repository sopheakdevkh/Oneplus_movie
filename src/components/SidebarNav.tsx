"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Compass,
  Star,
  Timer,
  Clock,
  FolderDown,
  Settings,
  LogOut,
  Shield,
} from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: "discover", label: "Discover", icon: Compass },
  { id: "featured", label: "Featured", icon: Star, active: true },
  { id: "timer", label: "Live / Timer", icon: Timer },
  { id: "history", label: "History", icon: Clock },
  { id: "downloads", label: "Downloads", icon: FolderDown },
  { id: "settings", label: "Settings", icon: Settings },
];

interface SidebarNavProps {
  activeTab?: string;
  onTabSelect?: (id: string) => void;
}

export default function SidebarNav({ activeTab = "featured", onTabSelect }: SidebarNavProps) {
  const [currentTab, setCurrentTab] = useState(activeTab);

  const handleSelect = (id: string) => {
    setCurrentTab(id);
    onTabSelect?.(id);
  };

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR: Shown on md (768px) and above             */}
      {/* ========================================================= */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-20 lg:w-24 flex-col items-center justify-between py-7 bg-black border-r border-[#1E1E24] select-none"
        aria-label="Sidebar Navigation"
      >
        {/* Top Logo: 4-Quadrant Turbine Emblem */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => handleSelect("discover")}
            className="relative flex items-center justify-center w-11 h-11 text-white hover:opacity-85 transition-opacity"
            aria-label="Home"
          >
            <svg
              viewBox="0 0 32 32"
              fill="currentColor"
              className="w-8 h-8 text-white"
            >
              <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm1 3.076c5.44.52 9.773 4.853 10.293 10.293L17 14.15V5.076zM15 5.076v9.074L4.707 15.37C5.227 9.929 9.56 5.596 15 5.076zm-9.924 12.3L15 16.15v9.074c-5.44-.52-9.773-4.853-10.293-10.293zm11.924 9.074V17.39l10.293-1.22c-.52 5.44-4.853 9.774-10.293 10.294z" />
            </svg>
          </button>
        </div>

        {/* Center Nav Icons */}
        <nav className="flex flex-col items-center space-y-6 lg:space-y-7 my-auto">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleSelect(item.id)}
                  className="relative flex items-center justify-center w-10 h-10 transition-all duration-200"
                  aria-label={item.label}
                >
                  {isActive ? (
                    <div className="relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-[#FF9F0A] blur-md opacity-40 rounded-full scale-125" />
                      <Star className="relative w-6 h-6 fill-[#FF9F0A] text-[#FF9F0A] drop-shadow-[0_0_10px_rgba(255,159,10,0.6)]" />
                    </div>
                  ) : (
                    <Icon className="w-6 h-6 text-[#9A9AA0] hover:text-white stroke-[1.75] transition-colors" />
                  )}
                </button>

                {/* Tooltip */}
                <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-[#1B1D24] text-white text-xs whitespace-nowrap shadow-xl border border-white/10 z-50 pointer-events-none">
                  {item.label}
                </div>
              </div>
            );
          })}
        </nav>

        {/* Bottom: Admin Console Shortcut & Red Logout Button */}
        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/admin"
            className="relative group flex items-center justify-center w-10 h-10 text-[#FF9F0A] hover:opacity-85 transition-opacity"
            aria-label="Admin Console"
            title="Admin Console"
          >
            <Shield className="w-5 h-5 fill-[#FF9F0A]/20 text-[#FF9F0A] stroke-[2]" />
            <div className="absolute left-16 top-1/2 -translate-y-1/2 hidden group-hover:flex items-center px-2.5 py-1 rounded-md bg-[#1B1D24] text-[#FF9F0A] text-xs font-bold whitespace-nowrap shadow-xl border border-[#FF9F0A]/30 z-50 pointer-events-none">
              Admin Console
            </div>
          </Link>

          <button
            onClick={() => {
              alert("Signed out");
            }}
            className="relative flex items-center justify-center w-10 h-10 text-[#E53935] hover:opacity-80 transition-opacity"
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="w-6 h-6 stroke-[2] text-[#E53935]" />
          </button>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM NAV BAR: Shown below md (< 768px)            */}
      {/* ========================================================= */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-black/95 backdrop-blur-xl border-t border-[#1E1E24] flex items-center justify-around px-2 select-none safe-area-bottom"
        aria-label="Mobile Navigation"
      >
        <button
          onClick={() => handleSelect("discover")}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            currentTab === "discover" ? "text-[#FF9F0A]" : "text-[#9A9AA0]"
          }`}
          aria-label="Discover"
        >
          <Compass className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium">Discover</span>
        </button>

        <button
          onClick={() => handleSelect("featured")}
          className="flex flex-col items-center justify-center p-2 relative"
          aria-label="Featured"
        >
          {currentTab === "featured" ? (
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 bg-[#FF9F0A] blur-xs opacity-40 rounded-full" />
              <Star className="relative w-5 h-5 fill-[#FF9F0A] text-[#FF9F0A]" />
            </div>
          ) : (
            <Star className="w-5 h-5 text-[#9A9AA0] stroke-[1.8]" />
          )}
          <span
            className={`text-[10px] mt-0.5 font-medium ${
              currentTab === "featured" ? "text-[#FF9F0A] font-bold" : "text-[#9A9AA0]"
            }`}
          >
            Featured
          </span>
        </button>

        <button
          onClick={() => handleSelect("timer")}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            currentTab === "timer" ? "text-[#FF9F0A]" : "text-[#9A9AA0]"
          }`}
          aria-label="Trending"
        >
          <Timer className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium">Trending</span>
        </button>

        <button
          onClick={() => handleSelect("downloads")}
          className={`flex flex-col items-center justify-center p-2 transition-colors ${
            currentTab === "downloads" ? "text-[#FF9F0A]" : "text-[#9A9AA0]"
          }`}
          aria-label="Downloads"
        >
          <FolderDown className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] mt-0.5 font-medium">Saved</span>
        </button>

        <Link
          href="/admin"
          className="flex flex-col items-center justify-center p-2 text-[#FF9F0A] hover:opacity-85"
          aria-label="Admin"
        >
          <Shield className="w-5 h-5 fill-[#FF9F0A]/20 text-[#FF9F0A] stroke-[2]" />
          <span className="text-[10px] mt-0.5 font-bold">Admin</span>
        </Link>
      </nav>
    </>
  );
}
