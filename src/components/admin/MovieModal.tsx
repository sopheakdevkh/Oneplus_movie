"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Upload, Film, Check, AlertCircle } from "lucide-react";
import { MovieData } from "@/lib/movies";
import { createMovieAction, updateMovieAction } from "@/app/actions/movies";
import { getPosterCardUrl } from "@/lib/cloudinary";
import { parseVideoSource } from "@/lib/video";

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

  const [title, setTitle] = useState(movie?.title || "");
  const [description, setDescription] = useState(movie?.description || "");
  const [releaseYear, setReleaseYear] = useState(movie?.releaseYear || 2024);
  const [duration, setDuration] = useState(movie?.duration || 120);
  const [rating, setRating] = useState(movie?.rating || 8.5);
  const [certification, setCertification] = useState(movie?.certification || "CBFC: A");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    movie ? movie.genres.map((g) => g.name) : ["Action"]
  );
  const [posterUrl, setPosterUrl] = useState(
    movie?.posterUrl ||
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1000&q=80"
  );
  const [bannerUrl, setBannerUrl] = useState(movie?.bannerUrl || "");
  const [videoUrl, setVideoUrl] = useState(movie?.videoUrl || "");
  const parsedVideo = parseVideoSource(videoUrl);
  const [isTopRated, setIsTopRated] = useState(movie?.isTopRated || false);
  const [rank, setRank] = useState<number | undefined>(movie?.rank || undefined);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    if (!posterUrl.trim()) {
      setErrorMsg("Poster URL is required.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        title,
        description,
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
      };

      let result;
      if (isEditing && movie) {
        result = await updateMovieAction(movie.id, payload);
      } else {
        result = await createMovieAction(payload);
      }

      if (result.success) {
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
          {/* Row 1: Title & Release Year */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Movie Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. John Wick: Chapter 5"
                required
                className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Year
              </label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                min={1950}
                max={2030}
                className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2: Duration, Rating, Certification */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Duration (mins)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={10}
                max={400}
                className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Rating (⭐)
              </label>
              <input
                type="number"
                step="0.1"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                min={0}
                max={10}
                className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Certification
              </label>
              <select
                value={certification}
                onChange={(e) => setCertification(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              >
                {CERTIFICATIONS.map((c) => (
                  <option key={c} value={c} className="bg-[#121318]">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Genres Multi-select Chips */}
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

          {/* Row 4: Poster URL with Real-time Cloudinary Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                Poster URL (Cloudinary / CDN) *
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or Cloudinary URL"
                required
                className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
              />
              <p className="text-[11px] text-[#8E8E93] mt-1">
                Optimized on-the-fly via Cloudinary (`f_auto,q_auto`).
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

          {/* Row 4.5: Banner Backdrop URL */}
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
              Banner / Backdrop URL (Optional)
            </label>
            <input
              type="url"
              value={bannerUrl}
              onChange={(e) => setBannerUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or Cloudinary backdrop URL"
              className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
            />
          </div>

          {/* Row 5: Video Trailer URL */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#8E8E93]">
                Trailer / Video URL (YouTube, Vimeo, or .mp4)
              </label>
              {videoUrl.trim() && (
                <span className="text-[11px] font-medium">
                  {parsedVideo?.type === "youtube" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> YouTube Video Detected
                    </span>
                  ) : parsedVideo?.type === "vimeo" ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Vimeo Video Detected
                    </span>
                  ) : (
                    <span className="text-[#00F0FF] flex items-center gap-1">
                      <Film className="w-3 h-3" /> Direct Video Stream (.mp4)
                    </span>
                  )}
                </span>
              )}
            </div>
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="e.g. https://www.youtube.com/watch?v=... or https://youtu.be/... or .mp4 URL"
              className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
            />
            <p className="text-[11px] text-[#8E8E93] mt-1">
              Paste standard YouTube links (<code className="text-white/70">watch?v=...</code>, <code className="text-white/70">youtu.be/...</code>), Vimeo, or direct MP4 stream URLs.
            </p>
          </div>

          {/* Row 6: Synopsis / Description */}
          <div>
            <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
              Synopsis
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="A brief overview of the plot and premise..."
              className="w-full p-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-sm focus:border-[#FF9F0A] focus:outline-none"
            />
          </div>

          {/* Row 7: Top Rated Toggle & Rank */}
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
              disabled={isSubmitting}
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
