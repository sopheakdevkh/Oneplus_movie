import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  BookOpen,
  Download,
  Users,
  Film,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { LensImpactLogo } from "@/components/OnePlusLogo";
import StreamPulseFooter from "@/components/StreamPulseFooter";

interface DashboardPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const isPaymentSuccess = params.payment === "success";
  const sessionId = typeof params.session_id === "string" ? params.session_id : null;

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#07080B]/90 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-8 md:px-12 lg:px-16">
        <div className="flex items-center justify-between">
          <LensImpactLogo size="md" />
          <div className="flex items-center space-x-3">
            <Link
              href="/"
              className="text-xs font-semibold px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors border border-white/10"
            >
              Back to Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-10 sm:py-14 space-y-8">
        {/* Payment Success Banner */}
        {isPaymentSuccess && (
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/60 via-[#10221B] to-emerald-950/60 border border-emerald-500/40 shadow-[0_0_35px_rgba(16,185,129,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in duration-300">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3 h-3" />
                  <span>Membership Activated</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Welcome to LensImpact Premium!
                </h2>
                <p className="text-xs sm:text-sm text-emerald-200/80 mt-0.5">
                  Your recurring subscription is active. You now have full access to in-depth psychological breakdowns and lesson notes.
                </p>
                {sessionId && (
                  <p className="text-[10px] text-white/40 font-mono mt-1">
                    Stripe Session Reference: {sessionId}
                  </p>
                )}
              </div>
            </div>
            <Link
              href="/"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-colors flex items-center space-x-1.5 flex-shrink-0"
            >
              <span>Explore Premium Library</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Member Overview Card */}
        <div className="p-8 rounded-3xl bg-[#0F1118] border border-white/10 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#FF5500]">
                Member Dashboard
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Sarah Jenkins
              </h1>
              <p className="text-xs text-[#8E8E93] mt-0.5">sarah@lensimpact.com</p>
            </div>
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>Premium Member Tier</span>
            </div>
          </div>

          {/* Perks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Psychological Breakdowns</h3>
              <p className="text-xs text-[#8E8E93]">
                Access deep character studies, ethical dilemmas, and philosophical dissections.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
                <Download className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Printable Study Guides</h3>
              <p className="text-xs text-[#8E8E93]">
                Download high-res PDF lesson notes, journaling prompts, and discussion agendas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#141620] border border-white/5 space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF5500]/15 text-[#FF5500] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-white text-sm">Private Discussion Club</h3>
              <p className="text-xs text-[#8E8E93]">
                Participate in monthly community salons and exclusive roundtable critiques.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center space-x-3">
            <Link
              href="/"
              className="px-6 py-3 rounded-xl bg-[#FF5500] hover:bg-[#ff661a] text-white font-bold text-xs transition-colors flex items-center space-x-2 shadow-[0_0_15px_rgba(255,85,0,0.4)]"
            >
              <Film className="w-4 h-4" />
              <span>Start Watching Now</span>
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-bold text-xs transition-colors border border-white/10"
            >
              Manage Subscription
            </Link>
          </div>
        </div>
      </main>

      <StreamPulseFooter />
    </div>
  );
}
