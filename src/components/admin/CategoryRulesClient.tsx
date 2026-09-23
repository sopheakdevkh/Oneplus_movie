"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Shield,
  Crown,
  Users,
  Globe,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  Layers,
  Sparkles,
  Sliders,
  Eye,
  ArrowRight,
  Tv,
} from "lucide-react";
import {
  CategoryAccessLevel,
  CatalogLimits,
  CategoryRulesConfig,
} from "@/lib/category-rules";
import {
  updateCategoryRuleAction,
  updateCatalogLimitsAction,
} from "@/app/actions/category-rules";
import { GenreWithCount } from "@/app/actions/genres";

interface CategoryRulesClientProps {
  initialConfig: CategoryRulesConfig;
  genres: GenreWithCount[];
}

export default function CategoryRulesClient({
  initialConfig,
  genres,
}: CategoryRulesClientProps) {
  const [config, setConfig] = useState<CategoryRulesConfig>(initialConfig);
  const [limitsForm, setLimitsForm] = useState<CatalogLimits>(initialConfig.limits);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Search filter for category list
  const [categorySearch, setCategorySearch] = useState("");

  // Role simulator preview tab
  const [previewRole, setPreviewRole] = useState<"guest" | "free_user" | "paid_member">("guest");

  const triggerToast = (text: string, type: "success" | "error" = "success") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle individual category rule change
  const handleRuleChange = (slug: string, newLevel: CategoryAccessLevel) => {
    setConfig((prev) => ({
      ...prev,
      rules: {
        ...prev.rules,
        [slug]: newLevel,
      },
    }));

    startTransition(async () => {
      const res = await updateCategoryRuleAction(slug, newLevel);
      if (res.success && res.config) {
        setConfig(res.config);
        triggerToast(`Updated rule for "${slug}" to ${newLevel.toUpperCase()}`);
      } else {
        triggerToast(res.error || "Failed to update category rule", "error");
      }
    });
  };

  // Handle global limits save
  const handleSaveLimits = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateCatalogLimitsAction(limitsForm);
      if (res.success && res.config) {
        setConfig(res.config);
        triggerToast("Catalog and search limits saved successfully!");
      } else {
        triggerToast(res.error || "Failed to save limits", "error");
      }
    });
  };

  const filteredGenres = genres.filter((g) =>
    g.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    g.slug.toLowerCase().includes(categorySearch.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 text-sm font-bold border animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === "success"
              ? "bg-[#10221B] text-emerald-400 border-emerald-500/40"
              : "bg-[#2A1015] text-rose-400 border-rose-500/40"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#EB0029]/10 border border-[#EB0029]/20 text-[#EB0029] text-xs font-bold uppercase tracking-wider mb-2">
            <Sliders className="w-3.5 h-3.5" />
            <span>Catalog Access Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Category &amp; Search Limits
          </h1>
          <p className="text-xs sm:text-sm text-[#8E8E93] mt-1 max-w-2xl">
            Control which categories are public, require a free registration, or are reserved exclusively for VIP Club members. Configure discovery and live search limits per tier.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/genres"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center space-x-2"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Genres</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#EB0029] text-white text-xs font-bold shadow-lg shadow-[#EB0029]/25 hover:brightness-110 transition-all flex items-center space-x-2"
          >
            <span>Preview Live Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Rule Hierarchy Explainer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tier 1: Public */}
        <div className="p-5 rounded-3xl bg-[#0F1118] border border-white/10 space-y-2 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70">
            <Globe className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>🌐 Public Access</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
              Tier 1
            </span>
          </h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Open to all audiences. Unregistered guests, free accounts, and VIP members can freely explore these shelves.
          </p>
        </div>

        {/* Tier 2: Free Account */}
        <div className="p-5 rounded-3xl bg-[#0F1118] border border-[#FF5500]/20 space-y-2 relative overflow-hidden">
          <div className="w-10 h-10 rounded-2xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>👤 Free Account Required</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#FF5500]/20 text-[#FF5500] font-mono">
              Tier 2
            </span>
          </h3>
          <p className="text-xs text-[#8E8E93] leading-relaxed">
            Requires email signup. Guests see a locked shelf teaser with a prompt to create an account to unlock.
          </p>
        </div>

        {/* Tier 3: VIP Club Only */}
        <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181B26] to-[#0F1118] border border-amber-400/30 space-y-2 relative overflow-hidden shadow-lg shadow-amber-500/5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
            <Crown className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>👑 VIP Member Exclusive</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
              Tier 3
            </span>
          </h3>
          <p className="text-xs text-amber-200/70 leading-relaxed">
            Reserved for paid subscribers and administrators. Guests and free users see a frosted gold paywall shelf.
          </p>
        </div>
      </div>

      {/* Global Catalog Limits Config Form */}
      <form
        onSubmit={handleSaveLimits}
        className="p-6 sm:p-8 rounded-3xl bg-[#0F1118] border border-white/10 space-y-6 shadow-xl"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-lg font-bold text-white">Discovery &amp; Search Limits Configuration</h2>
            <p className="text-xs text-[#8E8E93]">
              Set the maximum number of shelves and search results allowed for each audience tier.
            </p>
          </div>
          <button
            type="submit"
            disabled={isPending}
            className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center space-x-2 self-start sm:self-center cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isPending ? "Saving Changes..." : "Save Limit Rules"}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Guest Shelf Limit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">
              Guest Shelf Display Limit
            </label>
            <p className="text-[11px] text-[#8E8E93]">
              Max category shelves visible to guests before shelf gating applies.
            </p>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="20"
                value={limitsForm.guestCategoryLimit}
                onChange={(e) =>
                  setLimitsForm({
                    ...limitsForm,
                    guestCategoryLimit: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#FF5500]"
              />
              <span className="absolute right-4 top-2.5 text-xs text-white/40 font-semibold">
                shelves
              </span>
            </div>
          </div>

          {/* Guest Search Limit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">
              Guest Search Results Cap
            </label>
            <p className="text-[11px] text-[#8E8E93]">
              Max live search results shown to guests before sign-in callout.
            </p>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="50"
                value={limitsForm.guestSearchLimit}
                onChange={(e) =>
                  setLimitsForm({
                    ...limitsForm,
                    guestSearchLimit: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#FF5500]"
              />
              <span className="absolute right-4 top-2.5 text-xs text-white/40 font-semibold">
                results
              </span>
            </div>
          </div>

          {/* Free User Search Limit */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-white block">
              Free User Search Results Cap
            </label>
            <p className="text-[11px] text-[#8E8E93]">
              Max search results returned for registered free accounts.
            </p>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="100"
                value={limitsForm.freeSearchLimit}
                onChange={(e) =>
                  setLimitsForm({
                    ...limitsForm,
                    freeSearchLimit: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl bg-black/50 border border-white/10 text-white font-bold text-sm focus:outline-none focus:border-[#FF5500]"
              />
              <span className="absolute right-4 top-2.5 text-xs text-white/40 font-semibold">
                results
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Role Simulator Bar */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0B0C12] border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/70">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Live Audience Simulator</h4>
            <p className="text-[11px] text-[#8E8E93]">
              Toggle to test which categories are unlocked or paywalled for each user tier.
            </p>
          </div>
        </div>

        <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setPreviewRole("guest")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewRole === "guest"
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            👤 Guest
          </button>
          <button
            type="button"
            onClick={() => setPreviewRole("free_user")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewRole === "free_user"
                ? "bg-[#FF5500]/20 text-[#FF5500] shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            🆓 Free User
          </button>
          <button
            type="button"
            onClick={() => setPreviewRole("paid_member")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              previewRole === "paid_member"
                ? "bg-amber-400/20 text-amber-300 shadow-sm"
                : "text-white/50 hover:text-white"
            }`}
          >
            👑 VIP Member
          </button>
        </div>
      </div>

      {/* Category Access Rules Management Table */}
      <div className="rounded-3xl bg-[#0F1118] border border-white/10 overflow-hidden shadow-2xl">
        {/* Search & Filter Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Category Access Rules
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/10 text-white/70">
              {filteredGenres.length} categories
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-white/40 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter categories..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Categories List */}
        <div className="divide-y divide-white/5">
          {filteredGenres.map((genre, idx) => {
            const currentRule: CategoryAccessLevel = config.rules[genre.slug] || "public";

            // Determine if simulated role has access
            let isUnlockedInSimulator = true;
            let statusText = "Unlocked";

            if (currentRule === "free") {
              if (previewRole === "guest") {
                isUnlockedInSimulator = false;
                statusText = "Locked (Requires Free Account)";
              }
            } else if (currentRule === "vip") {
              if (previewRole !== "paid_member") {
                isUnlockedInSimulator = false;
                statusText = "Locked (VIP Exclusive)";
              }
            }

            return (
              <div
                key={genre.id || genre.slug}
                className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Category Info */}
                <div className="space-y-1">
                  <div className="flex items-center space-x-2.5">
                    <h4 className="text-sm sm:text-base font-bold text-white">
                      {genre.name}
                    </h4>
                    <span className="text-[11px] font-mono text-white/40 px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {genre.slug}
                    </span>
                    {genre._count && (
                      <span className="text-xs text-[#8E8E93] font-medium">
                        • {genre._count.movies} titles
                      </span>
                    )}
                  </div>

                  {/* Simulator indicator */}
                  <div className="flex items-center space-x-2 text-[11px]">
                    <span className="text-white/40">In Simulator ({previewRole}):</span>
                    <span
                      className={`font-semibold flex items-center space-x-1 ${
                        isUnlockedInSimulator ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {isUnlockedInSimulator ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Lock className="w-3 h-3" />
                      )}
                      <span>{statusText}</span>
                    </span>
                  </div>
                </div>

                {/* 3-Way Rule Selector */}
                <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 self-start md:self-center">
                  <button
                    type="button"
                    onClick={() => handleRuleChange(genre.slug, "public")}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRule === "public"
                        ? "bg-white/20 text-white shadow-md"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>Public</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRuleChange(genre.slug, "free")}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRule === "free"
                        ? "bg-[#FF5500]/25 text-[#FF5500] shadow-md border border-[#FF5500]/30"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Free User</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRuleChange(genre.slug, "vip")}
                    disabled={isPending}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      currentRule === "vip"
                        ? "bg-amber-400/25 text-amber-300 shadow-md border border-amber-400/30"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    <Crown className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>VIP Only</span>
                  </button>
                </div>
              </div>
            );
          })}

          {filteredGenres.length === 0 && (
            <div className="p-12 text-center text-white/50">
              No categories found matching &quot;{categorySearch}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
