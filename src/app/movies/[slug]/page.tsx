import React from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import prisma from "@/lib/db";
import { parseVideoSource } from "@/lib/video";
import { getPosterCardUrl } from "@/lib/cloudinary";
import { LensImpactLogo } from "@/components/OnePlusLogo";
import StreamPulseFooter from "@/components/StreamPulseFooter";
import AccessGate from "@/components/auth/AccessGate";
import WatchlistButton from "@/components/watchlist/WatchlistButton";
import DiscussionForum from "@/components/comments/DiscussionForum";
import BackToCatalogButton from "@/components/BackToCatalogButton";
import {
  Star,
  Play,
  Clock,
  ArrowLeft,
  BookOpen,
  Download,
  Users,
  Film,
  Sparkles,
  Lock,
} from "lucide-react";

interface MoviePageProps {
  params: Promise<{ slug: string }>;
}

export default async function MovieDetailPage({ params }: MoviePageProps) {
  const { slug } = await params;

  const movie = await prisma.movie.findFirst({
    where: {
      OR: [{ slug }, { id: slug }],
    },
    include: {
      genres: true,
    },
  });

  if (!movie) {
    notFound();
  }

  const videoMeta = parseVideoSource(movie.videoUrl || "");
  const hours = Math.floor(movie.duration / 60);
  const mins = movie.duration % 60;
  const durationStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

  return (
    <div className="min-h-screen bg-[#07080B] text-white flex flex-col select-none">
      {/* Top Header */}
      <header className="sticky top-0 z-50 bg-[#07080B]/90 backdrop-blur-xl border-b border-white/5 py-4 px-4 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <BackToCatalogButton />
          <LensImpactLogo size="md" />
        </div>
        <Link
          href="/pricing"
          className="text-xs font-bold px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#FF5500]/20 to-[#EB0029]/20 border border-[#FF5500]/40 text-[#FF5500]"
        >
          Join Club
        </Link>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-8 py-8 space-y-10">
        {/* ========================================================= */}
        {/* OPEN SECTION: Embedded Video & Basic Summary              */}
        {/* ========================================================= */}
        <section className="space-y-6">
          {/* Embedded Video Player */}
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-black border border-white/10 shadow-2xl">
            {videoMeta?.type === "youtube" && videoMeta.embedUrl ? (
              <iframe
                src={videoMeta.embedUrl}
                title={movie.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : videoMeta?.type === "vimeo" && videoMeta.embedUrl ? (
              <iframe
                src={videoMeta.embedUrl}
                title={movie.title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : videoMeta?.rawUrl ? (
              <video
                src={videoMeta.rawUrl}
                controls
                className="w-full h-full object-cover"
                poster={movie.bannerUrl || movie.posterUrl}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-black/60">
                <p className="text-sm text-white/60">Preview player unavailable</p>
              </div>
            )}
          </div>

          {/* Title, Badges, and Metadata */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#FF5500] uppercase tracking-wider mb-1">
                <span>Public Curator Selection</span>
                <span className="text-white/30">•</span>
                <span>Open Access</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              <div className="flex items-center space-x-3 text-xs sm:text-sm text-[#8E8E93] mt-2">
                <span>{movie.releaseYear}</span>
                <span>•</span>
                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-white font-semibold">
                  {movie.certification}
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1 text-[#FFB800] font-bold">
                  <Star className="w-3.5 h-3.5 fill-[#FFB800] text-[#FFB800]" />
                  <span>{movie.rating.toFixed(1)}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{durationStr}</span>
                </span>
              </div>
            </div>

            {/* Actions & Genre tags */}
            <div className="flex items-center gap-3 flex-wrap">
              <WatchlistButton movieId={movie.id} movieTitle={movie.title} />
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-white/80"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </div>

          {/* Basic Summary (Open to all users) */}
          <div className="p-6 rounded-2xl bg-[#0F1118] border border-white/10 space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">
              Overview &amp; Synopsis
            </h3>
            <p className="text-sm sm:text-base text-[#B0B2BE] leading-relaxed">
              {movie.description}
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* GATED MODULE: Deep Psychological & Impact Analysis        */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Deep Impact Analysis &amp; Thematic Breakdown
            </h2>
          </div>

          <AccessGate requiredLevel="member" showDevSwitcher>
            <div className="space-y-4 p-6 rounded-3xl bg-[#0E1017] border border-white/10 text-sm text-white/80 leading-relaxed">
              <h3 className="text-base font-bold text-white">
                The Narrative Psychology of {movie.title}
              </h3>
              <p>
                This title unpacks the delicate balance between systemic subjugation and personal agency. 
                The cinematography emphasizes claustrophobia in opening acts before shifting to panoramic vistas 
                as the central dilemma resolves.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#FF5500] mb-1">
                    Moral Dilemma Dissection
                  </h4>
                  <p className="text-xs text-white/70">
                    The ethical crossroads tests whether personal survival justifies complicity in institutional rot.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-400 mb-1">
                    Archetypal Evolution
                  </h4>
                  <p className="text-xs text-white/70">
                    The protagonist transforms from a passive observer to an active moral catalyst.
                  </p>
                </div>
              </div>
            </div>
          </AccessGate>
        </section>

        {/* ========================================================= */}
        {/* GATED MODULE: Printable Lesson Takeaways                  */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Download className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Printable Lesson Notes &amp; Key Takeaways
            </h2>
          </div>

          <AccessGate requiredLevel="member">
            <div className="space-y-4 p-6 rounded-3xl bg-[#0E1017] border border-white/10 text-sm text-white/80">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <h3 className="font-bold text-white text-base">
                    Study Guide Syllabus: {movie.title}
                  </h3>
                  <p className="text-xs text-[#8E8E93]">
                    12-page comprehensive printable booklet with discussion prompts and journaling exercises.
                  </p>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 rounded-xl bg-[#FF5500] text-white font-bold text-xs flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <strong className="text-white">Takeaway 1:</strong> Authenticity often demands voluntary discomfort.
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <strong className="text-white">Takeaway 2:</strong> Silence in the face of structural decay is itself a choice.
                </div>
              </div>
            </div>
          </AccessGate>
        </section>

        {/* ========================================================= */}
        {/* GATED MODULE: Private Community Discussion Club           */}
        {/* ========================================================= */}
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[#FF5500]" />
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              LensImpact Member Discussion Club
            </h2>
          </div>

          <DiscussionForum movieTitle={movie.title} />
        </section>
      </main>

      <StreamPulseFooter />
    </div>
  );
}
