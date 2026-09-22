"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { OnePlusSignSvg } from "@/components/OnePlusLogo";
import {
  LayoutDashboard,
  Film,
  Tags,
  Shield,
  ArrowLeft,
  Cloud,
  Users,
  Sparkles,
  MonitorPlay,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/hero", label: "Hero Banner", icon: MonitorPlay },
  { href: "/admin/subscriptions", label: "Subscriptions & Users", icon: Users },
  { href: "/admin/content", label: "Film CMS (Split Access)", icon: Sparkles },
  { href: "/admin/movies", label: "Movies Catalog", icon: Film },
  { href: "/admin/genres", label: "Genres", icon: Tags },
  { href: "/admin/media", label: "Cloudinary Assets", icon: Cloud },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <>
      {/* ========================================================= */}
      {/* MOBILE TOP BAR & DRAWER: Shown below md (< 768px)          */}
      {/* ========================================================= */}
      <div className="md:hidden sticky top-0 z-40 bg-[#0A0A0E]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-8 h-8 flex-shrink-0 drop-shadow-[0_0_12px_rgba(235,0,41,0.5)]">
            <OnePlusSignSvg />
          </div>
          <div>
            <span className="text-sm font-black text-white tracking-tight">LensImpact Admin</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            href="/"
            className="p-1.5 rounded-lg bg-white/5 text-[#8E8E93] hover:text-white border border-white/5"
            title="Exit to App"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="px-2.5 py-1.5 rounded-lg bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30 text-xs font-bold"
          >
            {mobileOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0D0E14] border-b border-white/10 px-4 py-4 space-y-2 animate-in slide-in-from-top duration-200">
          {ADMIN_LINKS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30"
                    : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* ========================================================= */}
      {/* DESKTOP SIDEBAR: Shown on md (768px) and above             */}
      {/* ========================================================= */}
      <aside className="hidden md:flex w-64 bg-[#0A0A0E] border-r border-white/10 flex-col justify-between p-6 select-none min-h-screen flex-shrink-0">
        <div>
          {/* Brand & Admin Badge */}
          <div className="flex items-center space-x-3 mb-8">
            <div className="relative w-10 h-10 flex-shrink-0 drop-shadow-[0_0_15px_rgba(235,0,41,0.5)]">
              <OnePlusSignSvg />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-tight">LensImpact Film Club</h1>
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#EB0029]">
                Admin Console
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {ADMIN_LINKS.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 shadow-[0_0_15px_rgba(255,159,10,0.15)]"
                      : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom: Return to Main Stream Platform */}
        <div className="pt-6 border-t border-white/10">
          <Link
            href="/"
            className="flex items-center space-x-2.5 px-4 py-3 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit to Streaming App</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
