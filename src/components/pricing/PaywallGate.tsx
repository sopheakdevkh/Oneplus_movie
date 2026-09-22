"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Lock,
  Sparkles,
  ArrowRight,
  BookOpen,
  Download,
  Users,
  CheckCircle2,
} from "lucide-react";

interface PaywallGateProps {
  isSubscriber?: boolean;
  moduleName?: string;
  children: React.ReactNode;
  fallbackTeaser?: React.ReactNode;
}

export default function PaywallGate({
  isSubscriber: initialSubscriber = false,
  moduleName = "Impact Guide",
  children,
  fallbackTeaser,
}: PaywallGateProps) {
  // Allow interactive toggle for developer / viewer testing
  const [isSubscriber, setIsSubscriber] = useState(initialSubscriber);

  if (isSubscriber) {
    return (
      <div className="relative">
        {/* Subtle subscriber indicator badge */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/5">
          <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Premium Membership Active • {moduleName} Unlocked</span>
          </div>
          <button
            type="button"
            onClick={() => setIsSubscriber(false)}
            className="text-[10px] text-white/40 hover:text-white/70 transition-colors underline cursor-pointer"
            title="Preview how free users see this section"
          >
            Switch to Free Preview
          </button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border border-white/10 bg-[#0C0E14] shadow-2xl">
      {/* Blurred Teaser Content in Background */}
      <div className="relative blur-md select-none pointer-events-none opacity-30 max-h-[460px] overflow-hidden p-6">
        {fallbackTeaser || children}
      </div>

      {/* Dark Vignette Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#090A0E] via-[#090A0E]/85 to-[#090A0E]/60 pointer-events-none" />

      {/* Interactive Paywall Banner Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-20">
        <div className="max-w-xl w-full mx-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
          {/* Glowing Badge */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-[11px] font-extrabold uppercase tracking-wider shadow-[0_0_15px_rgba(255,85,0,0.25)]">
            <Lock className="w-3 h-3" />
            <span>Premium Member Exclusive</span>
          </div>

          {/* Required Headline Banner */}
          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-snug">
            Unlock the full Impact Guide &amp; Community Discussion with Premium Membership
          </h3>

          <p className="text-xs sm:text-sm text-[#8E8E93] max-w-md mx-auto leading-relaxed">
            Gain full access to deep psychological breakdowns, printable lesson takeaways,
            and our private community discussion salon.
          </p>

          {/* Key Feature Highlights */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1 text-xs text-white/80">
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <BookOpen className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Psychological Themes</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Download className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Printable PDF Notes</span>
            </span>
            <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/5">
              <Users className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>Private Discussions</span>
            </span>
          </div>

          {/* Direct Button Leading to /pricing */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/pricing"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#EB0029] hover:from-[#ff6b1a] hover:to-[#ff1a40] text-white text-xs sm:text-sm font-black tracking-wide shadow-[0_0_25px_rgba(255,85,0,0.45)] hover:shadow-[0_0_35px_rgba(255,85,0,0.6)] transition-all flex items-center justify-center space-x-2"
            >
              <span>Upgrade to Premium</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </Link>

            {/* Quick Toggle for testing/evaluation */}
            <button
              type="button"
              onClick={() => setIsSubscriber(true)}
              className="text-[11px] text-white/50 hover:text-white px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              Simulate Subscribed View
            </button>
          </div>

          <p className="text-[10px] text-white/40">
            Plans start at just $4.99/mo • Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
