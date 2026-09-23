"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Home, Film, Sparkles, AlertCircle } from "lucide-react";
import { OnePlusSignSvg, LensImpactLogo } from "@/components/OnePlusLogo";
import StreamPulseFooter from "@/components/StreamPulseFooter";

interface NotFoundViewProps {
  pageTitle?: string;
}

export default function NotFoundView({ pageTitle }: NotFoundViewProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#070709] text-white flex flex-col justify-between relative overflow-hidden select-none">
      {/* Background Cinematic Atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EB0029]/12 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-32 w-[400px] h-[400px] bg-[#FF9F0A]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Top Navigation Bar with Logo */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between border-b border-white/5">
        <LensImpactLogo size="md" href="/" />

        <div className="flex items-center space-x-3">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Go Back</span>
          </button>
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-[#EB0029] hover:bg-[#FF1A35] text-white text-xs font-bold shadow-[0_0_20px_rgba(235,0,41,0.4)] transition-all active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Container */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-4 py-12 sm:py-16">
        <div className="max-w-xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in zoom-in-95 duration-500">
          {/* Centered Glowing Logo Emblem */}
          <div className="flex justify-center">
            <div className="relative group">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-[#1E202B] via-[#11121A] to-[#0A0A0E] border border-white/15 flex items-center justify-center p-3 sm:p-4 shadow-[0_0_60px_rgba(235,0,41,0.35)] group-hover:scale-105 transition-transform duration-300">
                <OnePlusSignSvg className="w-full h-full drop-shadow-[0_0_20px_rgba(235,0,41,0.7)]" />
              </div>
              <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-[#EB0029] text-[10px] font-black uppercase tracking-wider text-white border-2 border-[#070709] shadow-lg">
                404
              </div>
            </div>
          </div>

          {/* Massive 404 Typography */}
          <div className="space-y-2">
            <div className="text-7xl sm:text-9xl font-black tracking-tighter bg-gradient-to-b from-white via-white/90 to-white/20 bg-clip-text text-transparent drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              404
            </div>

            {/* User-requested exact text */}
            <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              {pageTitle ? `${pageTitle} — ` : ""}This page is not available
            </h1>
            <p className="text-xs sm:text-sm text-white/50 max-w-md mx-auto leading-relaxed">
              The page you are trying to access is currently not available, moved, or undergoing maintenance.
            </p>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-gradient-to-r from-[#EB0029] to-[#FF2A4D] hover:brightness-110 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-[0_0_30px_rgba(235,0,41,0.4)] transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home Catalog</span>
            </Link>

            <Link
              href="/pricing"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-white/90 hover:text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 border border-white/10 backdrop-blur-md transition-all"
            >
              <Sparkles className="w-4 h-4 text-[#FF9F0A]" />
              <span>View Pricing &amp; Plans</span>
            </Link>
          </div>

          {/* Quick Helpful Links */}
          <div className="pt-6 border-t border-white/5 flex items-center justify-center space-x-6 text-xs text-white/40">
            <Link href="/" className="hover:text-white transition-colors">
              Trending Films
            </Link>
            <span>•</span>
            <Link href="/" className="hover:text-white transition-colors">
              TV Shows
            </Link>
            <span>•</span>
            <Link href="/pricing" className="hover:text-[#FF5500] transition-colors">
              VIP Membership
            </Link>
          </div>
        </div>
      </main>

      {/* Global StreamPulse Footer */}
      <StreamPulseFooter />
    </div>
  );
}
