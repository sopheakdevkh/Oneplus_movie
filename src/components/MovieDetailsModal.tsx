"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Play,
  Pause,
  Plus,
  Check,
  Star,
  Clock,
  Volume2,
  VolumeX,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Share2,
  ThumbsUp,
  Download,
  Film,
  Sparkles,
  Info,
  Users,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { MovieData } from "../lib/movies";
import { getBannerBackdropUrl, getPosterCardUrl } from "../lib/cloudinary";

interface MovieDetailsModalProps {
  movie: MovieData | null;
  allMovies?: MovieData[];
  onSelectMovie?: (movie: MovieData) => void;
  onClose: () => void;
}

type TabType = "overview" | "cast" | "more" | "specs";

// Cast metadata mapping for rich cinematic presentation
const CAST_DATA: Record<
  string,
  Array<{ name: string; role: string; avatar: string }>
> = {
  "John wick 4": [
    {
      name: "Keanu Reeves",
      role: "John Wick",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Donnie Yen",
      role: "Caine",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Bill Skarsgård",
      role: "Marquis",
      avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Laurence Fishburne",
      role: "Bowery King",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
  ],
  "Aquaman 2": [
    {
      name: "Jason Momoa",
      role: "Arthur Curry / Aquaman",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Patrick Wilson",
      role: "Orm Marius",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Yahya Abdul-Mateen II",
      role: "Black Manta",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80",
    },
  ],
  "Transformers: Rise of the Beasts": [
    {
      name: "Anthony Ramos",
      role: "Noah Diaz",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Dominique Fishback",
      role: "Elena Wallace",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
    },
    {
      name: "Peter Cullen",
      role: "Optimus Prime (Voice)",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    },
  ],
};

const DEFAULT_CAST = [
  {
    name: "Alex Cross",
    role: "Lead Protagonist",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Elena Vance",
    role: "Special Operative",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Marcus Kane",
    role: "Tactical Commander",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Sarah Chen",
    role: "Intelligence Officer",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80",
  },
];

export default function MovieDetailsModal({
  movie,
  allMovies = [],
  onSelectMovie,
  onClose,
}: MovieDetailsModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.85);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(1482);
  const [showToast, setShowToast] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Reset playback state when movie changes
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setActiveTab("overview");
  }, [movie?.id]);

  // Handle toast notifications
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 2500);
  };

  // Autohide controls during video play
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSkip = (seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      0,
      Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds)
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    videoRef.current.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
      setIsMuted(val === 0);
    }
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Related movies
  const relatedMovies = useMemo(() => {
    if (!movie) return [];
    return allMovies
      .filter((m) => m.id !== movie.id)
      .slice(0, 4);
  }, [allMovies, movie]);

  if (!movie) return null;

  const hours = Math.floor(movie.duration / 60);
  const mins = movie.duration % 60;
  const durationText = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  const backdropUrl = getBannerBackdropUrl(movie.bannerUrl || movie.posterUrl, 1440, 810);
  const castList = CAST_DATA[movie.title] || DEFAULT_CAST;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-black/85 backdrop-blur-2xl sm:p-4 md:p-6 lg:p-8 animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Toast Notification Alert */}
      {showToast && (
        <div className="fixed top-6 z-60 px-5 py-2.5 rounded-full bg-[#1A1C24] border border-[#FF9F0A]/40 text-[#FF9F0A] text-xs sm:text-sm font-bold shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center space-x-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#FF9F0A]" />
          <span>{showToast}</span>
        </div>
      )}

      {/* Main Modal Container: Native-like bottom-sheet on mobile, floating theater on desktop */}
      <div
        className="relative w-full max-w-5xl h-[94vh] sm:h-auto sm:max-h-[92vh] overflow-y-auto no-scrollbar rounded-t-[32px] sm:rounded-3xl bg-[#090A0F] border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_50px_rgba(0,240,255,0.06)] text-white flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile iOS-style drag pill */}
        <div className="sm:hidden w-12 h-1.5 bg-white/20 rounded-full mx-auto my-2.5 flex-shrink-0" />

        {/* Ambient Backlight Glow Effect behind video */}
        <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-[#00F0FF]/10 via-[#FF9F0A]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        {/* Close Button (floating glass circle) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 z-40 p-2.5 rounded-full bg-black/70 hover:bg-black/90 text-white/80 hover:text-white border border-white/15 backdrop-blur-md transition-all shadow-xl active:scale-95 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
        </button>

        {/* ========================================================= */}
        {/* CINEMATIC VIDEO PLAYER / HERO BACKDROP                   */}
        {/* ========================================================= */}
        <div
          ref={playerContainerRef}
          onMouseMove={handleUserActivity}
          onTouchStart={handleUserActivity}
          className="relative aspect-[16/9] w-full bg-black flex-shrink-0 overflow-hidden rounded-t-[28px] sm:rounded-t-3xl group select-none"
        >
          {isPlaying && movie.videoUrl ? (
            <div className="relative w-full h-full">
              <video
                ref={videoRef}
                src={movie.videoUrl}
                autoPlay
                playsInline
                onTimeUpdate={() => {
                  if (videoRef.current) {
                    setCurrentTime(videoRef.current.currentTime);
                  }
                }}
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    setDuration(videoRef.current.duration);
                  }
                }}
                onEnded={() => setIsPlaying(false)}
                className="w-full h-full object-cover"
              />

              {/* Custom Sleek Glass Overlay Controls */}
              <div
                className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/60 flex flex-col justify-between p-4 sm:p-6 transition-opacity duration-300 ${
                  showControls ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {/* Player Top HUD */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs sm:text-sm font-black text-white tracking-wide">
                      {movie.title}
                    </span>
                    <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/10 text-[10px] font-bold text-white/80 uppercase border border-white/10">
                      4K Ultra HD • Atmos
                    </span>
                  </div>
                </div>

                {/* Center Giant Play / Pause Button with Glow */}
                <div className="flex items-center justify-center space-x-8">
                  <button
                    onClick={() => handleSkip(-10)}
                    className="p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 active:scale-90 transition-all"
                    title="Skip -10s"
                  >
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-95 shadow-[0_0_35px_rgba(255,255,255,0.4)] transition-all"
                    aria-label={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-black text-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black text-black ml-1" />
                    )}
                  </button>

                  <button
                    onClick={() => handleSkip(10)}
                    className="p-2 sm:p-3 rounded-full bg-black/40 hover:bg-black/70 text-white/80 hover:text-white backdrop-blur-md border border-white/10 active:scale-90 transition-all"
                    title="Skip +10s"
                  >
                    <RotateCw className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>

                {/* Player Bottom Scrub Bar & Actions */}
                <div className="space-y-2">
                  {/* Timeline Scrubber */}
                  <div className="flex items-center space-x-3">
                    <span className="text-[11px] font-mono font-medium text-white/80 w-10">
                      {formatTime(currentTime)}
                    </span>

                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      step={0.1}
                      value={currentTime}
                      onChange={handleSeek}
                      className="flex-1 h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF9F0A]"
                    />

                    <span className="text-[11px] font-mono font-medium text-white/60 w-10 text-right">
                      {formatTime(duration)}
                    </span>
                  </div>

                  {/* Audio, Quality, and Fullscreen Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={toggleMute}
                        className="text-white hover:text-[#FF9F0A] transition-colors p-1"
                        title={isMuted ? "Unmute" : "Mute"}
                      >
                        {isMuted ? (
                          <VolumeX className="w-5 h-5" />
                        ) : (
                          <Volume2 className="w-5 h-5" />
                        )}
                      </button>

                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={isMuted ? 0 : volume}
                        onChange={handleVolumeChange}
                        className="hidden sm:block w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#FF9F0A]"
                      />
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#FF9F0A]/20 text-[#FF9F0A] border border-[#FF9F0A]/40">
                        HDR 10+
                      </span>
                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:text-[#FF9F0A] transition-colors p-1"
                        title="Fullscreen"
                      >
                        {isFullscreen ? (
                          <Minimize2 className="w-5 h-5" />
                        ) : (
                          <Maximize2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Poster Backdrop Mode with Cold Eye Ambient Play button */
            <div className="relative w-full h-full">
              <Image
                src={backdropUrl}
                alt={movie.title}
                fill
                sizes="(max-width: 1024px) 100vw, 1200px"
                className="object-cover"
                priority
              />

              {/* Cinematic Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-black/40 to-black/20" />

              {/* Quality & Audio Badges in Top Left */}
              <div className="absolute top-4 left-4 flex items-center space-x-2">
                <span className="px-2.5 py-1 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                  IMAX ENHANCED
                </span>
                <span className="px-2.5 py-1 rounded-md bg-[#00F0FF]/15 backdrop-blur-md border border-[#00F0FF]/30 text-[10px] sm:text-xs font-bold text-[#00F0FF]">
                  DOLBY VISION
                </span>
              </div>

              {/* Center Play Button with Ambilight Glow */}
              <div className="absolute inset-0 flex items-center justify-center">
                <button
                  onClick={() => {
                    setIsPlaying(true);
                    setTimeout(() => {
                      videoRef.current?.play();
                    }, 50);
                  }}
                  className="group/btn relative flex items-center space-x-3 px-6 sm:px-8 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-white via-white to-[#F2F2F2] text-black font-black shadow-[0_0_40px_rgba(255,255,255,0.35),0_10px_20px_rgba(0,0,0,0.5)] hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center group-hover/btn:bg-[#FF9F0A] group-hover/btn:text-black transition-colors">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                  <span className="tracking-tight text-sm sm:text-base font-extrabold">
                    Play Trailer
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================= */}
        {/* MOVIE METADATA & CINEMATIC ACTION BAR                     */}
        {/* ========================================================= */}
        <div className="p-5 sm:p-7 md:p-8 flex-1 flex flex-col">
          {/* Row 1: Title, Match %, Year, Duration, Certification */}
          <div className="space-y-3 pb-6 border-b border-white/10">
            {/* Meta Tags Row */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-xs font-black tracking-wide flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                98% MATCH
              </span>

              <span className="px-2 py-0.5 rounded bg-white/10 text-white/90 text-xs font-bold border border-white/10">
                {movie.certification}
              </span>

              <span className="text-xs text-white/40">•</span>
              <span className="text-xs font-semibold text-white/90">{movie.releaseYear}</span>

              <span className="text-xs text-white/40">•</span>
              <span className="text-xs font-semibold text-white/90 flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#8E8E93]" />
                {durationText}
              </span>

              <span className="text-xs text-white/40">•</span>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-[#FF9F0A]/15 border border-[#FF9F0A]/30">
                <Star className="w-3.5 h-3.5 fill-[#FF9F0A] text-[#FF9F0A]" />
                <span className="text-xs font-black text-[#FF9F0A]">
                  {movie.rating.toFixed(1)} / 10
                </span>
              </div>
            </div>

            {/* Huge Movie Title */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              {movie.title}
            </h1>

            {/* Action Bar (Modern Streaming Standard) */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              {/* Primary Stream Now Button */}
              <button
                onClick={() => {
                  setIsPlaying(true);
                  setTimeout(() => videoRef.current?.play(), 50);
                }}
                className="flex items-center space-x-2.5 px-6 py-3 rounded-2xl bg-[#FF9F0A] hover:bg-[#FFAB00] text-black font-black text-sm shadow-[0_0_25px_rgba(255,159,10,0.4)] active:scale-95 transition-all duration-200"
              >
                <Play className="w-4 h-4 fill-black text-black ml-0.5" />
                <span>Stream in 4K</span>
              </button>

              {/* Add to Watchlist */}
              <button
                onClick={() => {
                  setInWatchlist(!inWatchlist);
                  triggerToast(inWatchlist ? "Removed from Watchlist" : "Added to your Watchlist");
                }}
                className={`flex items-center space-x-2 px-4 py-3 rounded-2xl border text-xs sm:text-sm font-bold transition-all duration-200 active:scale-95 ${
                  inWatchlist
                    ? "bg-[#00F0FF]/15 text-[#00F0FF] border-[#00F0FF]/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                    : "bg-white/5 hover:bg-white/10 text-white border-white/10"
                }`}
              >
                {inWatchlist ? (
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

              {/* Thumbs Up / Like */}
              <button
                onClick={() => {
                  setIsLiked(!isLiked);
                  setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
                  triggerToast(isLiked ? "Vote removed" : "Added to Liked Movies");
                }}
                className={`p-3 rounded-2xl border text-xs font-bold transition-all duration-200 active:scale-95 flex items-center space-x-1.5 ${
                  isLiked
                    ? "bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.2)]"
                    : "bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border-white/10"
                }`}
                title="Like movie"
              >
                <ThumbsUp className={`w-4 h-4 ${isLiked ? "fill-rose-400 text-rose-400" : ""}`} />
                <span className="text-xs">{likeCount}</span>
              </button>

              {/* Download */}
              <button
                onClick={() => triggerToast("Download started: " + movie.title + " (4K UHD)")}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all active:scale-95"
                title="Download for offline"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Share */}
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.clipboard) {
                    navigator.clipboard.writeText(window.location.href);
                    triggerToast("Movie link copied to clipboard!");
                  }
                }}
                className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 transition-all active:scale-95"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* INTERACTIVE NAVIGATION TABS                               */}
          {/* ========================================================= */}
          <div className="flex items-center space-x-2 sm:space-x-4 pt-4 pb-2 border-b border-white/10 overflow-x-auto no-scrollbar">
            {[
              { id: "overview", label: "Overview", icon: Info },
              { id: "cast", label: "Cast & Crew", icon: Users },
              { id: "more", label: "More Like This", icon: Layers },
              { id: "specs", label: "Audio & Specs", icon: Film },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? "bg-white/15 text-white shadow-sm border border-white/20"
                      : "text-[#8E8E93] hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* ========================================================= */}
          {/* TAB CONTENTS                                              */}
          {/* ========================================================= */}
          <div className="py-5 flex-1">
            {/* Tab 1: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Tagline */}
                <p className="text-base sm:text-lg font-medium italic text-white/90 border-l-2 border-[#FF9F0A] pl-3">
                  &ldquo;A path of reckoning. Survival has a price.&rdquo;
                </p>

                {/* Synopsis */}
                <p className="text-sm sm:text-base text-[#9A9AA2] leading-relaxed max-w-3xl">
                  {movie.description}
                </p>

                {/* Genres Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs font-bold text-white/50 mr-1">Genres:</span>
                  {movie.genres.map((g) => (
                    <span
                      key={g.id}
                      className="px-3.5 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                    >
                      {g.name}
                    </span>
                  ))}
                </div>

                {/* Star Cast Quick Row */}
                <div className="pt-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-white/60 mb-3">
                    Key Cast
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {castList.slice(0, 4).map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center space-x-3 p-2.5 rounded-2xl bg-white/5 border border-white/5"
                      >
                        <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-white/10">
                          <Image
                            src={c.avatar}
                            alt={c.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-white truncate">{c.name}</p>
                          <p className="text-[10px] text-white/50 truncate">{c.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Cast & Crew */}
            {activeTab === "cast" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {castList.map((actor) => (
                    <div
                      key={actor.name}
                      className="flex items-center space-x-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 ring-1 ring-[#FF9F0A]/40 shadow-md">
                        <Image
                          src={actor.avatar}
                          alt={actor.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{actor.name}</p>
                        <p className="text-xs text-[#FF9F0A] truncate">{actor.role}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-[#0D0E14] border border-white/10 text-xs">
                  <div>
                    <span className="block text-white/50 font-bold mb-1">Director</span>
                    <span className="font-semibold text-white">Chad Stahelski</span>
                  </div>
                  <div>
                    <span className="block text-white/50 font-bold mb-1">Screenplay</span>
                    <span className="font-semibold text-white">Shay Hatten</span>
                  </div>
                  <div>
                    <span className="block text-white/50 font-bold mb-1">Studio</span>
                    <span className="font-semibold text-white">Oneplus Originals</span>
                  </div>
                  <div>
                    <span className="block text-white/50 font-bold mb-1">Release</span>
                    <span className="font-semibold text-white">{movie.releaseYear}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: More Like This */}
            {activeTab === "more" && (
              <div className="animate-in fade-in duration-200">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  {relatedMovies.map((item) => {
                    const poster = getPosterCardUrl(item.posterUrl, 400, 250);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          onSelectMovie?.(item);
                        }}
                        className="group cursor-pointer select-none rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-[#FF9F0A]/40 transition-all duration-300 hover:scale-[1.02]"
                      >
                        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                          <Image
                            src={poster}
                            alt={item.title}
                            fill
                            sizes="(max-width: 640px) 50vw, 25vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                          <div className="absolute bottom-2 right-2 flex items-center space-x-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] font-bold text-white">
                            <Star className="w-3 h-3 fill-[#FF9F0A] text-[#FF9F0A]" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="p-2.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-white/50 mt-0.5">
                            {item.releaseYear} • {item.genres[0]?.name || "Movie"}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 4: Audio & Technical Specs */}
            {activeTab === "specs" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#00F0FF]">
                    Audio Formats & Channels
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-white/80">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>English [Original] (Dolby Atmos 7.1 Surround)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Spanish (Dolby Digital 5.1)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>French (Dolby Digital 5.1)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Japanese (Stereo)</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#FF9F0A]">
                    Subtitles & Closed Captions
                  </h3>
                  <p className="text-xs text-white/80 leading-relaxed">
                    English [CC], Spanish, French, German, Japanese, Simplified Chinese, Arabic,
                    Portuguese.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
