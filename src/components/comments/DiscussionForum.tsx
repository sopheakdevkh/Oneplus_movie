"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Star,
  Pin,
  EyeOff,
  Trash2,
  LogIn,
  Send,
  Sparkles,
  Shield,
  MessageSquare,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import UserBadge from "@/components/comments/UserBadge";
import { UserState } from "@/types/user";

export interface CommentItem {
  id: string;
  authorName: string;
  authorEmail?: string;
  authorAvatar: string;
  userTier: UserState;
  rating: number; // 1 - 5 stars
  content: string;
  createdAt: string;
  isPinned?: boolean;
  isHidden?: boolean;
}

const INITIAL_COMMENTS: CommentItem[] = [
  {
    id: "c-pinned-admin",
    authorName: "Sopheak Dev",
    authorAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
    userTier: "admin",
    rating: 5,
    content:
      "Welcome to the discussion circle! Keep critiques focused on cinematographic themes, narrative pacing, and ideological conflict. Spoilers must be tagged appropriately.",
    createdAt: "Pinned Moderator Note",
    isPinned: true,
  },
  {
    id: "c-member-1",
    authorName: "Elena Vance, PhD",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
    userTier: "paid_member",
    rating: 5,
    content:
      "The turning point in the second act mirrors classical Greek tragedy: the illusion of control becomes the protagonist's actual undoing. Exceptional sound design in the finale.",
    createdAt: "2 hours ago",
  },
  {
    id: "c-member-2",
    authorName: "Marcus Thorne",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80",
    userTier: "paid_member",
    rating: 4,
    content:
      "The color grade shift from warm amber to cold desaturated cyan effectively signals emotional detachment before the climax.",
    createdAt: "5 hours ago",
  },
  {
    id: "c-user-1",
    authorName: "Alex Rivera",
    authorAvatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80",
    userTier: "free_user",
    rating: 4,
    content:
      "Really enjoyed the pacing! The third act kept me glued to the screen. Would recommend watching with headphones.",
    createdAt: "Yesterday",
  },
];

interface DiscussionForumProps {
  movieTitle?: string;
  className?: string;
}

export default function DiscussionForum({
  movieTitle = "Film",
  className = "",
}: DiscussionForumProps) {
  const { user, userState, isAdmin, openAuthModal, setUserState } = useAuth();
  const [comments, setComments] = useState<CommentItem[]>(INITIAL_COMMENTS);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Submit comment (Free User, Member, Admin)
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const item: CommentItem = {
      id: `c-${Date.now()}`,
      authorName: user?.name || "Film Club Cinephile",
      authorEmail: user?.email,
      authorAvatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80",
      userTier: userState,
      rating: newRating,
      content: newComment.trim(),
      createdAt: "Just now",
      isPinned: false,
      isHidden: false,
    };

    setComments((prev) => [item, ...prev]);
    setNewComment("");
    triggerToast("Comment & rating submitted successfully!");
  };

  // Admin inline actions
  const handleTogglePin = (id: string) => {
    if (!isAdmin) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isPinned: !c.isPinned } : c
      )
    );
    triggerToast("Comment pin status updated by Admin.");
  };

  const handleToggleHide = (id: string) => {
    if (!isAdmin) return;
    setComments((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, isHidden: !c.isHidden } : c
      )
    );
    triggerToast("Comment visibility toggled by Admin.");
  };

  const handleDelete = (id: string) => {
    if (!isAdmin) return;
    setComments((prev) => prev.filter((c) => c.id !== id));
    triggerToast("Comment deleted by Admin.");
  };

  // Sort pinned comments to top
  const sortedComments = [...comments].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161822] border border-[#FF5500]/50 text-white text-xs px-4 py-2.5 rounded-xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Role Switching Evaluator for Testing */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
        <span className="text-white/60 text-[11px] font-medium flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
          Viewing comments as:
        </span>
        <div className="flex items-center gap-1.5">
          {(["guest", "free_user", "paid_member", "admin"] as UserState[]).map((state) => (
            <button
              key={state}
              type="button"
              onClick={() => setUserState(state)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                userState === state
                  ? "bg-[#FF5500] text-white shadow-md shadow-[#FF5500]/30"
                  : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
              }`}
            >
              {state === "guest"
                ? "Guest"
                : state === "free_user"
                ? "Free User"
                : state === "paid_member"
                ? "Club Member"
                : "Admin"}
            </button>
          ))}
        </div>
      </div>

      {/* Reply Box Section */}
      {userState === "guest" ? (
        // Requirement 2: Guest reply box replaced with "Log in to join the conversation."
        <div className="p-6 rounded-2xl bg-[#0E1017] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white tracking-tight">
              Community Discussion
            </h4>
            <p className="text-xs text-white/70">
              Log in to join the conversation.
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              openAuthModal({
                title: "Join the Salon Discussion",
                subtitle: `Sign in to contribute your analysis and rate ${movieTitle}.`,
                defaultTab: "signin",
              })
            }
            className="px-5 py-2.5 rounded-xl bg-[#FF5500] hover:bg-[#ff6a1f] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,85,0,0.35)] transition-all flex items-center space-x-2 shrink-0 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      ) : (
        // Requirement 2: Free User, Member, and Admin can comment and rate (1-5 stars)
        <form
          onSubmit={handleAddComment}
          className="p-5 rounded-2xl bg-[#0E1017] border border-white/10 space-y-4 shadow-lg"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white">
                Share your review for {movieTitle}
              </span>
              <UserBadge tier={userState} />
            </div>

            {/* 1 - 5 Star Rating Selector */}
            <div className="flex items-center space-x-1">
              <span className="text-[11px] text-white/50 mr-1.5 font-medium">Your Rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setNewRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  className="p-0.5 hover:scale-125 transition-transform cursor-pointer"
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-4 h-4 transition-colors ${
                      (hoverRating !== null ? star <= hoverRating : star <= newRating)
                        ? "fill-[#FF9F0A] text-[#FF9F0A] drop-shadow-[0_0_6px_rgba(255,159,10,0.5)]"
                        : "text-white/20 hover:text-white/40"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs font-bold text-[#FF9F0A] ml-1">
                {(hoverRating ?? newRating)}/5
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <textarea
              rows={2}
              required
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Contribute your philosophical reflection, cinematography analysis, or takeaways..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#FF5500] transition-colors resize-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-[#EB0029] hover:from-[#ff6a1f] hover:to-[#ff1940] text-white text-xs font-bold shadow-[0_0_20px_rgba(255,85,0,0.4)] flex flex-col items-center justify-center gap-1 shrink-0 cursor-pointer self-stretch transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Post</span>
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs text-white/50 px-1">
          <span>{comments.length} Member Contributions</span>
          {isAdmin && (
            <span className="text-red-400 font-bold flex items-center gap-1 text-[11px]">
              <Shield className="w-3 h-3" /> Admin Moderation Active
            </span>
          )}
        </div>

        {sortedComments.map((comment) => {
          // Non-admins do not see hidden comments
          if (comment.isHidden && !isAdmin) {
            return null;
          }

          return (
            <div
              key={comment.id}
              className={`p-4 rounded-2xl border transition-all ${
                comment.isPinned
                  ? "bg-[#FF5500]/5 border-[#FF5500]/30 shadow-[0_0_15px_rgba(255,85,0,0.1)]"
                  : comment.isHidden
                  ? "bg-red-500/5 border-red-500/20 opacity-60"
                  : "bg-white/[0.03] border-white/5 hover:border-white/10"
              }`}
            >
              {/* Header: Avatar, Name, UserBadge, Star Rating */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-white/10 shadow-sm">
                    <Image
                      src={comment.authorAvatar}
                      alt={comment.authorName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    <span className="font-bold text-white text-xs sm:text-sm">
                      {comment.authorName}
                    </span>

                    {/* User Badge: User, glowing Club Member, or official Admin */}
                    <UserBadge tier={comment.userTier} />

                    {comment.isPinned && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF5500]/15 text-[#FF5500] border border-[#FF5500]/30">
                        <Pin className="w-2.5 h-2.5 fill-[#FF5500]" />
                        <span>Pinned</span>
                      </span>
                    )}

                    {comment.isHidden && isAdmin && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                        <EyeOff className="w-2.5 h-2.5" />
                        <span>Hidden from Users</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3 self-end sm:self-center">
                  {/* Star Rating Display */}
                  <div className="flex items-center space-x-0.5" title={`Rated ${comment.rating} out of 5 stars`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= comment.rating
                            ? "fill-[#FF9F0A] text-[#FF9F0A]"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] text-white/40">{comment.createdAt}</span>
                </div>
              </div>

              {/* Comment Body */}
              <p className="pt-3 text-xs sm:text-sm text-white/80 leading-relaxed">
                {comment.content}
              </p>

              {/* Admin Inline Controls: [Pin], [Hide], [Delete] */}
              {isAdmin && (
                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-end gap-2 text-[11px]">
                  <span className="text-white/40 mr-1 text-[10px] uppercase font-bold tracking-wider">
                    Admin Actions:
                  </span>

                  {/* Pin Control */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(comment.id)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                      comment.isPinned
                        ? "bg-[#FF5500]/20 text-[#FF5500] border-[#FF5500]/40"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    <span>{comment.isPinned ? "Unpin" : "Pin"}</span>
                  </button>

                  {/* Hide Control */}
                  <button
                    type="button"
                    onClick={() => handleToggleHide(comment.id)}
                    className={`px-2.5 py-1 rounded-lg border font-semibold flex items-center space-x-1 transition-all cursor-pointer ${
                      comment.isHidden
                        ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                        : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <EyeOff className="w-3 h-3" />
                    <span>{comment.isHidden ? "Unhide" : "Hide"}</span>
                  </button>

                  {/* Delete Control */}
                  <button
                    type="button"
                    onClick={() => handleDelete(comment.id)}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold flex items-center space-x-1 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
