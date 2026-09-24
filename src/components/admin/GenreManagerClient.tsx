"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Tags,
  Film,
  Plus,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  Search,
  X,
  LayoutGrid,
  List,
  Sparkles,
  TrendingUp,
  Hash,
  Sliders,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import {
  createGenreAction,
  updateGenreAction,
  deleteGenreAction,
  batchUpdateGenreOrdersAction,
  GenreWithCount,
} from "@/app/actions/genres";

interface GenreManagerClientProps {
  initialGenres: GenreWithCount[];
}

export default function GenreManagerClient({ initialGenres }: GenreManagerClientProps) {
  const [genres, setGenres] = useState<GenreWithCount[]>(initialGenres);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  // Create / Edit modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGenre, setEditingGenre] = useState<GenreWithCount | null>(null);
  const [formData, setFormData] = useState({ name: "", slug: "", order: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete modal state
  const [deletingGenre, setDeletingGenre] = useState<GenreWithCount | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast feedback
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showNotification = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Open modal for Create or Edit
  const openCreateModal = () => {
    setEditingGenre(null);
    const maxOrder = genres.reduce((max, g) => Math.max(max, g.order || 0), 0);
    setFormData({ name: "", slug: "", order: maxOrder + 1 });
    setModalOpen(true);
  };

  const openEditModal = (genre: GenreWithCount) => {
    setEditingGenre(genre);
    setFormData({ name: genre.name, slug: genre.slug, order: genre.order ?? 1 });
    setModalOpen(true);
  };

  // Auto-generate slug when name changes (if not explicitly customized)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const generatedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug === "" || prev.slug === prev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
        ? generatedSlug
        : prev.slug,
    }));
  };

  // Handle Quick Reorder (Move Up / Down on Browse section)
  const handleQuickReorder = async (genre: GenreWithCount, direction: "up" | "down") => {
    const sorted = [...genres].sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
    const currentIndex = sorted.findIndex((g) => g.id === genre.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= sorted.length) return;

    const targetGenre = sorted[targetIndex];
    let newCurrentOrder = targetGenre.order ?? (targetIndex + 1);
    let newTargetOrder = genre.order ?? (currentIndex + 1);

    if (newCurrentOrder === newTargetOrder) {
      newCurrentOrder = direction === "up" ? Math.max(1, newCurrentOrder - 1) : newCurrentOrder + 1;
    }

    // Optimistically update local state sorted by order
    setGenres((prev) => {
      const next = prev.map((g) => {
        if (g.id === genre.id) return { ...g, order: newCurrentOrder };
        if (g.id === targetGenre.id) return { ...g, order: newTargetOrder };
        return g;
      });
      return next.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
    });

    const res = await batchUpdateGenreOrdersAction({
      [genre.slug]: newCurrentOrder,
      [genre.id]: newCurrentOrder,
      [targetGenre.slug]: newTargetOrder,
      [targetGenre.id]: newTargetOrder,
    });

    if (res.success) {
      showNotification(`Moved "${genre.name}" ${direction} to shelf position #${newCurrentOrder}`);
    } else {
      showNotification("Failed to update display order", "error");
    }
  };

  // Handle Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showNotification("Genre name is required", "error");
      return;
    }

    const orderNum = Math.max(1, Number(formData.order) || 1);
    setIsSubmitting(true);

    if (editingGenre) {
      // UPDATE
      const res = await updateGenreAction(editingGenre.id, formData.name, formData.slug, orderNum);
      if (res.success && res.genre) {
        setGenres((prev) => {
          const next = prev.map((g) =>
            g.id === editingGenre.id
              ? { ...g, name: res.genre.name, slug: res.genre.slug, order: orderNum }
              : g
          );
          return next.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
        });
        showNotification(`Updated category "${res.genre.name}" (Order #${orderNum}) successfully.`);
        setModalOpen(false);
      } else {
        showNotification(res.error || "Failed to update category", "error");
      }
    } else {
      // CREATE
      const res = await createGenreAction(formData.name, formData.slug, orderNum);
      if (res.success && res.genre) {
        setGenres((prev) => {
          const next = [
            ...prev,
            {
              id: res.genre.id,
              name: res.genre.name,
              slug: res.genre.slug,
              order: orderNum,
              _count: { movies: 0 },
            },
          ];
          return next.sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name));
        });
        showNotification(`Created category "${res.genre.name}" at order #${orderNum} successfully.`);
        setModalOpen(false);
      } else {
        showNotification(res.error || "Failed to create category", "error");
      }
    }

    setIsSubmitting(false);
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!deletingGenre) return;

    setIsDeleting(true);
    const res = await deleteGenreAction(deletingGenre.id);
    if (res.success) {
      setGenres((prev) => prev.filter((g) => g.id !== deletingGenre.id));
      showNotification(`Deleted category "${deletingGenre.name}".`);
      setDeletingGenre(null);
    } else {
      showNotification(res.error || "Failed to delete category", "error");
    }
    setIsDeleting(false);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const totalCategories = genres.length;
    const totalLinkedMovies = genres.reduce((acc, g) => acc + (g._count?.movies || 0), 0);
    const topGenre = genres.reduce(
      (top, current) => ((current._count?.movies || 0) > (top?._count?.movies || 0) ? current : top),
      genres[0] || null
    );
    return { totalCategories, totalLinkedMovies, topGenre };
  }, [genres]);

  // Filtered genres by search (sorted by order rank ascending)
  const filteredGenres = useMemo(() => {
    const q = search.toLowerCase().trim();
    const sorted = [...genres].sort(
      (a, b) => (a.order ?? 999) - (b.order ?? 999) || a.name.localeCompare(b.name)
    );
    if (!q) return sorted;
    return sorted.filter(
      (g) => g.name.toLowerCase().includes(q) || g.slug.toLowerCase().includes(q)
    );
  }, [genres, search]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 px-4 py-3 rounded-2xl bg-[#161822]/95 backdrop-blur-xl border border-[#EB0028]/40 text-white text-xs font-semibold shadow-[0_10px_35px_rgba(0,0,0,0.8)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="w-6 h-6 rounded-full bg-[#EB0028] flex items-center justify-center flex-shrink-0 text-white shadow-[0_0_10px_rgba(235,0,40,0.6)]">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5" />
            )}
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

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center space-x-2.5 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#EB0028] flex items-center justify-center font-black text-white text-[11px] shadow-[0_0_10px_rgba(235,0,40,0.5)]">
              1+
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#EB0028]">
              Category &amp; Genre Taxonomy
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Movie &amp; Series Categories
          </h1>
          <p className="text-xs text-[#8E8E93] mt-0.5">
            Create, order, and manage streaming category classifications for catalog shelves and home Browse section.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/categories"
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/10 text-xs font-semibold transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#FF5500]" />
            <span>Category Rules &amp; Limits</span>
          </Link>
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#EB0028] hover:bg-[#FF1A35] text-white text-xs font-bold shadow-[0_0_20px_rgba(235,0,40,0.4)] hover:shadow-[0_0_25px_rgba(235,0,40,0.6)] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Category</span>
          </button>
        </div>
      </div>

      {/* KPI Stats HUD */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Total Genres */}
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Total Categories
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EB0028]/15 flex items-center justify-center text-[#EB0028]">
              <Tags className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-white tracking-tight">
            {metrics.totalCategories}
          </p>
          <span className="text-[10px] text-white/40 font-medium">Configured catalog shelves</span>
        </div>

        {/* Total Associated Titles */}
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Categorized Titles
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
              <Film className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 tracking-tight">
            {metrics.totalLinkedMovies}
          </p>
          <span className="text-[10px] text-white/40 font-medium">Tagged movies &amp; shows</span>
        </div>

        {/* Top Genre */}
        <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#8E8E93] uppercase tracking-wider">
              Top Category
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFB800]/15 flex items-center justify-center text-[#FFB800]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-xl font-black text-white tracking-tight truncate">
            {metrics.topGenre?.name || "None"}
          </p>
          <span className="text-[10px] text-[#FFB800] font-semibold">
            {metrics.topGenre?._count?.movies ?? 0} movies linked
          </span>
        </div>
      </div>

      {/* Control Bar: Search & View Mode Switcher */}
      <div className="p-4 rounded-2xl bg-[#12131A] border border-white/10 shadow-lg flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8E8E93]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search genre by name or slug..."
            className="w-full h-10 pl-10 pr-9 rounded-xl bg-[#181A24] border border-white/10 text-white text-xs placeholder-[#8E8E93] focus:border-[#EB0028] focus:ring-1 focus:ring-[#EB0028] focus:outline-none transition-all"
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

        {/* View Switcher */}
        <div className="flex items-center space-x-3">
          <span className="text-xs text-[#8E8E93]">
            Showing <span className="text-white font-bold">{filteredGenres.length}</span> of {genres.length} categories (ordered for Browse section)
          </span>

          <div className="flex items-center p-1 rounded-xl bg-[#181A24] border border-white/10">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "grid"
                  ? "bg-[#EB0028] text-white shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
              title="Cards View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === "table"
                  ? "bg-[#EB0028] text-white shadow-md"
                  : "text-white/50 hover:text-white"
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genres Content: Grid vs Table */}
      {viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {filteredGenres.map((genre) => (
            <div
              key={genre.id}
              className="p-5 rounded-2xl bg-[#12131A] border border-white/10 hover:border-[#EB0028]/50 hover:shadow-[0_10px_30px_rgba(0,0,0,0.6)] flex flex-col justify-between transition-all duration-300 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-[#EB0028]/15 text-[#EB0028] flex items-center justify-center border border-[#EB0028]/20 group-hover:scale-105 transition-transform flex-shrink-0">
                    <Tags className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-white group-hover:text-white/95 transition-colors truncate">
                        {genre.name}
                      </h3>
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#EB0028]/20 border border-[#EB0028]/40 text-[#EB0028] shadow-[0_0_8px_rgba(235,0,40,0.2)] shrink-0"
                        title="Display order on Home Browse page"
                      >
                        #{genre.order ?? 99}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8E8E93] flex items-center space-x-1 mt-0.5">
                      <Hash className="w-3 h-3 text-white/30" />
                      <span className="truncate">{genre.slug}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white shrink-0">
                  <Film className="w-3 h-3 text-[#8E8E93]" />
                  <span>{genre._count?.movies ?? 0}</span>
                </div>
              </div>

              {/* Order adjustment & Action Buttons */}
              <div className="flex items-center justify-between pt-4 mt-3 border-t border-white/5">
                <div className="flex items-center space-x-1">
                  <span className="text-[10px] uppercase font-bold text-white/40 mr-1">Shelf:</span>
                  <button
                    onClick={() => handleQuickReorder(genre, "up")}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    title="Move up on Browse section"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleQuickReorder(genre, "down")}
                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
                    title="Move down on Browse section"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-white/60 ml-1">
                    Pos #{genre.order ?? 99}
                  </span>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => openEditModal(genre)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                    title="Edit Category & Order"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setDeletingGenre(genre)}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    title="Delete Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredGenres.length === 0 && (
            <div className="col-span-full py-16 text-center text-[#8E8E93] bg-[#12131A] rounded-2xl border border-white/10">
              <Tags className="w-10 h-10 mx-auto mb-2 opacity-30 text-white" />
              <p className="font-semibold text-white">No genres matched &quot;{search}&quot;</p>
              <p className="text-xs mt-1">Try searching for a different keyword or create a new genre.</p>
              <button
                onClick={openCreateModal}
                className="mt-4 px-4 py-2 rounded-xl bg-[#EB0028] text-white text-xs font-bold shadow-md"
              >
                Add This Genre
              </button>
            </div>
          )}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="rounded-2xl border border-white/10 bg-[#12131A] overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#171922] text-[#8E8E93] border-b border-white/10 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-4 w-32 text-center">Browse Order</th>
                <th className="py-4 px-5">Genre Name</th>
                <th className="py-4 px-4">URL Slug</th>
                <th className="py-4 px-4">Catalog Movies</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredGenres.map((genre) => (
                <tr key={genre.id} className="hover:bg-white/[0.03] transition-colors">
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="w-7 h-7 rounded-lg bg-[#EB0028]/15 border border-[#EB0028]/30 text-[#EB0028] text-xs font-black flex items-center justify-center">
                        #{genre.order ?? 99}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleQuickReorder(genre, "up")}
                          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Move shelf up on Browse"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleQuickReorder(genre, "down")}
                          className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                          title="Move shelf down on Browse"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-bold text-white text-sm">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#EB0028]/15 text-[#EB0028] flex items-center justify-center">
                        <Tags className="w-3.5 h-3.5" />
                      </div>
                      <span>{genre.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#8E8E93]">
                    <code className="text-[11px] px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      {genre.slug}
                    </code>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-white/5 border border-white/10 font-bold text-xs">
                      <Film className="w-3 h-3 text-[#8E8E93]" />
                      <span>{genre._count?.movies ?? 0}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => openEditModal(genre)}
                        className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit Genre & Order"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingGenre(genre)}
                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Delete Genre"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Genre Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#141620] border border-white/15 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#181A26]">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#EB0028] flex items-center justify-center text-white shadow-[0_0_10px_rgba(235,0,40,0.5)]">
                  <Tags className="w-3.5 h-3.5" />
                </div>
                <h3 className="font-bold text-white text-base">
                  {editingGenre ? `Edit Category: ${editingGenre.name}` : "Create New Category"}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="e.g. Mindset & Personal Growth, Sci-Fi, Award Shorts..."
                    required
                    autoFocus
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1B1D2A] border border-white/10 text-white text-sm focus:border-[#EB0028] focus:ring-1 focus:ring-[#EB0028] focus:outline-none transition-all"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5 flex items-center justify-between">
                    <span>Display Order (Shelf Position in Browse Section) *</span>
                    <span className="text-[11px] text-[#EB0028] font-mono font-bold">
                      Position #{formData.order}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Math.max(1, parseInt(e.target.value) || 1),
                      })
                    }
                    required
                    className="w-full h-11 px-3.5 rounded-xl bg-[#1B1D2A] border border-white/10 text-white text-sm font-bold focus:border-[#EB0028] focus:ring-1 focus:ring-[#EB0028] focus:outline-none transition-all"
                  />
                  <p className="text-[11px] text-white/40 mt-1">
                    Determines vertical sequence of category shelves on the home Browse section (lower numbers appear first).
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#8E8E93] mb-1.5">
                  URL Slug (auto-generated)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="e.g. mindset-growth"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#1B1D2A] border border-white/10 text-white text-sm focus:border-[#EB0028] focus:ring-1 focus:ring-[#EB0028] focus:outline-none transition-all"
                />
              </div>

              {/* Preview Pill */}
              <div className="p-3 rounded-xl bg-[#1B1D2A] border border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-[#8E8E93]">Live Shelf Preview:</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/80 font-mono text-[11px] font-bold">
                    Order #{formData.order}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#EB0028]/15 border border-[#EB0028]/30 text-[#EB0028] text-xs font-bold">
                    {formData.name || "Preview Category"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-[#EB0028] hover:bg-[#FF1A35] text-white text-xs font-bold shadow-[0_0_15px_rgba(235,0,40,0.4)] transition-all disabled:opacity-50 active:scale-95"
                >
                  {isSubmitting ? "Saving..." : editingGenre ? "Update Category" : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingGenre && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-[#141620] border border-red-500/30 overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Delete Category: {deletingGenre.name}?
                </h3>
                <p className="text-xs text-[#8E8E93] mt-0.5">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            {Boolean(deletingGenre._count?.movies) && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs">
                ⚠️ Warning: <strong>{deletingGenre._count?.movies}</strong> movies are currently assigned to this category. Deleting it will detach the category classification from those movies.
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setDeletingGenre(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8E8E93] hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg transition-all disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
