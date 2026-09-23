"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  Users,
  Film,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Sparkles,
  ArrowUpDown,
  Search,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  UserCheck,
  Shield,
  Layers,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { MovieData } from "@/lib/movies";
import { CastDataConfig, CastMember } from "@/lib/cast";
import {
  saveMovieCastAction,
  deleteMovieCastAction,
  saveDefaultCastAction,
} from "@/app/actions/cast";

interface CastManagementClientProps {
  initialConfig: CastDataConfig;
  movies: MovieData[];
}

const PRESET_AVATARS = [
  { label: "Male 1", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80" },
  { label: "Male 2", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80" },
  { label: "Male 3", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80" },
  { label: "Male 4", url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80" },
  { label: "Male 5", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80" },
  { label: "Female 1", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80" },
  { label: "Female 2", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80" },
  { label: "Female 3", url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80" },
];

export default function CastManagementClient({
  initialConfig,
  movies,
}: CastManagementClientProps) {
  const [config, setConfig] = useState<CastDataConfig>(initialConfig);
  const [activeTab, setActiveTab] = useState<"movies" | "default">("movies");
  const [searchMovie, setSearchMovie] = useState("");
  
  // Selected movie for movie-specific cast editing
  const [selectedMovieTitle, setSelectedMovieTitle] = useState<string>(() => {
    return movies[0]?.title || "John wick 4";
  });

  // Current cast list being edited
  const [currentCast, setCurrentCast] = useState<CastMember[]>(() => {
    return (
      initialConfig.movies[movies[0]?.title || "John wick 4"] ||
      initialConfig.defaultCast
    );
  });

  // Edit / Add modal or drawer state
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formAvatar, setFormAvatar] = useState("");
  const [showMemberModal, setShowMemberModal] = useState(false);

  // Saving states
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filtered movies list for selector
  const filteredMovies = useMemo(() => {
    if (!searchMovie.trim()) return movies;
    const q = searchMovie.toLowerCase().trim();
    return movies.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        m.genres?.some((g) => g.name.toLowerCase().includes(q))
    );
  }, [movies, searchMovie]);

  // When selected movie changes or tab switches
  const handleSelectMovie = (title: string) => {
    setSelectedMovieTitle(title);
    const existing = config.movies[title];
    if (existing && existing.length > 0) {
      setCurrentCast([...existing]);
    } else {
      // Pre-fill with default cast if not yet customized
      setCurrentCast([...(config.defaultCast || [])]);
    }
  };

  const handleSwitchTab = (tab: "movies" | "default") => {
    setActiveTab(tab);
    if (tab === "default") {
      setCurrentCast([...(config.defaultCast || [])]);
    } else {
      const existing = config.movies[selectedMovieTitle];
      setCurrentCast(existing ? [...existing] : [...(config.defaultCast || [])]);
    }
  };

  // Open add member
  const handleOpenAdd = () => {
    setEditingIndex(null);
    setFormName("");
    setFormRole("");
    setFormAvatar(PRESET_AVATARS[0].url);
    setShowMemberModal(true);
  };

  // Open edit member
  const handleOpenEdit = (index: number) => {
    setEditingIndex(index);
    const item = currentCast[index];
    setFormName(item.name);
    setFormRole(item.role);
    setFormAvatar(item.avatar);
    setShowMemberModal(true);
  };

  // Save member into current list
  const handleSaveMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification("Actor/Member name is required", "error");
      return;
    }
    if (!formRole.trim()) {
      showNotification("Character/Role is required", "error");
      return;
    }
    const avatarUrl =
      formAvatar.trim() ||
      PRESET_AVATARS[0].url;

    const newMember: CastMember = {
      name: formName.trim(),
      role: formRole.trim(),
      avatar: avatarUrl,
    };

    if (editingIndex !== null) {
      const updated = [...currentCast];
      updated[editingIndex] = newMember;
      setCurrentCast(updated);
    } else {
      setCurrentCast([...currentCast, newMember]);
    }

    setShowMemberModal(false);
  };

  // Delete member
  const handleDeleteMember = (index: number) => {
    const updated = currentCast.filter((_, i) => i !== index);
    setCurrentCast(updated);
  };

  // Move member position
  const handleMoveMember = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentCast.length) return;
    const updated = [...currentCast];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setCurrentCast(updated);
  };

  // Save current list to server
  const handleSaveToServer = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "default") {
        const res = await saveDefaultCastAction(currentCast);
        if (res.success) {
          setConfig(res.config);
          showNotification("Global Default Cast updated successfully!");
        }
      } else {
        const res = await saveMovieCastAction(selectedMovieTitle, currentCast);
        if (res.success) {
          setConfig(res.config);
          showNotification(`Cast for "${selectedMovieTitle}" saved successfully!`);
        }
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to save changes. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Reset movie cast back to default
  const handleResetMovieCast = async () => {
    if (!confirm(`Reset custom cast for "${selectedMovieTitle}" to global default?`)) {
      return;
    }
    setIsSaving(true);
    try {
      const res = await deleteMovieCastAction(selectedMovieTitle);
      if (res.success) {
        setConfig(res.config);
        setCurrentCast([...res.config.defaultCast]);
        showNotification(`Cast for "${selectedMovieTitle}" reverted to default.`);
      }
    } catch (err) {
      console.error(err);
      showNotification("Failed to reset cast.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // Current movie details if in movie tab
  const currentMovieObj = movies.find(
    (m) => m.title.toLowerCase() === selectedMovieTitle.toLowerCase()
  );

  const isCustomizedForSelectedMovie = Boolean(
    config.movies[selectedMovieTitle] && config.movies[selectedMovieTitle].length > 0
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl border shadow-2xl flex items-center space-x-3 text-sm font-bold backdrop-blur-md animate-in slide-in-from-top-4 duration-300 ${
            feedback.type === "success"
              ? "bg-[#091E16]/90 border-emerald-500/40 text-emerald-400"
              : "bg-[#2A0E12]/90 border-rose-500/40 text-rose-400"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header & Stats Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#12131C] via-[#0E0F15] to-[#0A0A0E] border border-white/10 p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-b from-[#00F0FF]/10 via-[#FF9F0A]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#00F0FF]/10 border border-[#00F0FF]/20 text-[#00F0FF] text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Dynamic Talent & Credit Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Cast & Crew Manager
            </h1>
            <p className="text-sm text-white/60 max-w-2xl leading-relaxed">
              Dynamically assign lead actors, character roles, and avatars per movie or set global default talent credits for catalog streaming.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="flex items-center space-x-3">
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-black text-[#00F0FF]">
                {Object.keys(config.movies).length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Custom Titles
              </div>
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-center min-w-[100px]">
              <div className="text-xl font-black text-[#FF9F0A]">
                {config.defaultCast.length}
              </div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-white/40">
                Default Cast
              </div>
            </div>
          </div>
        </div>

        {/* Tab Switcher: Movie Cast vs Global Default */}
        <div className="mt-8 flex items-center space-x-3 border-b border-white/10 pb-4">
          <button
            onClick={() => handleSwitchTab("movies")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === "movies"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Film className="w-4 h-4" />
            <span>Movie-Specific Cast</span>
          </button>

          <button
            onClick={() => handleSwitchTab("default")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
              activeTab === "default"
                ? "bg-white text-black shadow-lg shadow-white/10"
                : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/5"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Global Default Cast</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Movie Picker (Only when in "movies" tab) */}
        {activeTab === "movies" && (
          <div className="lg:col-span-4 space-y-4">
            <div className="p-4 rounded-2xl bg-[#0F1017] border border-white/10 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-white/60">
                Select Film / Series
              </div>

              {/* Search bar */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search catalog titles..."
                  value={searchMovie}
                  onChange={(e) => setSearchMovie(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs sm:text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]/50"
                />
              </div>

              {/* Movie list items */}
              <div className="max-h-[520px] overflow-y-auto no-scrollbar space-y-2 pr-1">
                {filteredMovies.map((m) => {
                  const isSelected =
                    m.title.toLowerCase() === selectedMovieTitle.toLowerCase();
                  const hasCustom = Boolean(
                    config.movies[m.title] && config.movies[m.title].length > 0
                  );

                  return (
                    <button
                      key={m.id || m.title}
                      onClick={() => handleSelectMovie(m.title)}
                      className={`w-full p-2.5 rounded-xl border text-left flex items-center space-x-3 transition-all ${
                        isSelected
                          ? "bg-white/[0.08] border-[#00F0FF]/50 shadow-md shadow-[#00F0FF]/5"
                          : "bg-black/20 hover:bg-white/[0.04] border-white/5"
                      }`}
                    >
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-black">
                        <Image
                          src={m.posterUrl}
                          alt={m.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {m.title}
                        </div>
                        <div className="flex items-center space-x-2 text-[10px] text-white/40 mt-0.5">
                          <span>{m.releaseYear}</span>
                          <span>•</span>
                          <span>{m.genres?.[0]?.name || "Movie"}</span>
                        </div>
                      </div>

                      {hasCustom && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Custom
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Right Column: Cast Editor Pane */}
        <div className={activeTab === "movies" ? "lg:col-span-8 space-y-6" : "lg:col-span-12 space-y-6"}>
          {/* Selected Film Context Bar */}
          <div className="p-5 rounded-2xl bg-[#0F1017] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white">
                  {activeTab === "movies"
                    ? selectedMovieTitle
                    : "Global Fallback Cast"}
                </h2>
                {activeTab === "movies" && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      isCustomizedForSelectedMovie
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                        : "bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/30"
                    }`}
                  >
                    {isCustomizedForSelectedMovie ? "Custom Cast Active" : "Using Default"}
                  </span>
                )}
              </div>
              <p className="text-xs text-white/50 mt-1">
                {activeTab === "movies"
                  ? `Configuring cast members shown in the modal Key Cast row and "Cast & Crew" tab for this title.`
                  : "These cast members appear automatically for any movie in the catalog that doesn't have custom talent defined."}
              </p>
            </div>

            {/* Action Buttons: Add Member & Save */}
            <div className="flex items-center space-x-2.5 flex-shrink-0">
              {activeTab === "movies" && isCustomizedForSelectedMovie && (
                <button
                  onClick={handleResetMovieCast}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-bold transition-all"
                  title="Remove custom cast and revert to default"
                >
                  Reset
                </button>
              )}

              <button
                onClick={handleOpenAdd}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center space-x-1.5 transition-all border border-white/10"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Member</span>
              </button>

              <button
                onClick={handleSaveToServer}
                disabled={isSaving}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF9F0A] to-[#FF7B00] hover:brightness-110 active:scale-95 text-black font-extrabold text-xs sm:text-sm flex items-center space-x-2 transition-all shadow-lg shadow-[#FF9F0A]/20 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Cast Cards Grid */}
          {currentCast.length === 0 ? (
            <div className="p-12 rounded-3xl bg-[#0F1017] border border-dashed border-white/15 text-center space-y-4">
              <Users className="w-10 h-10 text-white/30 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No Cast Members Configured</h3>
                <p className="text-xs text-white/50 max-w-sm mx-auto mt-1">
                  Add actor profiles with character names and avatars to enrich this title's presentation.
                </p>
              </div>
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 rounded-xl bg-[#00F0FF]/15 text-[#00F0FF] border border-[#00F0FF]/30 text-xs font-bold hover:bg-[#00F0FF]/25 transition-all"
              >
                + Add First Cast Member
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentCast.map((member, idx) => (
                <div
                  key={`${member.name}-${idx}`}
                  className="p-4 rounded-2xl bg-[#0F1017] border border-white/10 flex items-center justify-between space-x-3 group hover:border-white/20 transition-all shadow-lg"
                >
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-black/40 border border-white/15 shadow-inner">
                      <Image
                        src={member.avatar || PRESET_AVATARS[0].url}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-bold text-white truncate">
                        {member.name}
                      </div>
                      <div className="text-xs text-[#FF9F0A] font-medium truncate">
                        {member.role}
                      </div>
                      <div className="text-[10px] text-white/40 mt-0.5">
                        Position #{idx + 1}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Reorder, Edit, Delete */}
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <button
                      onClick={() => handleMoveMember(idx, "up")}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors"
                      title="Move up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveMember(idx, "down")}
                      disabled={idx === currentCast.length - 1}
                      className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-20 transition-colors"
                      title="Move down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(idx)}
                      className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                      title="Edit member"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(idx)}
                      className="p-1.5 rounded-lg text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete member"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* ADD / EDIT MEMBER MODAL                                   */}
      {/* ========================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-md rounded-3xl bg-[#11121A] border border-white/15 p-6 shadow-2xl space-y-5 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-base font-bold">
                {editingIndex !== null ? "Edit Cast Member" : "Add Cast Member"}
              </h3>
              <button
                onClick={() => setShowMemberModal(false)}
                className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4">
              {/* Actor Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Actor / Talent Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Keanu Reeves"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Character / Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Character / Role Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Wick / Lead Protagonist"
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              {/* Avatar Image URL & Preview */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-white/70">Avatar Image URL</label>
                <div className="flex items-center space-x-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-black/50 border border-white/20 flex-shrink-0">
                    {formAvatar ? (
                      <Image
                        src={formAvatar}
                        alt="Preview"
                        fill
                        className="object-cover"
                        sizes="48px"
                      />
                    ) : (
                      <Users className="w-5 h-5 text-white/30 m-auto mt-3.5" />
                    )}
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formAvatar}
                    onChange={(e) => setFormAvatar(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#00F0FF]"
                  />
                </div>
              </div>

              {/* Avatar Quick Presets */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
                  Quick Portrait Presets
                </label>
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-1">
                  {PRESET_AVATARS.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setFormAvatar(preset.url)}
                      className={`relative w-8 h-8 rounded-full overflow-hidden border flex-shrink-0 transition-transform hover:scale-110 ${
                        formAvatar === preset.url
                          ? "border-[#00F0FF] ring-2 ring-[#00F0FF]/40"
                          : "border-white/20"
                      }`}
                      title={preset.label}
                    >
                      <Image
                        src={preset.url}
                        alt={preset.label}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00F0FF] text-black text-xs font-black hover:bg-[#00F0FF]/90 transition-all shadow-lg shadow-[#00F0FF]/20"
                >
                  {editingIndex !== null ? "Update Member" : "Add to List"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
