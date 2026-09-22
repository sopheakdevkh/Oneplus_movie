"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Star,
  CheckCircle2,
  Film,
  Play,
  LayoutGrid,
  List,
  X,
  Tv,
  Sparkles,
  Clock,
  Flame,
  ArrowUpDown,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { MovieData } from "@/lib/movies";
import { getPosterCardUrl } from "@/lib/cloudinary";
import { deleteMovieAction, toggleTopRatedAction } from "@/app/actions/movies";
import { parseVideoSource } from "@/lib/video";
import MovieModal from "./MovieModal";
import { OnePlusSignSvg } from "@/components/OnePlusLogo";

interface MovieTableClientProps {
  initialMovies: MovieData[];
}

type ViewMode = "table" | "grid";
type SortOption = "rating-desc" | "rating-asc" | "year-desc" | "year-asc" | "title-asc" | "duration-desc";
type FilterTab = "all" | "top-rated" | "movies" | "series" | "high-rated";

export default function MovieTableClient({ initialMovies }: MovieTableClientProps) {
  const [movies, setMovies] = useState<MovieData[]>(initialMovies);
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("rating-desc");
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  // Modal & Preview state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieData | null>(null);
  const [previewMovie, setPreviewMovie] = useState<MovieData | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);

  const showNotification = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Distinct genres from current catalog
  const allGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      m.genres?.forEach((g) => {
        if (g?.name) set.add(g.name);
      });
    });
    return ["All", ...Array.from(set).sort()];
  }, [movies]);

  // Catalog dynamic stats for HUD cards
  const stats = useMemo(() => {
    const total = movies.length;
    const topRated = movies.filter((m) => m.isTopRated).length;
    const highRated = movies.filter((m) => m.rating >= 8.5).length;
    const avgRating = total > 0 ? (movies.reduce((acc, m) => acc + (m.rating || 0), 0) / total).toFixed(1) : "0.0";
    return { total, topRated, highRated, avgRating, genreCount: allGenres.length - 1 };
  }, [movies, allGenres]);

  // Filter & sort logic
  const filteredAndSorted = useMemo(() => {
    let result = movies.filter((m) => {
      // 1. Text search
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.genres?.some((g) => g.name.toLowerCase().includes(q));

      // 2. Genre filter
      const matchesGenre =
        selectedGenre === "All" ||
        m.genres?.some((g) => g.name.toLowerCase() === selectedGenre.toLowerCase());

      // 3. Tab filter
      let matchesTab = true;
      if (activeTab === "top-rated") matchesTab = Boolean(m.isTopRated);
      else if (activeTab === "movies") matchesTab = m.type === "Movie" || !m.type;
      else if (activeTab === "series") matchesTab = m.type === "Series" || m.type === "Animation";
      else if (activeTab === "high-rated") matchesTab = m.rating >= 8.5;

      return matchesSearch && matchesGenre && matchesTab;
    });

    // Sort
    result.sort((a, b) => {
      if (sortBy === "rating-desc") return (b.rating || 0) - (a.rating || 0);
      if (sortBy === "rating-asc") return (a.rating || 0) - (b.rating || 0);
      if (sortBy === "year-desc") return (b.releaseYear || 0) - (a.releaseYear || 0);
      if (sortBy === "year-asc") return (a.releaseYear || 0) - (b.releaseYear || 0);
      if (sortBy === "title-asc") return a.title.localeCompare(b.title);
      if (sortBy === "duration-desc") return (b.duration || 0) - (a.duration || 0);
      return 0;
    });

    return result;
  }, [movies, search, selectedGenre, activeTab, sortBy]);

  // Pagination: 8 items per page
  const ITEMS_PER_PAGE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // Auto reset to page 1 on filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedGenre, activeTab, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE));
  const paginatedMovies = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSorted.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSorted, currentPage, ITEMS_PER_PAGE]);

  // Actions
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}" from the catalog?`)) return;

    setDeletingId(id);
    const res = await deleteMovieAction(id);
    if (res.success) {
      setMovies((prev) => prev.filter((m) => m.id !== id));
      showNotification(`"${title}" deleted from catalog.`, "info");
    } else {
      alert("Failed to delete movie.");
    }
    setDeletingId(null);
  };

  const handleToggleTopRated = async (movie: MovieData) => {
    const nextState = !movie.isTopRated;
    // Optimistic UI update
    setMovies((prev) =>
      prev.map((m) => (m.id === movie.id ? { ...m, isTopRated: nextState } : m))
    );
    showNotification(
      nextState
        ? `Promoted "${movie.title}" to Top Rated spotlight!`
        : `Removed "${movie.title}" from Top Rated spotlight.`,
      "success"
    );

    const res = await toggleTopRatedAction(movie.id, nextState);
    if (!res.success) {
      // Revert if error
      setMovies((prev) =>
        prev.map((m) => (m.id === movie.id ? { ...m, isTopRated: !nextState } : m))
      );
      alert("Failed to update status on server.");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedGenre("All");
    setActiveTab("all");
    setSortBy("rating-desc");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-[#161822]/95 backdrop-blur-xl border border-[#EB0028]/40 text-white text-xs font-semibold shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#EB0028] flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_10px_rgba(235,0,40,0.6)]">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
          <span>{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-white/40 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Page Header with OnePlus Red Accent */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="relative w-6 h-6 flex-shrink-0 drop-shadow-[0_0_10px_rgba(235,0,41,0.5)]">
              <OnePlusSignSvg className="w-full h-full" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#E50914]">
              Catalog Management Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Movies &amp; Series Catalog
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Curate titles, preview video trailers, adjust certifications, and spotlight top-rated releases.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setEditingMovie(null);
              setModalOpen(true);
            }}
            className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#EB0028] hover:bg-[#FF1A35] text-white text-xs font-bold shadow-[0_0_20px_rgba(235,0,40,0.4)] hover:shadow-[0_0_25px_rgba(235,0,40,0.6)] transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Movie</span>
          </button>
        </div>
      </div>

      {/* Interactive KPI Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Catalog */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === "all"
              ? "bg-[#181A24] border-[#EB0028]/60 shadow-[0_0_20px_rgba(235,0,40,0.15)] ring-1 ring-[#EB0028]/40"
              : "bg-[#12131A] border-white/10 hover:border-white/20 hover:bg-[#161722]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Total Titles
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/70">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {stats.total}
          </p>
          <span className="text-[10px] text-white/40 font-medium">Full active catalog</span>
        </div>

        {/* Top Rated Spotlight */}
        <div
          onClick={() => setActiveTab(activeTab === "top-rated" ? "all" : "top-rated")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === "top-rated"
              ? "bg-[#181A24] border-[#FF9F0A]/60 shadow-[0_0_20px_rgba(255,159,10,0.15)] ring-1 ring-[#FF9F0A]/40"
              : "bg-[#12131A] border-white/10 hover:border-white/20 hover:bg-[#161722]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Top Rated
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FF9F0A]/15 flex items-center justify-center text-[#FF9F0A]">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-[#FF9F0A] tracking-tight">
            {stats.topRated}
          </p>
          <span className="text-[10px] text-white/40 font-medium">Spotlighted on Home</span>
        </div>

        {/* High Rated (8.5+) */}
        <div
          onClick={() => setActiveTab(activeTab === "high-rated" ? "all" : "high-rated")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
            activeTab === "high-rated"
              ? "bg-[#181A24] border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/40"
              : "bg-[#12131A] border-white/10 hover:border-white/20 hover:bg-[#161722]"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              8.5+ Rating
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-tight">
            {stats.highRated}
          </p>
          <span className="text-[10px] text-white/40 font-medium">Critical acclaim</span>
        </div>

        {/* Avg Rating */}
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Avg Rating
            </span>
            <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/70">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {stats.avgRating} <span className="text-xs text-[#FF9F0A] font-bold">★</span>
          </p>
          <span className="text-[10px] text-white/40 font-medium">{stats.genreCount} Genres covered</span>
        </div>
      </div>

      {/* Control Panel: Search Bar, Genre Pill, Sort, View Switcher */}
      <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, synopsis, or genre..."
              className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs placeholder-[#8E8E93] focus:border-[#EB0028] focus:ring-1 focus:ring-[#EB0028] focus:outline-none transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Controls: Genre, Sort, View Toggle */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-wrap sm:flex-nowrap">
            {/* Genre Select */}
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="h-11 px-3 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs focus:border-[#EB0028] focus:outline-none cursor-pointer"
            >
              {allGenres.map((g) => (
                <option key={g} value={g} className="bg-[#181A24]">
                  {g === "All" ? "All Genres" : g}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-11 pl-3 pr-8 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs focus:border-[#EB0028] focus:outline-none cursor-pointer appearance-none"
              >
                <option value="rating-desc" className="bg-[#181A24]">Rating: High to Low</option>
                <option value="rating-asc" className="bg-[#181A24]">Rating: Low to High</option>
                <option value="year-desc" className="bg-[#181A24]">Year: Newest</option>
                <option value="year-asc" className="bg-[#181A24]">Year: Oldest</option>
                <option value="title-asc" className="bg-[#181A24]">Title: A to Z</option>
                <option value="duration-desc" className="bg-[#181A24]">Duration: Longest</option>
              </select>
              <ArrowUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40 pointer-events-none" />
            </div>

            {/* View Mode Toggle: Table vs Grid */}
            <div className="flex items-center p-1 rounded-xl bg-[#181A24] border border-white/10">
              <button
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-[#EB0028] text-white shadow-md"
                    : "text-white/50 hover:text-white"
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg text-xs font-semibold transition-all ${
                  viewMode === "grid"
                    ? "bg-[#EB0028] text-white shadow-md"
                    : "text-white/50 hover:text-white"
                }`}
                title="Poster Grid View"
                aria-label="Poster Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Filter Tab Chips */}
        <div className="flex items-center justify-between border-t border-white/5 pt-3 flex-wrap gap-2">
          <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "all"
                  ? "bg-white text-black font-bold"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              All Titles ({movies.length})
            </button>
            <button
              onClick={() => setActiveTab("top-rated")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "top-rated"
                  ? "bg-[#FF9F0A] text-black font-bold"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Flame className="w-3 h-3 fill-current" />
              <span>Top Rated Only ({stats.topRated})</span>
            </button>
            <button
              onClick={() => setActiveTab("movies")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "movies"
                  ? "bg-[#EB0028] text-white font-bold"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setActiveTab("series")}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                activeTab === "series"
                  ? "bg-[#EB0028] text-white font-bold"
                  : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              <Tv className="w-3 h-3" />
              <span>Series / Animation</span>
            </button>
          </div>

          <div className="text-[11px] text-[#8E8E93]">
            Showing <span className="font-bold text-white">{filteredAndSorted.length}</span> of {movies.length} titles
            {(search || selectedGenre !== "All" || activeTab !== "all") && (
              <button
                onClick={clearFilters}
                className="ml-2 text-[#EB0028] hover:underline font-semibold"
              >
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View Mode: Table vs Grid */}
      {viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/10 bg-[#12131A] overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-[#171922] text-[#8E8E93] border-b border-white/10 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-4 px-4 sm:px-5">Movie &amp; Overview</th>
                  <th className="py-4 px-4">Rating</th>
                  <th className="py-4 px-4">Certification</th>
                  <th className="py-4 px-4">Genres</th>
                  <th className="py-4 px-4">Spotlight</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {paginatedMovies.map((movie) => {
                  const thumb = getPosterCardUrl(movie.posterUrl, 160, 100);
                  const isHighRated = movie.rating >= 8.5;

                  return (
                    <tr
                      key={movie.id}
                      className="hover:bg-white/[0.03] transition-colors group"
                    >
                      {/* Poster + Title + Type Badge */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="flex items-center space-x-3.5">
                          {/* Thumbnail with hover play overlay */}
                          <div
                            onClick={() => movie.videoUrl && setPreviewMovie(movie)}
                            className="relative w-16 h-11 rounded-lg overflow-hidden bg-black/60 flex-shrink-0 border border-white/10 group/thumb cursor-pointer"
                            title={movie.videoUrl ? "Click to preview trailer" : "No video attached"}
                          >
                            <Image
                              src={thumb}
                              alt={movie.title}
                              fill
                              unoptimized
                              sizes="64px"
                              className="object-cover group-hover/thumb:scale-105 transition-transform duration-300"
                            />
                            {movie.videoUrl && (
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                                <Play className="w-3.5 h-3.5 fill-white text-white ml-0.5" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-white text-sm truncate max-w-[240px] sm:max-w-xs group-hover:text-white/95">
                                {movie.title}
                              </p>
                              {movie.type && movie.type !== "Movie" && (
                                <span className="px-1.5 py-0.2 rounded bg-white/10 text-[9px] font-bold text-white/80">
                                  {movie.type}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-[#8E8E93] mt-0.5">
                              {movie.releaseYear} • {movie.duration}m
                              {movie.videoUrl && (
                                <span className="ml-2 text-emerald-400 font-semibold">• Video Ready</span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Rating with Score Badge */}
                      <td className="py-3.5 px-4">
                        <div
                          className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg font-bold text-xs ${
                            isHighRated
                              ? "bg-amber-400/15 text-[#FFB800] border border-[#FFB800]/30 shadow-[0_0_10px_rgba(255,184,0,0.15)]"
                              : "bg-white/5 text-white/90 border border-white/10"
                          }`}
                        >
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </div>
                      </td>

                      {/* Certification */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-md border border-white/10 bg-white/5 font-semibold text-[10px] text-white/80 uppercase">
                          {movie.certification || "PG"}
                        </span>
                      </td>

                      {/* Genres Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap max-w-xs">
                          {movie.genres?.map((g) => (
                            <span
                              key={g.id}
                              className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/70 border border-white/5 font-medium"
                            >
                              {g.name}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Top Rated Spotlight Toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleTopRated(movie)}
                          className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase transition-all ${
                            movie.isTopRated
                              ? "bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40 shadow-[0_0_10px_rgba(255,159,10,0.2)]"
                              : "bg-white/5 text-[#8E8E93] border border-white/10 hover:text-white hover:bg-white/10"
                          }`}
                          title="Click to toggle Top Rated spotlight"
                        >
                          <Flame className="w-3 h-3" />
                          <span>{movie.isTopRated ? "Top Rated" : "Standard"}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {/* Preview Trailer Button */}
                          {movie.videoUrl && (
                            <button
                              onClick={() => setPreviewMovie(movie)}
                              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                              title="Preview Trailer Video"
                            >
                              <Play className="w-3.5 h-3.5 fill-current" />
                            </button>
                          )}

                          {/* Edit Button */}
                          <button
                            onClick={() => {
                              setEditingMovie(movie);
                              setModalOpen(true);
                            }}
                            className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            title="Edit movie parameters"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(movie.id, movie.title)}
                            disabled={deletingId === movie.id}
                            className="p-2 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                            title="Remove movie"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {filteredAndSorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-[#8E8E93]">
                      <Film className="w-10 h-10 mx-auto mb-2 opacity-30 text-white" />
                      <p className="font-semibold text-white">No movies match your criteria</p>
                      <p className="text-xs mt-1">Try resetting search query or clearing active filters.</p>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* POSTER GRID VIEW */
        <div>
          {paginatedMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-5">
              {paginatedMovies.map((movie) => {
                const poster = movie.posterUrl || "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=600&q=80";

                return (
                  <div
                    key={movie.id}
                    className="group relative flex flex-col rounded-2xl bg-[#12131A] border border-white/10 overflow-hidden hover:border-[#EB0028]/60 hover:shadow-[0_10px_30px_rgba(0,0,0,0.8)] transition-all duration-300"
                  >
                    {/* Poster Image (2:3 Aspect) */}
                    <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#181A24]">
                      <Image
                        src={poster}
                        alt={movie.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 160px, (max-width: 1024px) 220px, 260px"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Top Badges: Rating & Top Rated */}
                      <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between pointer-events-none z-10">
                        {movie.isTopRated ? (
                          <span className="px-2 py-0.5 rounded-md bg-[#EB0028] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                            Top Rated
                          </span>
                        ) : (
                          <span />
                        )}

                        <span className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#FFB800]">
                          <Star className="w-3 h-3 fill-[#FFB800]" />
                          <span>{movie.rating.toFixed(1)}</span>
                        </span>
                      </div>

                      {/* Dark Vignette Bottom */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                      {/* Hover Action Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 p-3 transition-opacity duration-200 z-20">
                        {movie.videoUrl && (
                          <button
                            onClick={() => setPreviewMovie(movie)}
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-[#EB0028] text-white text-xs font-bold shadow-[0_0_15px_rgba(235,0,40,0.6)] hover:scale-105 transition-transform"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Preview</span>
                          </button>
                        )}

                        <div className="flex items-center space-x-2 mt-1">
                          <button
                            onClick={() => {
                              setEditingMovie(movie);
                              setModalOpen(true);
                            }}
                            className="p-2 rounded-full bg-white/20 hover:bg-white text-white hover:text-black transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleToggleTopRated(movie)}
                            className={`p-2 rounded-full transition-colors ${
                              movie.isTopRated
                                ? "bg-[#FF9F0A] text-black"
                                : "bg-white/20 text-white hover:bg-white hover:text-black"
                            }`}
                            title="Toggle Top Rated"
                          >
                            <Flame className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(movie.id, movie.title)}
                            disabled={deletingId === movie.id}
                            className="p-2 rounded-full bg-red-500/20 hover:bg-red-600 text-red-300 hover:text-white transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Metadata Card Footer */}
                    <div className="p-3 space-y-1">
                      <h4 className="font-bold text-white text-xs sm:text-sm truncate">
                        {movie.title}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-[#8E8E93]">
                        <span>{movie.releaseYear} • {movie.duration}m</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 border border-white/10 uppercase">
                          {movie.certification || "PG"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-[#8E8E93] bg-[#12131A] rounded-2xl border border-white/10">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30 text-white" />
              <p className="font-bold text-white text-base">No titles match your filters</p>
              <p className="text-xs mt-1">Try clearing your search query or switching tabs.</p>
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-[#EB0028] text-white text-xs font-bold shadow-md"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pagination Bar (8 per page) */}
      {filteredAndSorted.length > 0 && (
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
          <div className="text-xs text-[#8E8E93]">
            Showing{" "}
            <span className="font-bold text-white">
              {(currentPage - 1) * ITEMS_PER_PAGE + 1}
            </span>{" "}
            to{" "}
            <span className="font-bold text-white">
              {Math.min(currentPage * ITEMS_PER_PAGE, filteredAndSorted.length)}
            </span>{" "}
            of <span className="font-bold text-white">{filteredAndSorted.length}</span> titles
            <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-semibold text-[#EB0028] border border-[#EB0028]/20">
              8 per page
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            {/* Prev Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#181A24] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:border-[#EB0028]/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const isActive = pageNum === currentPage;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#EB0028] text-white shadow-[0_0_12px_rgba(235,0,40,0.5)]"
                      : "bg-[#181A24] border border-white/10 text-white/70 hover:text-white hover:border-white/20"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#181A24] border border-white/10 text-xs font-semibold text-white/80 hover:text-white hover:border-[#EB0028]/40 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Quick Trailer Video Preview Modal */}
      {previewMovie && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-4xl rounded-3xl bg-[#12131A] border border-white/15 overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#161822]">
              <div className="flex items-center space-x-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EB0028] animate-pulse" />
                <h3 className="font-black text-white text-base truncate max-w-md">
                  Trailer Preview: {previewMovie.title}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                {previewMovie.videoUrl && (
                  <a
                    href={previewMovie.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => setPreviewMovie(null)}
                  className="p-2 rounded-xl hover:bg-white/10 text-white transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Player Area */}
            <div className="relative aspect-video w-full bg-black">
              {(() => {
                const parsed = parseVideoSource(previewMovie.videoUrl);
                if (parsed?.embedUrl) {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={previewMovie.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  );
                }
                if (previewMovie.videoUrl?.endsWith(".mp4") || previewMovie.videoUrl?.includes("commondatastorage")) {
                  return (
                    <video
                      src={previewMovie.videoUrl}
                      controls
                      autoPlay
                      className="w-full h-full object-contain"
                    />
                  );
                }
                return (
                  <div className="flex flex-col items-center justify-center h-full text-[#8E8E93] p-8 text-center">
                    <Film className="w-12 h-12 mb-3 text-white/30" />
                    <p className="text-white font-bold">Unsupported or Missing Video Source</p>
                    <p className="text-xs mt-1 max-w-md break-all text-white/50">{previewMovie.videoUrl || "No URL specified"}</p>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer Info */}
            <div className="p-4 px-6 bg-[#161822] flex items-center justify-between text-xs text-[#8E8E93]">
              <div className="flex items-center space-x-3">
                <span>{previewMovie.releaseYear}</span>
                <span>•</span>
                <span>{previewMovie.duration} mins</span>
                <span>•</span>
                <span className="text-[#FFB800] font-bold">★ {previewMovie.rating.toFixed(1)}</span>
              </div>
              <button
                onClick={() => {
                  setEditingMovie(previewMovie);
                  setPreviewMovie(null);
                  setModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
              >
                Edit Movie Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Movie Modal Dialog */}
      <MovieModal
        isOpen={modalOpen}
        movie={editingMovie}
        onClose={() => setModalOpen(false)}
        onSaved={() => {
          showNotification(editingMovie ? "Movie parameters updated!" : "New title added to LensImpact Film Club catalog!");
          window.location.reload();
        }}
      />
    </div>
  );
}
