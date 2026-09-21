"use client";

import React, { useState } from "react";
import { Tags, Film, Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { createGenreAction } from "@/app/actions/genres";

interface GenreItem {
  id: string;
  name: string;
  slug: string;
  _count?: {
    movies: number;
  };
}

interface GenreManagerClientProps {
  initialGenres: GenreItem[];
}

export default function GenreManagerClient({ initialGenres }: GenreManagerClientProps) {
  const [genres, setGenres] = useState<GenreItem[]>(initialGenres);
  const [isAdding, setIsAdding] = useState(false);
  const [newGenreName, setNewGenreName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGenreName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const res = await createGenreAction(newGenreName);
    if (res.success && res.genre) {
      setGenres((prev) => [
        ...prev,
        {
          id: res.genre.id,
          name: res.genre.name,
          slug: res.genre.slug,
          _count: { movies: 0 },
        },
      ]);
      setNewGenreName("");
      setIsAdding(false);
      setMessage(`Added genre "${res.genre.name}" successfully.`);
      setTimeout(() => setMessage(null), 3000);
    } else {
      setError(res.error || "Failed to create genre.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {message && (
        <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-semibold animate-in fade-in">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Header action bar */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#8E8E93]">
          Showing <span className="text-white font-bold">{genres.length}</span> active categories
        </p>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#FF9F0A] hover:bg-[#FFAB00] text-black text-xs font-bold shadow-[0_0_15px_rgba(255,159,10,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{isAdding ? "Cancel" : "Add Genre"}</span>
        </button>
      </div>

      {/* Inline Add Genre Form */}
      {isAdding && (
        <form
          onSubmit={handleCreate}
          className="p-4 rounded-2xl bg-[#161820] border border-white/10 flex items-center space-x-3 animate-in fade-in duration-200"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={newGenreName}
              onChange={(e) => setNewGenreName(e.target.value)}
              placeholder="Enter genre name (e.g. Documentary, Anime, Horror)..."
              required
              autoFocus
              className="w-full h-10 px-3.5 rounded-xl bg-[#1A1C23] border border-white/10 text-white text-xs placeholder-[#8E8E93] focus:border-[#FF9F0A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 h-10 rounded-xl bg-[#FF9F0A] hover:bg-[#FFAB00] text-black text-xs font-bold transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Save Genre"}
          </button>
        </form>
      )}

      {/* Genre Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {genres.map((genre) => (
          <div
            key={genre.id}
            className="p-5 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#FF9F0A]/40 flex items-center justify-between transition-all duration-200 shadow-md group"
          >
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#FF9F0A]/15 text-[#FF9F0A] flex items-center justify-center group-hover:scale-105 transition-transform">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-[#FF9F0A] transition-colors">
                  {genre.name}
                </h3>
                <p className="text-[11px] text-[#8E8E93]">slug: {genre.slug}</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white">
              <Film className="w-3.5 h-3.5 text-[#8E8E93]" />
              <span>{genre._count?.movies ?? 0}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
