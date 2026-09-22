"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Film,
  Lock,
  Sparkles,
  Upload,
  FileText,
  Video,
  Tag,
  Calendar,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  Eye,
  Edit3,
  Heading,
  Bold,
  Italic,
  List,
  Quote,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";

export interface CMSFilmData {
  id?: string;
  title: string;
  slug?: string;
  director?: string;
  description: string;
  publicSynopsis: string;
  youtubeVideoId: string;
  premiumBreakdown: string;
  premiumResources?: any;
  releaseYear: number;
  duration: number;
  rating: number;
  certification: string;
  posterUrl: string;
  bannerUrl?: string;
  genreIds?: string[];
  genres?: Array<{ id: string; name: string }>;
}

const SAMPLE_GENRES = [
  { id: "g-psy", name: "Psychological" },
  { id: "g-act", name: "Action" },
  { id: "g-sci", name: "Sci-Fi" },
  { id: "g-dra", name: "Drama" },
  { id: "g-cri", name: "Crime" },
  { id: "g-doc", name: "Documentary" },
  { id: "g-phi", name: "Philosophical" },
];

const DEFAULT_PSYCHOLOGICAL_TEMPLATE = `### Narrative Psychology & Central Theme
This film examines the conflict between existential agency and structural conditioning. The protagonist's choices question whether true autonomy is possible under systemic duress.

#### Moral Dilemma Breakdown
- **The Crucible:** A choice between self-preservation and moral complicity.
- **Archetypal Evolution:** Transition from an obedient archetype to an ethical catalyst.

#### Life Takeaways for Discussion
1. Silence in the face of structural decay is itself an active decision.
2. Psychological liberation requires confronting suppressed trauma rather than seeking external validation.`;

interface FilmCMSClientProps {
  initialMovies?: any[];
}

export default function FilmCMSClient({ initialMovies = [] }: FilmCMSClientProps) {
  const [movies, setMovies] = useState<any[]>(initialMovies);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  // Split CMS Form States:
  // --- Public Fields ---
  const [title, setTitle] = useState("");
  const [director, setDirector] = useState("Christopher Nolan");
  const [selectedGenres, setSelectedGenres] = useState<string[]>(["g-psy", "g-dra"]);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [shortSynopsis, setShortSynopsis] = useState("");
  const [releaseYear, setReleaseYear] = useState<number>(2024);
  const [duration, setDuration] = useState<number>(128);
  const [rating, setRating] = useState<number>(8.8);
  const [certification, setCertification] = useState("PG-13");
  const [posterUrl, setPosterUrl] = useState(
    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1000&q=80"
  );

  // --- Member-Only Fields ---
  const [premiumBreakdown, setPremiumBreakdown] = useState(DEFAULT_PSYCHOLOGICAL_TEMPLATE);
  const [pdfTitle, setPdfTitle] = useState("12-Page Printable Syllabus & Discussion Guide");
  const [pdfUrl, setPdfUrl] = useState("https://example.com/materials/curated-syllabus.pdf");
  const [pdfPages, setPdfPages] = useState(12);

  // UI States
  const [previewTab, setPreviewTab] = useState<"edit" | "preview">("edit");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to extract YouTube Video ID
  const parseYoutubeId = (urlOrId: string) => {
    if (!urlOrId) return "";
    const match = urlOrId.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : urlOrId.trim();
  };

  const currentYoutubeId = parseYoutubeId(youtubeInput);

  // Toggle Genre
  const toggleGenre = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId]
    );
  };

  // Load existing movie into CMS editor
  const handleSelectMovie = (movie: any) => {
    setSelectedMovieId(movie.id);
    setTitle(movie.title || "");
    setShortSynopsis(movie.publicSynopsis || movie.description || "");
    setYoutubeInput(movie.youtubeVideoId || "");
    setPremiumBreakdown(movie.premiumBreakdown || DEFAULT_PSYCHOLOGICAL_TEMPLATE);
    setReleaseYear(movie.releaseYear || 2024);
    setDuration(movie.duration || 120);
    setRating(movie.rating || 8.5);
    setCertification(movie.certification || "PG-13");
    setPosterUrl(movie.posterUrl || "");

    if (movie.genres && Array.isArray(movie.genres)) {
      setSelectedGenres(movie.genres.map((g: any) => g.id));
    }

    if (movie.premiumResources?.worksheet) {
      setPdfTitle(movie.premiumResources.worksheet.title || "Lesson Worksheet");
      setPdfUrl(movie.premiumResources.worksheet.url || "");
      setPdfPages(movie.premiumResources.worksheet.pages || 12);
    }
  };

  // Reset to empty new film
  const handleNewFilm = () => {
    setSelectedMovieId(null);
    setTitle("");
    setDirector("");
    setShortSynopsis("");
    setYoutubeInput("");
    setPremiumBreakdown(DEFAULT_PSYCHOLOGICAL_TEMPLATE);
    setReleaseYear(2024);
    setDuration(120);
    setRating(8.5);
    setCertification("PG-13");
    setPosterUrl("https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1000&q=80");
  };

  // Markdown editor insertion helpers
  const insertText = (prefix: string, suffix: string = "") => {
    setPremiumBreakdown((prev) => `${prev}\n${prefix}Text${suffix}`);
  };

  // Submit CMS Form (POST /api/admin/movies or PUT /api/admin/movies/[id])
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Movie Title is required.");
      return;
    }

    setIsSubmitting(true);
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const payload = {
      title: title.trim(),
      slug: selectedMovieId ? undefined : `${slug}-${Date.now().toString().slice(-4)}`,
      description: shortSynopsis.trim() || title.trim(),
      publicSynopsis: shortSynopsis.trim(),
      youtubeVideoId: currentYoutubeId || null,
      premiumBreakdown: premiumBreakdown.trim(),
      premiumResources: {
        worksheet: {
          title: pdfTitle,
          url: pdfUrl,
          pages: Number(pdfPages),
          format: "PDF",
        },
      },
      releaseYear: Number(releaseYear),
      duration: Number(duration),
      rating: Number(rating),
      certification,
      posterUrl,
      videoUrl: currentYoutubeId ? `https://www.youtube.com/watch?v=${currentYoutubeId}` : null,
      genreIds: selectedGenres,
    };

    try {
      const url = selectedMovieId
        ? `/api/admin/movies/${selectedMovieId}`
        : "/api/admin/movies";

      const method = selectedMovieId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        triggerToast(
          selectedMovieId
            ? `Film "${title}" successfully updated with split access rules.`
            : `New film "${title}" published with separated Public and Member fields!`
        );

        if (data.movie) {
          if (selectedMovieId) {
            setMovies((prev) =>
              prev.map((m) => (m.id === selectedMovieId ? { ...m, ...data.movie } : m))
            );
          } else {
            setMovies((prev) => [data.movie, ...prev]);
            setSelectedMovieId(data.movie.id);
          }
        }
      } else {
        alert(data.error || "Failed to save film in CMS.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error publishing film.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#141622] border border-[#FF5500]/50 text-white text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Bar: Selector & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#121318] border border-white/10">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            <Film className="w-4 h-4 text-[#FF5500]" />
            <span>{selectedMovieId ? "Editing Curated Film" : "Publish New Curated Film"}</span>
          </h2>
          <p className="text-[11px] text-[#8E8E93]">
            Configure split access: Public metadata is visible to everyone; Deep Psychological Takeaways &amp; Lesson PDFs are locked to Club Members.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {selectedMovieId && (
            <button
              type="button"
              onClick={handleNewFilm}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Film</span>
            </button>
          )}

          {movies.length > 0 && (
            <select
              value={selectedMovieId || ""}
              onChange={(e) => {
                const id = e.target.value;
                if (!id) {
                  handleNewFilm();
                } else {
                  const m = movies.find((item) => item.id === id);
                  if (m) handleSelectMovie(m);
                }
              }}
              className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-[#FF5500] cursor-pointer"
            >
              <option value="">+ New Film Record</option>
              {movies.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title} ({m.releaseYear})
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Main CMS Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ========================================================= */}
        {/* SECTION 1: PUBLIC FIELDS (Open to All Visitors)           */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1017] border border-white/10 space-y-6 shadow-xl relative overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold uppercase tracking-wider">
                <span>Public Tier</span>
                <span>•</span>
                <span>Open Access</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                1. Public Film Information
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Visible in the public catalog, search listings, and guest previews.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Title */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-white/80 font-semibold block">Film Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Oppenheimer, John Wick, Interstellar..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[#FF5500] transition-colors"
              />
            </div>

            {/* Director */}
            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold block">Director / Curator</label>
              <input
                type="text"
                value={director}
                onChange={(e) => setDirector(e.target.value)}
                placeholder="e.g. Christopher Nolan, Denis Villeneuve..."
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500] transition-colors"
              />
            </div>

            {/* YouTube Embed URL or Video ID */}
            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5 text-red-500" />
                <span>YouTube Embed URL or ID</span>
              </label>
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="e.g. https://www.youtube.com/watch?v=uYPbbksJxIg or uYPbbksJxIg"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500] transition-colors"
              />
              {currentYoutubeId && (
                <span className="text-[10px] text-emerald-400 font-medium">
                  Detected Video ID: {currentYoutubeId}
                </span>
              )}
            </div>

            {/* Category / Genre Tags */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-white/80 font-semibold flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Category &amp; Thematic Tags</span>
              </label>
              <div className="flex flex-wrap gap-2 pt-1">
                {SAMPLE_GENRES.map((genre) => {
                  const isSelected = selectedGenres.includes(genre.id);
                  return (
                    <button
                      key={genre.id}
                      type="button"
                      onClick={() => toggleGenre(genre.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                        isSelected
                          ? "bg-[#FF5500] text-white border-[#FF5500] shadow-[0_0_12px_rgba(255,85,0,0.3)]"
                          : "bg-white/5 hover:bg-white/10 text-white/70 border-white/10"
                      }`}
                    >
                      {genre.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Short Synopsis */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-white/80 font-semibold block">Short Public Synopsis</label>
              <textarea
                rows={3}
                value={shortSynopsis}
                onChange={(e) => setShortSynopsis(e.target.value)}
                placeholder="A concise, spoiler-free premise that free visitors and guests can read..."
                className="w-full p-3.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500] transition-colors leading-relaxed"
              />
            </div>

            {/* Metadata row: Year, Duration, Rating, Certification */}
            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold block">Release Year</label>
              <input
                type="number"
                value={releaseYear}
                onChange={(e) => setReleaseYear(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold block">Duration (Minutes)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold block">Critic / Community Rating</label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-white/80 font-semibold block">Poster Image URL</label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
              />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: MEMBER-ONLY FIELDS (LensImpact Club Exclusive)  */}
        {/* ========================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0C0E14] border border-[#FF5500]/30 space-y-6 shadow-2xl relative overflow-hidden">
          {/* Subtle neon glow banner */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#FF5500]/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-[#FF5500]/20 to-[#FF9F0A]/20 border border-[#FF9F0A]/40 text-[#FF9F0A] text-[10px] font-extrabold uppercase tracking-wider shadow-[0_0_12px_rgba(255,159,10,0.25)]">
                <Lock className="w-3 h-3" />
                <span>Club Member Exclusive Tier</span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                2. Member-Only Pedagogical Content
              </h3>
              <p className="text-xs text-[#8E8E93]">
                Gated behind active paid subscription ($4.99/mo). Free users only see blurred teaser snippets.
              </p>
            </div>

            {/* Preview Toggle */}
            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 text-[11px] font-semibold shrink-0">
              <button
                type="button"
                onClick={() => setPreviewTab("edit")}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                  previewTab === "edit"
                    ? "bg-[#FF5500] text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Edit3 className="w-3 h-3" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewTab("preview")}
                className={`px-3 py-1 rounded-lg flex items-center space-x-1.5 transition-all ${
                  previewTab === "preview"
                    ? "bg-[#FF5500] text-white shadow-sm"
                    : "text-white/60 hover:text-white"
                }`}
              >
                <Eye className="w-3 h-3" />
                <span>Member Preview</span>
              </button>
            </div>
          </div>

          {/* Rich-Text Editor for Deep Psychological & Life Takeaways */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-white/90 font-bold text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#FF9F0A]" />
                <span>Deep Psychological &amp; Life Takeaways (Rich-Text / Markdown)</span>
              </label>

              {/* Formatting Toolbar */}
              {previewTab === "edit" && (
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => insertText("### ", "")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    title="Insert Heading"
                  >
                    <Heading className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("**", "**")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    title="Bold"
                  >
                    <Bold className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("*", "*")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    title="Italic"
                  >
                    <Italic className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("- ")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    title="Bullet List"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertText("> ")}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white"
                    title="Quote"
                  >
                    <Quote className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {previewTab === "edit" ? (
              <textarea
                rows={8}
                value={premiumBreakdown}
                onChange={(e) => setPremiumBreakdown(e.target.value)}
                placeholder="Author the deep thematic breakdown, psychological motifs, character arcs, and discussion prompts..."
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500] font-mono leading-relaxed transition-colors"
              />
            ) : (
              <div className="p-5 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/80 space-y-3 leading-relaxed whitespace-pre-wrap">
                {premiumBreakdown}
              </div>
            )}
          </div>

          {/* Upload Input for Lesson Worksheets (PDFs) */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <div className="space-y-1">
              <label className="text-white/90 font-bold text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#FF5500]" />
                <span>Printable Lesson Worksheet &amp; Study Guide (PDF)</span>
              </label>
              <p className="text-[11px] text-[#8E8E93]">
                Attach a downloadable curriculum syllabus, journaling sheet, or philosophical inquiry booklet.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1 md:col-span-2">
                <span className="text-white/70 block font-medium">Worksheet Title</span>
                <input
                  type="text"
                  value={pdfTitle}
                  onChange={(e) => setPdfTitle(e.target.value)}
                  placeholder="e.g. 12-Page Printable Study Guide & Discussion Prompts"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                />
              </div>

              <div className="space-y-1">
                <span className="text-white/70 block font-medium">Page Count</span>
                <input
                  type="number"
                  value={pdfPages}
                  onChange={(e) => setPdfPages(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs"
                />
              </div>

              <div className="space-y-1 md:col-span-3">
                <span className="text-white/70 block font-medium">
                  Document Download URL or Cloudinary Asset
                </span>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://res.cloudinary.com/.../guide.pdf"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-[#FF5500]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setPdfUrl("https://res.cloudinary.com/demo/image/upload/sample_curriculum.pdf")
                    }
                    className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/80 text-[11px] font-semibold shrink-0 cursor-pointer"
                  >
                    Sample PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Preview of Member Download Card */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF5500]/15 border border-[#FF5500]/30 flex items-center justify-center text-[#FF5500]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">{pdfTitle}</h4>
                  <p className="text-[10px] text-white/50">
                    PDF Format • {pdfPages} Pages • Printable Vector
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-xl bg-[#FF5500]/20 text-[#FF5500] border border-[#FF5500]/40 text-xs font-bold flex items-center space-x-1.5">
                <Lock className="w-3 h-3" />
                <span>Member Benefit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-between p-6 rounded-3xl bg-[#121318] border border-white/10">
          <div>
            <span className="text-xs font-bold text-white block">
              Ready to publish access-gated film?
            </span>
            <span className="text-[11px] text-white/50">
              Changes take effect immediately across all client streaming hubs.
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-[#EB0029] hover:from-[#ff6a1f] hover:to-[#ff1940] text-white text-xs sm:text-sm font-bold shadow-[0_0_25px_rgba(255,85,0,0.4)] transition-all flex items-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Saving CMS Content...</span>
            ) : (
              <>
                <span>
                  {selectedMovieId ? "Update Film & Access Rules" : "Publish Film to Catalog"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
