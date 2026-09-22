import React from "react";
import prisma from "@/lib/db";
import FilmCMSClient from "@/components/admin/FilmCMSClient";
import { Film, Sparkles, Shield } from "lucide-react";

export const metadata = {
  title: "Admin Film CMS & Gated Content | LensImpact",
};

export default async function AdminFilmCMSPage() {
  let initialMovies: any[] = [];

  try {
    const dbMovies = await prisma.movie.findMany({
      include: { genres: true },
      orderBy: { createdAt: "desc" },
    });

    initialMovies = JSON.parse(JSON.stringify(dbMovies));
  } catch (err) {
    console.warn("Failed to prefetch movies in CMS:", err);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-[10px] font-extrabold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3" />
          <span>Curated CMS &amp; Gating System</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Film Content Management &amp; Paywall Curation
        </h1>
        <p className="text-xs text-[#8E8E93] mt-1 max-w-2xl">
          Publish and edit films with separated access tiers: public overview fields are indexed and open to all visitors, while psychological analyses and printable lesson PDFs are secured for LensImpact Club subscribers.
        </p>
      </div>

      <FilmCMSClient initialMovies={initialMovies} />
    </div>
  );
}
