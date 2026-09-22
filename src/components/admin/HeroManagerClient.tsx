"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  MonitorPlay,
  Play,
  Star,
  Plus,
  ArrowUp,
  ArrowDown,
  Trash2,
  Edit3,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Video,
  Film,
  ExternalLink,
  Sparkles,
  X,
  RefreshCw,
} from "lucide-react";
import { MovieData } from "@/lib/movies";
import HeroBanner from "@/components/HeroBanner";
import {
  addToHeroBannerAction,
  removeFromHeroBannerAction,
  reorderHeroBannerAction,
  updateHeroSlideAction,
} from "@/app/actions/movies";

interface HeroManagerClientProps {
  initialHeroSlides: MovieData[];
  allMovies: MovieData[];
}

export default function HeroManagerClient({
  initialHeroSlides,
  allMovies,
}: HeroManagerClientProps) {
  const [heroSlides, setHeroSlides] = useState<MovieData[]>(initialHeroSlides);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [searchCatalog, setSearchCatalog] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Edit Slide Modal State
  const [editingSlide, setEditingSlide] = useState<MovieData | null>(null);
  const [editBannerUrl, setEditBannerUrl] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRating, setEditRating] = useState(8.5);

  const triggerToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // IDs currently on the hero banner
  const heroMovieIds = new Set(heroSlides.map((s) => s.id));

  // Remaining catalog movies that can be added
  const availableMovies = allMovies
    .filter((m) => !heroMovieIds.has(m.id))
    .filter((m) =>
      searchCatalog.trim()
        ? m.title.toLowerCase().includes(searchCatalog.toLowerCase()) ||
          m.genres.some((g) => g.name.toLowerCase().includes(searchCatalog.toLowerCase()))
        : true
    );

  // Reorder Slide Up
  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newSlides = [...heroSlides];
    const temp = newSlides[index - 1];
    newSlides[index - 1] = newSlides[index];
    newSlides[index] = temp;

    setHeroSlides(newSlides);

    startTransition(async () => {
      const res = await reorderHeroBannerAction(newSlides.map((s) => s.id));
      if (res.success) {
        triggerToast("Slide order updated!");
      } else {
        triggerToast(res.error || "Failed to reorder", "error");
      }
    });
  };

  // Reorder Slide Down
  const handleMoveDown = (index: number) => {
    if (index >= heroSlides.length - 1) return;
    const newSlides = [...heroSlides];
    const temp = newSlides[index + 1];
    newSlides[index + 1] = newSlides[index];
    newSlides[index] = temp;

    setHeroSlides(newSlides);

    startTransition(async () => {
      const res = await reorderHeroBannerAction(newSlides.map((s) => s.id));
      if (res.success) {
        triggerToast("Slide order updated!");
      } else {
        triggerToast(res.error || "Failed to reorder", "error");
      }
    });
  };

  // Add Movie to Hero Banner
  const handleAddMovie = (movie: MovieData) => {
    const updated = [...heroSlides, { ...movie, isTopRated: true, rank: heroSlides.length + 1 }];
    setHeroSlides(updated);

    startTransition(async () => {
      const res = await addToHeroBannerAction(movie.id);
      if (res.success) {
        triggerToast(`Added "${movie.title}" to Hero Banner!`);
      } else {
        triggerToast(res.error || "Failed to add movie", "error");
      }
    });
  };

  // Remove Movie from Hero Banner
  const handleRemoveMovie = (movieId: string, title: string) => {
    const updated = heroSlides.filter((s) => s.id !== movieId);
    setHeroSlides(updated);

    startTransition(async () => {
      const res = await removeFromHeroBannerAction(movieId);
      if (res.success) {
        triggerToast(`Removed "${title}" from Hero Banner.`);
      } else {
        triggerToast(res.error || "Failed to remove movie", "error");
      }
    });
  };

  // Open Edit Modal
  const handleOpenEdit = (slide: MovieData) => {
    setEditingSlide(slide);
    setEditBannerUrl(slide.bannerUrl || slide.posterUrl || "");
    setEditVideoUrl(slide.videoUrl || "");
    setEditDescription(slide.description || "");
    setEditRating(slide.rating || 8.5);
  };

  // Save Slide Edits
  const handleSaveEdit = () => {
    if (!editingSlide) return;

    const slideId = editingSlide.id;
    const updatedSlides = heroSlides.map((s) =>
      s.id === slideId
        ? {
            ...s,
            bannerUrl: editBannerUrl,
            videoUrl: editVideoUrl,
            description: editDescription,
            rating: editRating,
          }
        : s
    );

    setHeroSlides(updatedSlides);
    setEditingSlide(null);

    startTransition(async () => {
      const res = await updateHeroSlideAction(slideId, {
        bannerUrl: editBannerUrl,
        videoUrl: editVideoUrl,
        description: editDescription,
        rating: editRating,
      });

      if (res.success) {
        triggerToast("Hero slide details saved successfully!");
      } else {
        triggerToast(res.error || "Failed to save edits", "error");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border-emerald-500/30"
              : "bg-red-950/90 text-red-200 border-red-500/30"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5 mb-1">
            <span className="p-2 rounded-xl bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
              <MonitorPlay className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hero Banner Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#8E8E93]">
            Curate featured movie slides, trailer video previews (15s on mobile / 5s on desktop), backdrop artwork, and playback sequence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowLivePreview((prev) => !prev)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              showLivePreview
                ? "bg-[#FF5500]/15 text-[#FF5500] border-[#FF5500]/40"
                : "bg-white/5 hover:bg-white/10 text-white/80 border-white/10"
            }`}
          >
            {showLivePreview ? (
              <>
                <EyeOff className="w-4 h-4" />
                <span>Hide Live Preview</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                <span>Show Live Preview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Hero Banner Preview Box */}
      {showLivePreview && (
        <div className="rounded-2xl border border-white/10 bg-[#0B0B0E] overflow-hidden shadow-2xl relative">
          <div className="px-4 py-2.5 bg-black/60 border-b border-white/10 flex items-center justify-between text-xs text-[#8E8E93]">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white/80">Interactive Live Preview</span>
              <span className="text-white/40">•</span>
              <span>{heroSlides.length} slides active</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">
                Desktop: 5s preview
              </span>
              <span className="px-2 py-0.5 rounded bg-white/10 text-white/70">
                Mobile: 15s preview (h-full)
              </span>
            </div>
          </div>

          {heroSlides.length > 0 ? (
            <div className="max-h-[520px] overflow-hidden">
              <HeroBanner
                slides={heroSlides}
                onPlayMovie={() => triggerToast("Preview clicked: Play Movie")}
                onMoreInfo={() => triggerToast("Preview clicked: More Info")}
              />
            </div>
          ) : (
            <div className="py-20 text-center text-white/50">
              <Film className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-semibold text-white">No slides selected for Hero Banner</p>
              <p className="text-xs text-[#8E8E93] mt-1">Add movies from the catalog below to populate the hero slider</p>
            </div>
          )}
        </div>
      )}

      {/* Section 1: Active Hero Slides Management */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Active Hero Slides Sequence</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/30 font-bold">
                {heroSlides.length} Featured
              </span>
            </h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Drag or use arrows to reorder slide playback. Slide #1 will be the opening spotlight.
            </p>
          </div>
        </div>

        {heroSlides.length > 0 ? (
          <div className="space-y-3">
            {heroSlides.map((slide, index) => (
              <div
                key={slide.id}
                className="p-4 rounded-2xl bg-[#121318] border border-white/10 hover:border-white/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Slide Number, Thumbnail, and Title Info */}
                <div className="flex items-center space-x-4 min-w-0">
                  {/* Slide Rank Badge */}
                  <div className="flex-shrink-0 flex flex-col items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-center">
                    <span className="text-xs font-black text-[#FF5500]">#{index + 1}</span>
                  </div>

                  {/* Backdrop Thumbnail */}
                  <div className="relative w-24 h-14 rounded-xl overflow-hidden bg-[#1A1C24] flex-shrink-0 border border-white/10">
                    <Image
                      src={slide.bannerUrl || slide.posterUrl}
                      alt={slide.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {slide.videoUrl && (
                      <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/70 text-[9px] font-bold text-[#FF9F0A] flex items-center space-x-0.5">
                        <Video className="w-2.5 h-2.5" />
                        <span>Video</span>
                      </div>
                    )}
                  </div>

                  {/* Movie Info */}
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm sm:text-base font-bold text-white truncate">
                        {slide.title}
                      </h3>
                      {index === 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Primary Spotlight
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-[#8E8E93] mt-1">
                      <span>{slide.releaseYear || 2024}</span>
                      <span>•</span>
                      <div className="flex items-center space-x-1 text-[#FFB800] font-bold">
                        <Star className="w-3.5 h-3.5 fill-[#FFB800]" />
                        <span>{slide.rating?.toFixed(1) || "8.5"}</span>
                      </div>
                      <span>•</span>
                      <span className="truncate max-w-[200px]">
                        {slide.genres?.map((g) => g.name).join(", ") || "Action"}
                      </span>
                    </div>

                    {slide.videoUrl && (
                      <p className="text-[11px] text-white/50 truncate max-w-sm mt-0.5 font-mono">
                        Preview: {slide.videoUrl}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Reorder Controls & Action Buttons */}
                <div className="flex items-center space-x-2 flex-shrink-0 self-end md:self-auto">
                  {/* Move Up */}
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0 || isPending}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all active:scale-95"
                    title="Move slide earlier"
                    aria-label="Move Up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Move Down */}
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === heroSlides.length - 1 || isPending}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 disabled:pointer-events-none border border-white/10 transition-all active:scale-95"
                    title="Move slide later"
                    aria-label="Move Down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Edit Slide Custom Details */}
                  <button
                    onClick={() => handleOpenEdit(slide)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-semibold transition-all active:scale-95"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#FF9F0A]" />
                    <span>Edit Slide</span>
                  </button>

                  {/* Remove from Hero */}
                  <button
                    onClick={() => handleRemoveMovie(slide.id, slide.title)}
                    disabled={isPending}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all active:scale-95"
                    title="Remove from Hero Banner"
                    aria-label="Remove Slide"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#121318] border border-dashed border-white/10 text-center text-white/50">
            <p className="text-sm font-semibold">No slides currently in the hero banner.</p>
            <p className="text-xs text-[#8E8E93] mt-1">Select titles from the catalog below to add them.</p>
          </div>
        )}
      </div>

      {/* Section 2: Add Movies from Catalog to Hero Banner */}
      <div className="space-y-4 pt-4 border-t border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
              <span>Add Movies from Catalog to Hero</span>
              <span className="px-2 py-0.5 text-xs rounded-full bg-white/10 text-white/70 font-semibold">
                {availableMovies.length} Available
              </span>
            </h2>
            <p className="text-xs text-[#8E8E93] mt-0.5">
              Select movies with high-resolution backdrops and video trailers to feature in the hero carousel.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchCatalog}
              onChange={(e) => setSearchCatalog(e.target.value)}
              className="w-full bg-[#161822] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#FF5500]/60 transition-all"
            />
          </div>
        </div>

        {availableMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {availableMovies.map((movie) => (
              <div
                key={movie.id}
                className="p-3 rounded-2xl bg-[#121318] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[#181A24] mb-3">
                    <Image
                      src={movie.bannerUrl || movie.posterUrl}
                      alt={movie.title}
                      fill
                      unoptimized
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {movie.videoUrl && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-[10px] font-bold text-white flex items-center space-x-1">
                        <Play className="w-2.5 h-2.5 fill-white" />
                        <span>Trailer</span>
                      </div>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-white truncate">{movie.title}</h4>
                  <div className="flex items-center space-x-2 text-xs text-[#8E8E93] mt-1">
                    <span>{movie.releaseYear}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1 text-[#FFB800] font-bold">
                      <Star className="w-3 h-3 fill-[#FFB800]" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleAddMovie(movie)}
                  disabled={isPending}
                  className="mt-3 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-[#FF5500] hover:text-white text-white/80 border border-white/10 hover:border-[#FF5500]/50 text-xs font-bold transition-all flex items-center justify-center space-x-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Add to Hero Banner</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#121318] border border-dashed border-white/10 text-center text-white/50">
            <p className="text-xs">No matching available movies in catalog.</p>
          </div>
        )}
      </div>

      {/* Edit Hero Slide Modal */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#121318] border border-white/15 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h3 className="text-lg font-black text-white">Edit Hero Slide</h3>
                <p className="text-xs text-[#8E8E93]">{editingSlide.title}</p>
              </div>
              <button
                onClick={() => setEditingSlide(null)}
                className="p-1.5 rounded-lg bg-white/5 text-[#8E8E93] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Backdrop Banner Image URL */}
              <div>
                <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                  Backdrop Banner Artwork URL (16:9 Recommended)
                </label>
                <input
                  type="text"
                  value={editBannerUrl}
                  onChange={(e) => setEditBannerUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/... or Cloudinary URL"
                  className="w-full bg-[#181A24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF5500]"
                />
                {editBannerUrl && (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black/40 mt-2 border border-white/10">
                    <Image
                      src={editBannerUrl}
                      alt="Banner Preview"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Video Trailer / Preview URL */}
              <div>
                <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                  Trailer / Video Preview URL (YouTube, Vimeo, or .mp4)
                </label>
                <input
                  type="text"
                  value={editVideoUrl}
                  onChange={(e) => setEditVideoUrl(e.target.value)}
                  placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or .mp4 URL"
                  className="w-full bg-[#181A24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF5500]"
                />
                <p className="text-[11px] text-[#8E8E93] mt-1">
                  Plays in the background of the hero slider (15 seconds on mobile, 5 seconds on desktop).
                </p>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                  Spotlight Rating (e.g. 8.8)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="10"
                  value={editRating}
                  onChange={(e) => setEditRating(parseFloat(e.target.value) || 8.0)}
                  className="w-full bg-[#181A24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              {/* Synopsis */}
              <div>
                <label className="block text-xs font-bold text-[#8E8E93] uppercase tracking-wider mb-1.5">
                  Hero Synopsis Description
                </label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#181A24] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF5500] leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setEditingSlide(null)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-[#8E8E93] hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isPending}
                className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#FF6600] active:scale-95 text-xs font-bold text-white shadow-[0_0_15px_rgba(255,85,0,0.4)] flex items-center space-x-1.5"
              >
                {isPending && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                <span>Save Slide Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
