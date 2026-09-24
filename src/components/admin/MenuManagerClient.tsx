"use client";

import React, { useState, useMemo, useTransition } from "react";
import Image from "next/image";
import {
  Tv,
  Film,
  Flame,
  Compass,
  LayoutGrid,
  List,
  Search,
  Check,
  Shield,
  Crown,
  UserCheck,
  Lock,
  Play,
  X,
  ExternalLink,
  Sparkles,
  Eye,
  Sliders,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { MovieData } from "@/lib/movies";
import {
  MenuRolesConfig,
  NavMenuTarget,
  MovieRoleAccess,
  NAV_MENU_TARGETS,
  ROLE_ACCESS_LEVELS,
  isMovieAccessibleForRole,
} from "@/lib/menu-roles";
import {
  updateMovieMenuRoleAction,
  batchUpdateMenuRolesAction,
} from "@/app/actions/menu-roles";
import { parseVideoSource } from "@/lib/video";
import { UserState } from "@/types/user";

interface MenuManagerClientProps {
  initialMovies: MovieData[];
  initialConfig: MenuRolesConfig;
}

type TabSelection = "Browse" | "TV Shows" | "Movies" | "New & Popular" | "all";
type RolePreviewState = "none" | "guest" | "free_user" | "paid_member" | "admin";

export default function MenuManagerClient({
  initialMovies,
  initialConfig,
}: MenuManagerClientProps) {
  const [config, setConfig] = useState<MenuRolesConfig>(initialConfig);
  const [movies] = useState<MovieData[]>(initialMovies);
  const [activeTab, setActiveTab] = useState<TabSelection>("Browse");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [previewRole, setPreviewRole] = useState<RolePreviewState>("none");

  // Selection state for batch operations
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Video preview modal
  const [previewVideoMovie, setPreviewVideoMovie] = useState<MovieData | null>(null);

  // Notification toast
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" } | null>(null);
  const [isPending, startTransition] = useTransition();

  const showToast = (message: string, type: "success" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Distinct genres
  const genres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      m.genres?.forEach((g) => {
        if (g?.name) set.add(g.name);
      });
    });
    return ["All", ...Array.from(set).sort()];
  }, [movies]);

  // Helper to get rule for a movie
  const getRule = (movie: MovieData) => {
    return (
      config.movies[movie.id] ||
      config.movies[movie.title] || {
        menus: movie.menus || ["Browse", (movie.type === "Series" ? "TV Shows" : "Movies")],
        roleAccess: movie.roleAccess || "public",
      }
    );
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    let browseCount = 0;
    let tvCount = 0;
    let movieCount = 0;
    let popularCount = 0;
    let publicCount = 0;
    let freeCount = 0;
    let vipCount = 0;
    let adminCount = 0;

    movies.forEach((m) => {
      const rule = getRule(m);
      if (rule.menus.includes("Browse")) browseCount++;
      if (rule.menus.includes("TV Shows")) tvCount++;
      if (rule.menus.includes("Movies")) movieCount++;
      if (rule.menus.includes("New & Popular")) popularCount++;

      if (rule.roleAccess === "public") publicCount++;
      else if (rule.roleAccess === "free") freeCount++;
      else if (rule.roleAccess === "vip") vipCount++;
      else if (rule.roleAccess === "admin") adminCount++;
    });

    return {
      total: movies.length,
      browseCount,
      tvCount,
      movieCount,
      popularCount,
      publicCount,
      freeCount,
      vipCount,
      adminCount,
    };
  }, [movies, config]);

  // Filtered movies based on current tab, search, and genre
  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const rule = getRule(m);

      // Tab filter
      if (activeTab !== "all" && !rule.menus.includes(activeTab)) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesGenre = m.genres?.some((g) => g.name.toLowerCase().includes(q));
        if (!matchesTitle && !matchesGenre) return false;
      }

      // Genre filter
      if (selectedGenre !== "All") {
        const hasGenre = m.genres?.some(
          (g) => g.name.toLowerCase() === selectedGenre.toLowerCase()
        );
        if (!hasGenre) return false;
      }

      return true;
    });
  }, [movies, config, activeTab, searchQuery, selectedGenre]);

  // Toggle menu assignment for single movie
  const handleToggleMenu = (movie: MovieData, menu: NavMenuTarget) => {
    const currentRule = getRule(movie);
    const hasMenu = currentRule.menus.includes(menu);
    const updatedMenus = hasMenu
      ? currentRule.menus.filter((t) => t !== menu)
      : [...currentRule.menus, menu];

    // Ensure at least one menu is retained, or allow none if unlisted
    const newRule = {
      ...currentRule,
      menus: updatedMenus,
    };

    // Optimistic UI update
    setConfig((prev) => ({
      ...prev,
      movies: {
        ...prev.movies,
        [movie.id]: newRule,
        [movie.title]: newRule,
      },
    }));

    startTransition(async () => {
      const res = await updateMovieMenuRoleAction(movie.id, newRule);
      if (res.success && res.config) {
        setConfig(res.config);
        showToast(
          `${movie.title} ${hasMenu ? "removed from" : "added to"} ${menu}`,
          "success"
        );
      } else {
        showToast(res.error || "Failed to save menu change", "info");
      }
    });
  };

  // Change role access for single movie
  const handleChangeRole = (movie: MovieData, roleAccess: MovieRoleAccess) => {
    const currentRule = getRule(movie);
    const newRule = {
      ...currentRule,
      roleAccess,
    };

    // Optimistic UI update
    setConfig((prev) => ({
      ...prev,
      movies: {
        ...prev.movies,
        [movie.id]: newRule,
        [movie.title]: newRule,
      },
    }));

    startTransition(async () => {
      const res = await updateMovieMenuRoleAction(movie.id, newRule);
      if (res.success && res.config) {
        setConfig(res.config);
        showToast(
          `Set ${movie.title} access to ${
            ROLE_ACCESS_LEVELS.find((r) => r.id === roleAccess)?.label || roleAccess
          }`,
          "success"
        );
      } else {
        showToast(res.error || "Failed to update role", "info");
      }
    });
  };

  // Batch toggle menus
  const handleBatchSetMenu = (menu: NavMenuTarget, add: boolean) => {
    if (selectedIds.size === 0) return;

    const updates: Record<string, { menus: NavMenuTarget[]; roleAccess: MovieRoleAccess }> = {};

    selectedIds.forEach((id) => {
      const movie = movies.find((m) => m.id === id);
      if (!movie) return;
      const currentRule = getRule(movie);
      let updatedMenus = currentRule.menus;
      if (add) {
        if (!updatedMenus.includes(menu)) {
          updatedMenus = [...updatedMenus, menu];
        }
      } else {
        updatedMenus = updatedMenus.filter((m) => m !== menu);
      }
      const rule = { ...currentRule, menus: updatedMenus };
      updates[movie.id] = rule;
      updates[movie.title] = rule;
    });

    setConfig((prev) => ({
      ...prev,
      movies: {
        ...prev.movies,
        ...updates,
      },
    }));

    startTransition(async () => {
      const res = await batchUpdateMenuRolesAction(updates);
      if (res.success && res.config) {
        setConfig(res.config);
        showToast(
          `Updated ${selectedIds.size} titles for menu: ${menu}`,
          "success"
        );
      }
    });
  };

  // Batch set role access
  const handleBatchSetRole = (role: MovieRoleAccess) => {
    if (selectedIds.size === 0) return;

    const updates: Record<string, { menus: NavMenuTarget[]; roleAccess: MovieRoleAccess }> = {};

    selectedIds.forEach((id) => {
      const movie = movies.find((m) => m.id === id);
      if (!movie) return;
      const currentRule = getRule(movie);
      const rule = { ...currentRule, roleAccess: role };
      updates[movie.id] = rule;
      updates[movie.title] = rule;
    });

    setConfig((prev) => ({
      ...prev,
      movies: {
        ...prev.movies,
        ...updates,
      },
    }));

    startTransition(async () => {
      const res = await batchUpdateMenuRolesAction(updates);
      if (res.success && res.config) {
        setConfig(res.config);
        showToast(
          `Updated ${selectedIds.size} titles to role: ${role.toUpperCase()}`,
          "success"
        );
      }
    });
  };

  // Select all / Deselect all
  const handleToggleSelectAll = () => {
    if (selectedIds.size === filteredMovies.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredMovies.map((m) => m.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const videoMeta = previewVideoMovie ? parseVideoSource(previewVideoMovie.videoUrl || "") : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-6 z-50 flex items-center space-x-2 px-4 py-3 rounded-2xl bg-[#1E202B]/95 text-white border border-[#FF9F0A]/40 shadow-[0_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-md animate-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-[#FF9F0A]" />
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-[#FF5500]/15 border border-[#FF5500]/30 text-[#FF5500] text-[10px] font-extrabold uppercase tracking-wider mb-2">
            <Sliders className="w-3 h-3" />
            <span>Navigation &amp; Role-Gated Distribution</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Menu Video &amp; Role Access Control
          </h1>
          <p className="text-xs text-[#8E8E93] mt-1 max-w-2xl">
            Control which films and series appear on the main navigation tabs (<span className="text-white font-semibold">Browse</span>, <span className="text-white font-semibold">TV Shows</span>, <span className="text-white font-semibold">Movies</span>, <span className="text-white font-semibold">New &amp; Popular</span>) and determine access privileges (Public, Free Registered, or VIP Member).
          </p>
        </div>
      </div>

      {/* HUD Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span className="font-semibold flex items-center space-x-1.5">
              <Compass className="w-3.5 h-3.5 text-[#A855F7]" />
              <span>Browse</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-white/40">Home</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.browseCount}</div>
          <p className="text-[11px] text-white/50">Explore shelf &amp; spotlight</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span className="font-semibold flex items-center space-x-1.5">
              <Tv className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>TV Shows</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-white/40">Tab 1</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.tvCount}</div>
          <p className="text-[11px] text-white/50">Series &amp; episodic titles</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span className="font-semibold flex items-center space-x-1.5">
              <Film className="w-3.5 h-3.5 text-[#FF9F0A]" />
              <span>Movies</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-white/40">Tab 2</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.movieCount}</div>
          <p className="text-[11px] text-white/50">Feature films &amp; cinema</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span className="font-semibold flex items-center space-x-1.5">
              <Flame className="w-3.5 h-3.5 text-[#FF5500]" />
              <span>New &amp; Popular</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-white/40">Tab 3</span>
          </div>
          <div className="text-2xl font-black text-white">{metrics.popularCount}</div>
          <p className="text-[11px] text-white/50">High-rated &amp; spotlights</p>
        </div>

        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/5 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-xs text-[#8E8E93]">
            <span className="font-semibold flex items-center space-x-1.5">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>VIP Tier Gated</span>
            </span>
            <span className="text-[10px] uppercase font-bold text-amber-400/60">Subscribers</span>
          </div>
          <div className="text-2xl font-black text-amber-400">{metrics.vipCount}</div>
          <p className="text-[11px] text-white/50">
            {metrics.freeCount} Free • {metrics.publicCount} Public
          </p>
        </div>
      </div>

      {/* Interactive Tabs & Role Preview Bar */}
      <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Menu Selection Tabs */}
          <div className="flex items-center space-x-1.5 p-1 bg-black/40 rounded-xl border border-white/5 overflow-x-auto">
            <button
              onClick={() => setActiveTab("Browse")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "Browse"
                  ? "bg-[#A855F7]/20 text-[#A855F7] border border-[#A855F7]/40 shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Browse ({metrics.browseCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("TV Shows")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "TV Shows"
                  ? "bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              <Tv className="w-3.5 h-3.5" />
              <span>TV Shows ({metrics.tvCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("Movies")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "Movies"
                  ? "bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40 shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Movies ({metrics.movieCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("New & Popular")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "New & Popular"
                  ? "bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>New &amp; Popular ({metrics.popularCount})</span>
            </button>

            <button
              onClick={() => setActiveTab("all")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === "all"
                  ? "bg-white/20 text-white border border-white/30 shadow-sm"
                  : "text-[#8E8E93] hover:text-white"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>All Catalog Matrix ({metrics.total})</span>
            </button>
          </div>

          {/* Role Preview Filter */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#8E8E93] font-semibold flex items-center space-x-1">
              <Eye className="w-3.5 h-3.5 text-[#FF9F0A]" />
              <span>Test Role Access:</span>
            </span>
            <div className="flex items-center space-x-1 p-1 bg-black/40 rounded-xl border border-white/5 text-[11px] font-bold">
              {(
                [
                  { id: "none", label: "Admin Full" },
                  { id: "guest", label: "Guest" },
                  { id: "free_user", label: "Free Member" },
                  { id: "paid_member", label: "VIP Subscriber" },
                ] as const
              ).map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreviewRole(p.id)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    previewRole === p.id
                      ? "bg-[#FF9F0A] text-black font-extrabold shadow-sm"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search & Genre Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search title, genre, or director..."
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-black/30 border border-white/10 text-white text-xs placeholder:text-white/30 focus:border-[#FF9F0A] focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto">
            <span className="text-[11px] text-[#8E8E93] font-medium whitespace-nowrap">Genre:</span>
            {genres.slice(0, 7).map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedGenre === genre
                    ? "bg-white/15 text-white border border-white/20"
                    : "text-white/50 hover:text-white bg-white/5"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Batch Operations Toolbar (when items selected) */}
        {selectedIds.size > 0 && (
          <div className="p-3 rounded-xl bg-[#1A1D27] border border-[#FF9F0A]/40 flex flex-wrap items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">
                {selectedIds.size} titles selected:
              </span>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="text-xs text-white/50 hover:text-white underline cursor-pointer"
              >
                Clear
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-[#8E8E93] font-semibold">Add to:</span>
              <button
                onClick={() => handleBatchSetMenu("Browse", true)}
                className="px-2.5 py-1 rounded-lg bg-[#A855F7]/15 text-[#A855F7] border border-[#A855F7]/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                + Browse
              </button>
              <button
                onClick={() => handleBatchSetMenu("TV Shows", true)}
                className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                + TV Shows
              </button>
              <button
                onClick={() => handleBatchSetMenu("Movies", true)}
                className="px-2.5 py-1 rounded-lg bg-[#FF9F0A]/15 text-[#FF9F0A] border border-[#FF9F0A]/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                + Movies
              </button>
              <button
                onClick={() => handleBatchSetMenu("New & Popular", true)}
                className="px-2.5 py-1 rounded-lg bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                + New &amp; Popular
              </button>

              <div className="h-4 w-px bg-white/20 mx-1" />

              <span className="text-[11px] text-[#8E8E93] font-semibold">Set Role:</span>
              <button
                onClick={() => handleBatchSetRole("public")}
                className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                Public
              </button>
              <button
                onClick={() => handleBatchSetRole("free")}
                className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                Free
              </button>
              <button
                onClick={() => handleBatchSetRole("vip")}
                className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold hover:brightness-110 cursor-pointer"
              >
                VIP
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Table / Grid of Movies */}
      <div className="bg-[#12131A] rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="px-4 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs font-bold text-[#8E8E93]">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={
                filteredMovies.length > 0 && selectedIds.size === filteredMovies.length
              }
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded border-white/20 accent-[#FF9F0A] cursor-pointer"
            />
            <span>
              Showing {filteredMovies.length} titles in{" "}
              <span className="text-white font-extrabold">
                {activeTab === "all" ? "All Menus" : activeTab}
              </span>
            </span>
          </div>

          {previewRole !== "none" && (
            <div className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[11px] font-bold">
              <span>Previewing as:</span>
              <span className="uppercase text-white font-black">{previewRole.replace("_", " ")}</span>
            </div>
          )}
        </div>

        {filteredMovies.length === 0 ? (
          <div className="text-center py-20 px-4 text-[#8E8E93] space-y-3">
            <Film className="w-12 h-12 mx-auto text-white/30" />
            <h3 className="text-base font-bold text-white">No titles match this filter</h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto">
              Try choosing another tab or switch to &quot;All Catalog Matrix&quot; to assign movies to{" "}
              {activeTab}.
            </p>
            <button
              onClick={() => {
                setActiveTab("all");
                setSearchQuery("");
                setSelectedGenre("All");
              }}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold cursor-pointer transition-colors"
            >
              View Full Catalog
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filteredMovies.map((movie) => {
              const rule = getRule(movie);
              const isSelected = selectedIds.has(movie.id);

              // Check simulated role access preview
              const isUnlockedInPreview =
                previewRole === "none"
                  ? true
                  : isMovieAccessibleForRole(rule.roleAccess, previewRole as UserState);

              return (
                <div
                  key={movie.id}
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                    isSelected ? "bg-[#FF9F0A]/5" : "hover:bg-white/[0.02]"
                  }`}
                >
                  {/* Left: Thumbnail & Meta */}
                  <div className="flex items-center space-x-3.5 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectOne(movie.id)}
                      className="w-4 h-4 rounded border-white/20 accent-[#FF9F0A] cursor-pointer"
                    />

                    {/* Poster thumbnail */}
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-[#1D1F2B] border border-white/10 flex-shrink-0">
                      {movie.posterUrl ? (
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Film className="w-4 h-4 text-white/30" />
                        </div>
                      )}

                      {/* Video Preview Button Overlay */}
                      {movie.videoUrl && (
                        <button
                          onClick={() => setPreviewVideoMovie(movie)}
                          title="Preview Video Trailer"
                          className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
                        >
                          <Play className="w-4 h-4 text-white fill-white" />
                        </button>
                      )}
                    </div>

                    {/* Title & Info */}
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-white tracking-tight truncate">
                          {movie.title}
                        </h4>
                        {previewRole !== "none" && (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isUnlockedInPreview
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {isUnlockedInPreview ? "Unlocked" : "Gated / Paywall"}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#8E8E93]">
                        <span>{movie.releaseYear}</span>
                        <span>•</span>
                        <span>{movie.duration}m</span>
                        <span>•</span>
                        <span className="text-white/60">
                          {movie.genres?.map((g) => g.name).join(", ") || "General"}
                        </span>
                        {movie.videoUrl && (
                          <button
                            onClick={() => setPreviewVideoMovie(movie)}
                            className="inline-flex items-center space-x-1 text-[#FF9F0A] hover:underline cursor-pointer"
                          >
                            <Play className="w-3 h-3 fill-[#FF9F0A]" />
                            <span>Preview Video</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Menu Checkboxes & Role Access Selector */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 self-end md:self-center">
                    {/* Menu Checkbox Toggles */}
                    <div className="space-y-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8E8E93]">
                        Display On Menus:
                      </span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleMenu(movie, "Browse")}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            rule.menus.includes("Browse")
                              ? "bg-[#A855F7]/20 text-[#A855F7] border-[#A855F7]/40"
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <Compass className="w-3 h-3" />
                          <span>Browse</span>
                          {rule.menus.includes("Browse") && <Check className="w-3 h-3 ml-0.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleMenu(movie, "TV Shows")}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            rule.menus.includes("TV Shows")
                              ? "bg-[#00E5FF]/20 text-[#00E5FF] border-[#00E5FF]/40"
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <Tv className="w-3 h-3" />
                          <span>TV Shows</span>
                          {rule.menus.includes("TV Shows") && <Check className="w-3 h-3 ml-0.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleMenu(movie, "Movies")}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            rule.menus.includes("Movies")
                              ? "bg-[#FF9F0A]/20 text-[#FF9F0A] border-[#FF9F0A]/40"
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <Film className="w-3 h-3" />
                          <span>Movies</span>
                          {rule.menus.includes("Movies") && <Check className="w-3 h-3 ml-0.5" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleToggleMenu(movie, "New & Popular")}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            rule.menus.includes("New & Popular")
                              ? "bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/40"
                              : "bg-white/5 text-white/40 border-white/5 hover:border-white/20"
                          }`}
                        >
                          <Flame className="w-3 h-3" />
                          <span>New &amp; Popular</span>
                          {rule.menus.includes("New & Popular") && (
                            <Check className="w-3 h-3 ml-0.5" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Role Access Selector */}
                    <div className="space-y-1 min-w-[170px]">
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-[#8E8E93]">
                        Role Access Required:
                      </span>
                      <select
                        value={rule.roleAccess}
                        onChange={(e) =>
                          handleChangeRole(movie, e.target.value as MovieRoleAccess)
                        }
                        className={`w-full h-8 px-2.5 rounded-lg text-xs font-bold border focus:outline-none transition-colors cursor-pointer ${
                          rule.roleAccess === "vip"
                            ? "bg-amber-400/15 text-amber-300 border-amber-400/40"
                            : rule.roleAccess === "free"
                            ? "bg-sky-400/15 text-sky-300 border-sky-400/40"
                            : rule.roleAccess === "admin"
                            ? "bg-rose-500/15 text-rose-300 border-rose-500/40"
                            : "bg-emerald-400/15 text-emerald-300 border-emerald-400/40"
                        }`}
                      >
                        <option value="public" className="bg-[#12131A] text-white">
                          🟢 Public (All Visitors)
                        </option>
                        <option value="free" className="bg-[#12131A] text-white">
                          🔵 Free Registered Member
                        </option>
                        <option value="vip" className="bg-[#12131A] text-white">
                          🟡 VIP Subscriber ($4.99)
                        </option>
                        <option value="admin" className="bg-[#12131A] text-white">
                          🔴 Admin Only (Internal)
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Video Preview Popup Modal */}
      {previewVideoMovie && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
          onClick={() => setPreviewVideoMovie(null)}
        >
          <div
            className="relative w-full max-w-3xl rounded-3xl bg-[#0E0F14] border border-white/10 overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {previewVideoMovie.title}
                </h3>
                <p className="text-xs text-[#8E8E93]">Video Stream &amp; Trailer Inspector</p>
              </div>
              <button
                onClick={() => setPreviewVideoMovie(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video w-full bg-black">
              {videoMeta?.type === "youtube" && videoMeta.embedUrl ? (
                <iframe
                  src={videoMeta.embedUrl}
                  title={previewVideoMovie.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : videoMeta?.type === "vimeo" && videoMeta.embedUrl ? (
                <iframe
                  src={videoMeta.embedUrl}
                  title={previewVideoMovie.title}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              ) : videoMeta?.rawUrl ? (
                <video
                  src={videoMeta.rawUrl}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-[#8E8E93]">
                  <AlertCircle className="w-10 h-10 mb-2 opacity-40 text-amber-400" />
                  <p className="text-sm font-bold text-white">No stream URL specified</p>
                  <p className="text-xs mt-1">
                    Edit this movie in Movies Catalog to attach a YouTube, Vimeo, or direct MP4 trailer link.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white/[0.02] border-t border-white/5 flex items-center justify-between text-xs text-[#8E8E93]">
              <div className="flex items-center space-x-2">
                <span>Assigned Menus:</span>
                <span className="text-white font-bold">
                  {getRule(previewVideoMovie).menus.join(", ") || "None"}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Access Requirement:</span>
                <span className="text-[#FF9F0A] font-bold uppercase">
                  {getRule(previewVideoMovie).roleAccess}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
