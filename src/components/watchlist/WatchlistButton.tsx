"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Check, Plus, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export interface WatchlistButtonProps {
  movieId: string;
  movieTitle?: string;
  className?: string;
  initialSaved?: boolean;
}

export default function WatchlistButton({
  movieId,
  movieTitle = "Movie",
  className = "",
  initialSaved = false,
}: WatchlistButtonProps) {
  const { userState, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const [limitError, setLimitError] = useState<string | null>(null);

  // Clear limit error when clicking outside or switching tier
  useEffect(() => {
    setLimitError(null);
  }, [userState]);

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Guest: Clicking "Bookmark/Save" opens the Auth Modal and queues the bookmark action
    if (userState === "guest") {
      openAuthModal({
        title: "Save to Your Watchlist",
        subtitle: `Create a free account to save "${movieTitle}" and build your personal cinema library.`,
        defaultTab: "signup",
        onSuccess: async () => {
          setIsLoading(true);
          try {
            const res = await fetch("/api/watchlist", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ movieId, action: "add" }),
            });
            if (res.ok) setIsSaved(true);
          } catch {
            setIsSaved(true);
          } finally {
            setIsLoading(false);
          }
        },
      });
      return;
    }

    // If removing, always allow
    if (isSaved) {
      setIsSaved(false);
      setLimitError(null);
      try {
        await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ movieId, action: "remove" }),
        });
      } catch {
        // ignore
      }
      return;
    }

    // If adding:
    setIsLoading(true);
    setLimitError(null);

    try {
      const res = await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ movieId, action: "add" }),
      });

      const data = await res.json();

      if (res.status === 401) {
        openAuthModal();
        return;
      }

      if (res.status === 403 && data.code === "WATCHLIST_LIMIT_REACHED") {
        // Free limit reached (5/5)
        setLimitError(
          data.error || "Free limit reached (5/5). Upgrade to Member for unlimited watchlists."
        );
        return;
      }

      if (res.ok) {
        setIsSaved(true);
      }
    } catch (err) {
      // Fallback for demo when backend database connection is not reachable
      if (userState === "free_user") {
        // Check simulated count in localStorage or session
        const stored = JSON.parse(localStorage.getItem("lensimpact_watchlist") || "[]");
        if (stored.length >= 5 && !stored.includes(movieId)) {
          setLimitError("Free limit reached (5/5). Upgrade to Member for unlimited watchlists.");
          return;
        }
        stored.push(movieId);
        localStorage.setItem("lensimpact_watchlist", JSON.stringify(stored));
        setIsSaved(true);
      } else {
        // Member or Admin: Unlimited
        setIsSaved(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isLoading}
        aria-label={isSaved ? "Remove from watchlist" : "Save to watchlist"}
        className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
          isSaved
            ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
            : "bg-white/5 hover:bg-white/10 text-white border-white/10"
        } ${className}`}
      >
        {isSaved ? (
          <>
            <Check className="w-4 h-4 text-[#00F0FF]" />
            <span>In Watchlist</span>
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            <span>Watchlist</span>
          </>
        )}
      </button>

      {/* Free Tier Limit Notification Card */}
      {limitError && (
        <div className="absolute left-0 bottom-full mb-3 w-72 sm:w-80 p-4 rounded-2xl bg-[#141622] border border-[#FF5500]/40 shadow-[0_10px_35px_rgba(0,0,0,0.8)] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-start space-x-3">
            <div className="p-1.5 rounded-lg bg-[#FF5500]/15 text-[#FF5500] shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-bold text-white">Watchlist Quota Exceeded</h5>
              <p className="text-[11px] text-white/70 leading-snug">{limitError}</p>
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setLimitError(null)}
              className="text-[10px] text-white/50 hover:text-white transition-colors"
            >
              Dismiss
            </button>
            <Link
              href="/pricing"
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#FF5500] to-[#EB0029] text-white text-[10px] font-bold shadow-[0_0_12px_rgba(255,85,0,0.4)] hover:shadow-[0_0_18px_rgba(255,85,0,0.6)] flex items-center space-x-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Upgrade to Member</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
