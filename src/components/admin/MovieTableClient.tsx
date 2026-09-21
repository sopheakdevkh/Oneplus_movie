"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
} from "lucide-react";
import { MovieData } from "@/lib/movies";
import { getPosterCardUrl } from "@/lib/cloudinary";
import { deleteMovieAction, toggleTopRatedAction } from "@/app/actions/movies";
import MovieModal from "./MovieModal";

interface MovieTableClientProps {
  initialMovies: MovieData[];
}

export default function MovieTableClient({ initialMovies }: MovieTableClientProps) {
  const [movies, setMovies] = useState<MovieData[]>(initialMovies);
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieData | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Filtered movies
  const filtered = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.description.toLowerCase().includes(search.toLowerCase());
      const matchesGenre =
        genreFilter === "All" ||
        m.genres.some((g) => g.name.toLowerCase() === genreFilter.toLowerCase());
      return matchesSearch && matchesGenre;
    });
  }, [movies, search, genreFilter]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    setDeletingId(id);
    const res = await deleteMovieAction(id);
    if (res.success) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      showNotification(`Deleted "${title}" successfully.`);
    } else {
      alert("Failed to delete movie.");
    }
    setDeletingId(null);
  };

  const handleToggleTopRated = async (movie: MovieData) => {
    const nextState = !movie.isTopRated;
    const res = await toggleTopRatedAction(movie.id, nextState);
    if (res.success) {
      setMovies((prev) =>
        prev.map((m) =>
          m.id === movie.id ? { ...m, isTopRated: nextState } : m
        )
      );
      showNotification(
        nextState
          ? `Promoted "${movie.title}" to Top Rated.`
          : `Removed "${movie.title}" from Top Rated.`
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center space-x-2 px-4 py-3 rounded-xl bg-[#FF9F0A]/20 border border-[#FF9F0A]/40 text-[#FF9F0A] text-xs font-semibold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* Action Bar: Search, Genre Filter, Add Movie Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search catalog titles..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#161820] border border-white/10 text-white text-xs placeholder-[#8E8E93] focus:border-[#FF9F0A] focus:outline-none"
            />
          </div>

          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#161820] border border-white/10 text-white text-xs focus:border-[#FF9F0A] focus:outline-none"
          >
            <option value="All">All Genres</option>
            <option value="Action">Action</option>
            <option value="Sci-Fi">Sci-Fi</option>
            <option value="Drama">Drama</option>
            <option value="Crime">Crime</option>
            <option value="Animation">Animation</option>
          </select>
        </div>

        <button
          onClick={() => {
            setEditingMovie(null);
            setModalOpen(true);
          }}
          className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-xl bg-[#FF9F0A] hover:bg-[#FFAB00] text-black text-xs font-bold shadow-[0_0_15px_rgba(255,159,10,0.3)] transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Movie</span>
        </button>
      </div>

      {/* Catalog Table */}
      <div className="rounded-2xl border border-white/10 bg-[#121318] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#161820] text-[#8E8E93] border-b border-white/10 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Movie</th>
                <th className="py-3.5 px-4">Rating</th>
                <th className="py-3.5 px-4">Certification</th>
                <th className="py-3.5 px-4">Genres</th>
                <th className="py-3.5 px-4">Top Rated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((movie) => {
                const thumb = getPosterCardUrl(movie.posterUrl, 160, 100);

                return (
                  <tr
                    key={movie.id}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    {/* Poster + Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3.5">
                        <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-black/50 flex-shrink-0">
                          <Image
                            src={thumb}
                            alt={movie.title}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-white truncate max-w-[220px]">
                            {movie.title}
                          </p>
                          <p className="text-[11px] text-[#8E8E93]">
                            {movie.releaseYear} • {movie.duration}m
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Rating */}
                    <td className="py-3.5 px-4 font-bold text-[#FF9F0A]">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3.5 h-3.5 fill-[#FF9F0A]" />
                        <span>{movie.rating.toFixed(1)}</span>
                      </div>
                    </td>

                    {/* Certification */}
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded border border-white/20 bg-white/5 font-semibold text-[10px]">
                        {movie.certification}
                      </span>
                    </td>

                    {/* Genres */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {movie.genres.map((g) => (
                          <span
                            key={g.id}
                            className="px-2 py-0.5 rounded bg-white/5 text-[10px] text-[#8E8E93]"
                          >
                            {g.name}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Top Rated Toggle */}
                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleTopRated(movie)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-all ${
                          movie.isTopRated
                            ? "bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40"
                            : "bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white"
                        }`}
                      >
                        {movie.isTopRated ? "Top 10" : "Standard"}
                      </button>
                    </td>

                    {/* Actions: Edit & Delete */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => {
                            setEditingMovie(movie);
                            setModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-[#8E8E93] hover:text-white hover:bg-white/10 transition-colors"
                          title="Edit movie"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(movie.id, movie.title)}
                          disabled={deletingId === movie.id}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                          title="Delete movie"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E8E93]">
                    No movies found matching &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      <MovieModal
        isOpen={modalOpen}
        movie={editingMovie}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          showNotification(editingMovie ? "Movie updated!" : "New movie added to catalog!");
          window.location.reload();
        }}
      />
    </div>
  );
}
