"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { X, Upload, Film, Check, AlertCircle, Video, Tag, Users, Plus, Trash2 } from "lucide-react";
import { MovieData } from "@/lib/movies";
import { createMovieAction, updateMovieAction } from "@/app/actions/movies";
import { getGenresWithCounts } from "@/app/actions/genres";
import { getPosterCardUrl } from "@/lib/cloudinary";
import { CATEGORIES } from "@/lib/categories";
import { CastMember } from "@/lib/cast";
import { getCastConfigAction, saveMovieCastAction } from "@/app/actions/cast";
import {
  NavMenuTarget,
  MovieRoleAccess,
  NAV_MENU_TARGETS,
  ROLE_ACCESS_LEVELS,
} from "@/lib/menu-roles";
import { Tv, Shield, Crown } from "lucide-react";

interface MovieModalProps {
  isOpen: boolean;
  movie?: MovieData | null;
  onClose: () => void;
  onSaved: () => void;
}

const AVAILABLE_GENRES = [
  "Action",
  "Sci-Fi",
  "Adventure",
  "Drama",
  "Crime",
  "Thriller",
  "Animation",
  "Fantasy",
  "Comedy",
];

const CERTIFICATIONS = ["CBFC: A", "PG-13", "18+", "U/A", "PG", "R"];

// CATEGORIES imported from @/lib/categories

/**
 * Extracts the 11-character YouTube Video ID from common URL formats.
 * Supports:
 *   - https://www.youtube.com/watch?v=VIDEO_ID
 *   - https://youtu.be/VIDEO_ID
 *   - https://www.youtube.com/embed/VIDEO_ID
 *   - Plain 11-char ID pasted directly
 */
function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const regex =
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = trimmed.match(regex);
  if (match?.[1]) return match[1];

  // If someone pastes just the raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
}

export default function MovieModal({
  isOpen,
  movie,
  onClose,
  onSaved,
}: MovieModalProps) {
  if (!isOpen) return null;

  return (
    <MovieModalForm
      key={movie ? movie.id : "create-new"}
      movie={movie}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function MovieModalForm({
  movie,
  onClose,
  onSaved,
}: {
  movie?: MovieData | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEditing = Boolean(movie);

  // ── Core fields ──────────────────────────────────────────────
  const [title, setTitle] = useState(movie?.title || "");
  const [director, setDirector] = useState("");
  const [description, setDescription] = useState(movie?.description || "");
  const [releaseYear, setReleaseYear] = useState(movie?.releaseYear || 2024);
  const [duration, setDuration] = useState(movie?.duration || 120);
  const [rating, setRating] = useState(movie?.rating || 8.5);
  const [certification, setCertification] = useState(movie?.certification || "CBFC: A");

  // ── Category (strict select) ────────────────────────────────
  const [category, setCategory] = useState(() => {
    if (!movie || !movie.genres) return "";
    for (const g of movie.genres) {
      if (g.slug in CATEGORIES) return g.slug;
    }
    return movie.genres[0]?.slug || "";
  });

  const [categoriesList, setCategoriesList] = useState<Array<{ slug: string; label: string }>>(() => {
    return Object.entries(CATEGORIES).map(([slug, label]) => ({ slug, label }));
  });

  useEffect(() => {
    let isMounted = true;
    getGenresWithCounts()
      .then((dbGenres) => {
        if (!isMounted || !dbGenres || dbGenres.length === 0) return;
        const map = new Map<string, string>();
        for (const [s, l] of Object.entries(CATEGORIES)) {
          map.set(s, l);
        }
        for (const g of dbGenres) {
          map.set(g.slug, g.name);
        }
        setCategoriesList(Array.from(map.entries()).map(([slug, label]) => ({ slug, label })));
      })
      .catch((err) => console.warn("Failed to fetch genres in modal:", err));

    return () => {
      isMounted = false;
    };
  }, []);

  // ── Genres (multi-select chips) ─────────────────────────────
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    movie ? movie.genres.map((g) => g.name) : ["Action"]
  );

  // ── Media URLs ──────────────────────────────────────────────
  const [posterUrl, setPosterUrl] = useState(
    movie?.posterUrl ||
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80"
  );
  const [bannerUrl, setBannerUrl] = useState(movie?.bannerUrl || "");
  const [videoUrl, setVideoUrl] = useState(movie?.videoUrl || "");
  const [isTopRated, setIsTopRated] = useState(movie?.isTopRated || false);
  const [rank, setRank] = useState<number | undefined>(movie?.rank || undefined);

  // ── Content fields (synopsis + premium breakdown) ───────────
  const [publicSynopsis, setPublicSynopsis] = useState(movie?.publicSynopsis || "");
  const [premiumBreakdown, setPremiumBreakdown] = useState(movie?.premiumBreakdown || "");

  // ── Menu Display & Role Access ──────────────────────────────
  const [selectedMenus, setSelectedMenus] = useState<NavMenuTarget[]>(() => {
    if (movie?.menus && movie.menus.length > 0) return movie.menus;
    if (movie?.type === "Series") return ["Browse", "TV Shows"];
    return ["Browse", "Movies"];
  });
  const [selectedRoleAccess, setSelectedRoleAccess] = useState<MovieRoleAccess>(
    movie?.roleAccess || "public"
  );

  const toggleMenu = (menu: NavMenuTarget) => {
    setSelectedMenus((prev) =>
      prev.includes(menu) ? prev.filter((m) => m !== menu) : [...prev, menu]
    );
  };

  // ── Cast & Crew members ─────────────────────────────────────
  const [cast, setCast] = useState<CastMember[]>([]);
  const [actorName, setActorName] = useState("");
  const [actorRole, setActorRole] = useState("");
  const [actorAvatar, setActorAvatar] = useState("");
  const [castLoaded, setCastLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (movie?.title) {
      getCastConfigAction()
        .then((cfg) => {
          if (isMounted && cfg.movies[movie.title]) {
            setCast(cfg.movies[movie.title]);
          }
          setCastLoaded(true);
        })
        .catch(() => setCastLoaded(true));
    } else {
      setCastLoaded(true);
    }
    return () => {
      isMounted = false;
    };
  }, [movie?.title]);

  const handleAddCastMember = () => {
    if (!actorName.trim() || !actorRole.trim()) return;
    const newMember: CastMember = {
      name: actorName.trim(),
      role: actorRole.trim(),
      avatar:
        actorAvatar.trim() ||
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    };
    setCast((prev) => [...prev, newMember]);
    setActorName("");
    setActorRole("");
    setActorAvatar("");
  };

  const handleRemoveCastMember = (idx: number) => {
    setCast((prev) => prev.filter((_, i) => i !== idx));
  };

  // ── UI state ────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // ── Derived: YouTube ID extraction ──────────────────────────
  const youtubeVideoId = useMemo(() => extractYouTubeVideoId(videoUrl), [videoUrl]);
  const isYouTubeUrl = useMemo(() => {
    if (!videoUrl.trim()) return false;
    return /youtube\.com|youtu\.be/i.test(videoUrl.trim());
  }, [videoUrl]);
  const isVideoUrlInvalid = videoUrl.trim() !== "" && isYouTubeUrl && !youtubeVideoId;

  // ── Handlers ────────────────────────────────────────────────
  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg("Movie title is required.");
      return;
    }
    if (!category) {
      setErrorMsg("Please select a category.");
      return;
    }
    if (!posterUrl.trim()) {
      setErrorMsg("Poster URL is required.");
      return;
    }
    if (videoUrl.trim() && isYouTubeUrl && !youtubeVideoId) {
      setErrorMsg("Invalid YouTube URL — could not extract a valid Video ID.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        title,
        director: director.trim() || undefined,
        category,
        description: description || publicSynopsis || title,
        publicSynopsis: publicSynopsis || undefined,
        premiumBreakdown: premiumBreakdown || undefined,
        youtubeVideoId: youtubeVideoId || undefined,
        releaseYear: Number(releaseYear),
        duration: Number(duration),
        rating: Number(rating),
        certification,
        posterUrl,
        bannerUrl: bannerUrl || posterUrl,
        videoUrl: videoUrl || undefined,
        isTopRated,
        rank: isTopRated && rank ? Number(rank) : null,
        genreNames: selectedGenres.length > 0 ? selectedGenres : ["Action"],
        menus: selectedMenus,
        roleAccess: selectedRoleAccess,
      };

      let result;
      if (isEditing && movie) {
        result = await updateMovieAction(movie.id, payload);
      } else {
        result = await createMovieAction(payload);
      }

      if (result.success) {
        // Save cast members if configured
        if (cast.length > 0 && title.trim()) {
          await saveMovieCastAction(title.trim(), cast);
        }
        onSaved();
        onClose();
      } else {
        setErrorMsg(result.error || "Operation failed.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewPoster = getPosterCardUrl(posterUrl, 320, 200);

  // ── Shared input styles ─────────────────────────────────────
  const inputCls =
    "w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none transition-colors";
  const selectCls =
    "w-full h-10 px-3 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none transition-colors";
  const labelCls = "block text-xs font-semibold text-[#8E8E93] mb-1.5";
  const textareaCls =
    "w-full p-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none transition-colors resize-none";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto no-scrollbar rounded-2xl bg-[#121318] border border-white/10 shadow-2xl p-6 sm:p-8 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center space-x-2.5">
            <Film className="w-5 h-5 text-[#FF9F0A]" />
            <h2 className="text-lg font-bold text-white">
              {isEditing ? `Edit Movie: ${movie?.title}` : "Add New Movie to Catalog"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium mb-6">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Title, Director & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <label className={labelCls}>Movie Title *</label>
              <input
                id="movie-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. John Wick: Chapter 5"
                required
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Director</label>
              <input
                id="movie-director"
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="e.g. Denis Villeneuve"
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Year</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                min={1950}
                max={2030}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 2: Category Dropdown (strict) */}
          <div>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                Category *
              </span>
            </label>
            <select
              id="movie-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className={`${selectCls} ${!category ? "text-[#8E8E93]" : ""}`}
            >
              <option value="" disabled className="bg-[#121318] text-[#8E8E93]">
                — Select a category —
              </option>
              {categoriesList.map(({ slug, label }) => (
                <option key={slug} value={slug} className="bg-[#121318] text-white">
                  {label}
                </option>
              ))}
            </select>
            {category && (
              <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" />
                {categoriesList.find((c) => c.slug === category)?.label || CATEGORIES[category] || category}
              </p>
            )}
          </div>

          {/* Row 3: Duration, Rating, Certification */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Duration (mins)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={10}
                max={400}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Rating (⭐)</label>
              <input
                type="number"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={0}
                max={10}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Certification</label>
              <select
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className={selectCls}
              >
                {CERTIFICATIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#121318]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Genres Multi-select Chips */}
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-2">
              Genres
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_GENRES.map((genre) => {
                const isSelected = selectedGenres.includes(genre);
                return (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? "bg-[#EB0028] text-white shadow-sm"
                        : "bg-white/5 text-[#8E8E93] hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                    {genre}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Row 5: Poster URL with Real-time Cloudinary Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2">
              <label className={labelCls}>Poster URL (Cloudinary / CDN) *</label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                required
                className={inputCls}
              />
              <p className="text-[11px] text-[#8E8E93] mt-1">
                Optimized on-the-fly via Cloudinary (<code className="text-white/70">f_auto,q_auto</code>).
              </p>
            </div>

            {/* Thumbnail Live Preview */}
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black/40 border border-white/10 flex items-center justify-center">
              {posterUrl ? (
                <Image
                  src={previewPoster}
                  alt="Poster preview"
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <span className="text-[11px] text-[#8E8E93]">No poster preview</span>
              )}
            </div>
          </div>

          {/* Row 5.5: Banner Backdrop URL */}
          <div>
            <label className={labelCls}>Banner / Backdrop URL (Optional)</label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or Cloudinary backdrop URL"
              className={inputCls}
            />
          </div>

          {/* ═══════════════════════════════════════════════════════════
              Row 6: YouTube Video URL — Auto-Parse & Instant Preview
              ═══════════════════════════════════════════════════════════ */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#8E8E93] inline-flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                YouTube Video URL *
              </label>
              {videoUrl.trim() && (
                <span className="text-[11px] font-medium">
                  {youtubeVideoId ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Valid YouTube ID: <code className="font-mono text-emerald-300">{youtubeVideoId}</code>
                    </span>
                  ) : isYouTubeUrl ? (
                    <span className="text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> Invalid YouTube URL
                    </span>
                  ) : (
                    <span className="text-[#00F0FF] flex items-center gap-1">
                      <Film className="w-3 h-3" /> Non-YouTube URL
                    </span>
                  )}
                </span>
              )}
            </div>
            <input
              id="movie-video-url"
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
              className={`${inputCls} ${
                isVideoUrlInvalid
                  ? "!border-red-500/60 focus:!border-red-500"
                  : youtubeVideoId
                  ? "!border-emerald-500/40 focus:!border-emerald-500"
                  : ""
              }`}
            />
            <p className="text-[11px] text-[#8E8E93] mt-1">
              Supports <code className="text-white/70">youtube.com/watch?v=</code>,{" "}
              <code className="text-white/70">youtu.be/</code>, and{" "}
              <code className="text-white/70">youtube.com/embed/</code> formats.
            </p>

            {/* ── YouTube Live Preview Card ── */}
            {youtubeVideoId && (
              <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#1A1C23]">
                <div className="relative aspect-video w-full bg-black">
                  <Image
                    src={`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`}
                    alt={`YouTube thumbnail for ${youtubeVideoId}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg">
                      <svg viewBox="0 0 24 24" fill="white" className="w-6 h-6 ml-0.5">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-medium text-white/80">
                      Video ID: <code className="text-[#FF9F0A] font-mono">{youtubeVideoId}</code>
                    </span>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[#FF9F0A] hover:text-[#FFB340] transition-colors font-medium"
                  >
                    Open on YouTube ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Row 7: Public Synopsis */}
          <div>
            <label className={labelCls}>Public Synopsis</label>
            <textarea
              id="movie-public-synopsis"
              value={publicSynopsis}
              onChange={(e) => setPublicSynopsis(e.target.value)}
              rows={3}
              placeholder="A compelling public-facing summary of the film visible to all users..."
              className={textareaCls}
            />
          </div>

          {/* Row 7.5: Description (internal / legacy) */}
          <div>
            <label className={labelCls}>Description / Internal Notes</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Brief internal description or plot overview..."
              className={textareaCls}
            />
          </div>

          {/* Row 8: Premium Breakdown (members-only content) */}
          <div>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5">
                🔒 Premium Breakdown (Members Only)
              </span>
            </label>
            <textarea
              id="movie-premium-breakdown"
              value={premiumBreakdown}
              onChange={(e) => setPremiumBreakdown(e.target.value)}
              rows={4}
              placeholder="In-depth analysis, psychological breakdown, narrative themes, life takeaways... (Markdown supported)"
              className={textareaCls}
            />
            <p className="text-[11px] text-[#8E8E93] mt-1">
              Markdown formatting supported. Only visible to premium subscribers.
            </p>
          </div>

          {/* Row 9: Top Rated Toggle & Rank */}
          <div className="flex items-center space-x-6 p-3 rounded-xl bg-[#1A1C23] border border-white/5">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isTopRated}
                onChange={(e) => setIsTopRated(e.target.checked)}
                className="w-4 h-4 rounded text-[#FF9F0A] focus:ring-0 focus:ring-offset-0 bg-black/40 border-white/20"
              />
              <span className="text-xs font-bold text-white">Promote to Top Rated</span>
            </label>

            {isTopRated && (
              <div className="flex items-center space-x-2">
                <span className="text-xs text-[#8E8E93]">Rank (1-10):</span>
                <input
                  type="number"
                  value={rank || ""}
                  onChange={(e) => setRank(e.target.value ? Number(e.target.value) : undefined)}
                  min={1}
                  max={10}
                  className="w-16 h-8 px-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white text-center focus:border-[#FF9F0A] focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Row 9.5: Navigation Menus & Role Access Control */}
          <div className="p-4 rounded-xl bg-[#1A1C23] border border-white/10 space-y-4">
            <div>
              <label className="text-xs font-bold text-white flex items-center space-x-1.5 mb-1">
                <Tv className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Display On Navigation Menus</span>
              </label>
              <p className="text-[11px] text-[#8E8E93] mb-2.5">
                Choose which of the top 3 navigation tabs this movie/video will display on.
              </p>
              <div className="flex flex-wrap gap-2">
                {NAV_MENU_TARGETS.map((t) => {
                  const isChecked = selectedMenus.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => toggleMenu(t.id)}
                      className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        isChecked
                          ? "bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/50 shadow-sm"
                          : "bg-white/5 text-[#8E8E93] border-white/5 hover:border-white/20"
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      <span>{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-white flex items-center space-x-1.5 mb-1">
                <Shield className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Role Access Requirement</span>
              </label>
              <p className="text-[11px] text-[#8E8E93] mb-2">
                Set minimum user tier required to view &amp; stream video on these menus.
              </p>
              <select
                value={selectedRoleAccess}
                onChange={(e) => setSelectedRoleAccess(e.target.value as MovieRoleAccess)}
                className={selectCls}
              >
                {ROLE_ACCESS_LEVELS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id} className="bg-[#121318]">
                    {lvl.label} — {lvl.description}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 10: Cast & Crew Editor */}
          <div className="p-4 rounded-xl bg-[#1A1C23] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-white flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Cast & Crew ({cast.length})</span>
              </label>
              <span className="text-[10px] text-white/40">Visible in modal Key Cast & Crew</span>
            </div>

            {/* Existing Cast Chips */}
            {cast.length > 0 && (
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto no-scrollbar py-1">
                {cast.map((c, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs"
                  >
                    <div className="relative w-5 h-5 rounded-full overflow-hidden bg-white/10 flex-shrink-0">
                      <Image src={c.avatar} alt={c.name} fill className="object-cover" sizes="20px" />
                    </div>
                    <div className="text-[11px] font-bold text-white truncate max-w-[100px]">
                      {c.name}
                    </div>
                    <span className="text-[10px] text-[#FF9F0A] truncate max-w-[80px]">
                      {c.role}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveCastMember(idx)}
                      className="text-white/40 hover:text-rose-400 ml-1 transition-colors"
                      title="Remove actor"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add new cast member inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              <input
                type="text"
                placeholder="Actor name..."
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#00F0FF] focus:outline-none"
              />
              <input
                type="text"
                placeholder="Role / Character..."
                value={actorRole}
                onChange={(e) => setActorRole(e.target.value)}
                className="h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#00F0FF] focus:outline-none"
              />
              <div className="flex items-center space-x-1.5">
                <input
                  type="url"
                  placeholder="Avatar URL (optional)..."
                  value={actorAvatar}
                  onChange={(e) => setActorAvatar(e.target.value)}
                  className="flex-1 h-8 px-2.5 rounded-lg bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:border-[#00F0FF] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCastMember}
                  className="h-8 px-3 rounded-lg bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/40 text-xs font-bold hover:bg-[#00F0FF]/30 transition-all flex items-center space-x-1 flex-shrink-0"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isVideoUrlInvalid}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#EB0028] hover:bg-[#FF1A35] text-white text-xs font-bold shadow-[0_0_15px_rgba(235,0,40,0.4)] transition-all disabled:opacity-50 active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Movie"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
