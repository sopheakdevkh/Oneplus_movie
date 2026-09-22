import React from "react";
import Link from "next/link";
import {
  Film,
  Star,
  Users,
  Plus,
  Cloud,
  ArrowRight,
  Database,
} from "lucide-react";
import { getAdminStats, getAdminMovies } from "@/app/actions/movies";
import { getPosterCardUrl } from "@/lib/cloudinary";
import Image from "next/image";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const movies = await getAdminMovies();
  const recentMovies = movies.slice(0, 5);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-[#8E8E93] mt-1">
            Monitor streaming catalog metrics, subscribers, and Cloudinary media delivery.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Neon Database Status Badge */}
          <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>Neon DB Connected</span>
          </div>

          <Link
            href="/admin/subscriptions"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <Users className="w-4 h-4 text-[#FF5500]" />
            <span>Manage Subscriptions</span>
          </Link>

          <Link
            href="/admin/content"
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold border border-white/10 transition-all"
          >
            <Film className="w-4 h-4 text-[#FF9F0A]" />
            <span>Film CMS (Split Access)</span>
          </Link>

          <Link
            href="/admin/content"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#EB0029] hover:from-[#ff6a1f] hover:to-[#ff1940] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,85,0,0.3)] transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Publish Film</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Movies */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Total Movies
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {stats.totalMovies}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            +100% active titles
          </span>
        </div>

        {/* Top Rated Titles */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Top Rated Spotlight
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center">
              <Star className="w-4 h-4 fill-[#FF9F0A]" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {stats.topRatedMovies}
          </p>
          <span className="text-[11px] text-[#8E8E93] font-medium mt-1 inline-block">
            Featured on frontpage
          </span>
        </div>

        {/* Subscribers */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Active Subscribers
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
            {stats.activeSubscribers.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-400 font-semibold mt-1 inline-block">
            +12.4% this month
          </span>
        </div>

        {/* Cloudinary Optimization */}
        <div className="p-5 rounded-2xl bg-[#121318] border border-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#8E8E93] uppercase tracking-wider">
              Cloudinary CDN
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-black text-white tracking-tight">
            dqcopr9tn
          </p>
          <span className="text-[11px] text-purple-400 font-semibold mt-1 inline-block">
            f_auto, q_auto active
          </span>
        </div>
      </div>

      {/* Recent Catalog Additions */}
      <div className="rounded-2xl border border-white/10 bg-[#121318] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Recent Catalog Releases
            </h2>
            <p className="text-xs text-[#8E8E93]">Latest movies ready for streaming</p>
          </div>

          <Link
            href="/admin/movies"
            className="flex items-center space-x-1.5 text-xs font-bold text-[#FF9F0A] hover:underline"
          >
            <span>View All Movies</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-white/5">
          {recentMovies.map((movie) => {
            const thumb = getPosterCardUrl(movie.posterUrl, 120, 80);

            return (
              <div
                key={movie.id}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center space-x-3.5">
                  <div className="relative w-14 h-9 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                    <Image
                      src={thumb}
                      alt={movie.title}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white">{movie.title}</h3>
                    <p className="text-[11px] text-[#8E8E93]">
                      {movie.releaseYear} • {movie.genres.map((g) => g.name).join(", ")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-xs font-bold text-[#FF9F0A] flex items-center space-x-1">
                    <Star className="w-3.5 h-3.5 fill-[#FF9F0A]" />
                    <span>{movie.rating.toFixed(1)}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded border border-white/10 bg-white/5 text-[10px] text-white">
                    {movie.certification}
                  </span>

                  {movie.isTopRated && (
                    <span className="px-2 py-0.5 rounded-full bg-[#FF9F0A]/20 text-[#FF9F0A] text-[10px] font-extrabold border border-[#FF9F0A]/30">
                      TOP RATED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
