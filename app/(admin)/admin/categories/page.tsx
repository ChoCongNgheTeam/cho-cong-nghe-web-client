"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Eye, Pencil, Trash2, X, RefreshCw, Loader2, ImageOff, FolderTree, Layers, Star, ChevronRight, ChevronDown, AlertCircle, SlidersHorizontal } from "lucide-react";
import type { Category, CategoryMeta, GetCategoriesParams } from "./category.types";
import { getCategoriesAdmin, softDeleteCategory, updateCategory } from "./_libs/categories";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Hoạt động", value: "active" },
  { label: "Ẩn", value: "inactive" },
] as const;

type StatusTab = (typeof STATUS_TABS)[number]["value"];

const SORT_OPTIONS = [
  { label: "Vị trí", value: "position" },
  { label: "Tên", value: "name" },
  { label: "Ngày tạo", value: "createdAt" },
];

// "null" là giá trị đặc biệt để filter parentId IS NULL (danh mục gốc)
const LEVEL_OPTIONS = [
  { label: "Tất cả cấp", value: "" },
  { label: "Danh mục gốc", value: "root" },
  { label: "Danh mục con", value: "child" },
];

const FEATURED_OPTIONS = [
  { label: "Tất cả", value: "" },
  { label: "Nổi bật", value: "true" },
  { label: "Không nổi bật", value: "false" },
];

const DEFAULT_META: CategoryMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, featured: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// CategoryImage
// ─────────────────────────────────────────────────────────────────────────────

function CategoryImage({ category }: { category: Category }) {
  const [imgError, setImgError] = useState(false);
  const src = category.imageUrl ?? category.imagePath ?? null;
  if (src && !imgError) {
    return (
      <div className="relative w-9 h-9 shrink-0 rounded-lg overflow-hidden border border-neutral/40 bg-neutral-light-active">
        <Image src={src} alt={category.name} fill className="object-cover" onError={() => setImgError(true)} unoptimized />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-lg bg-neutral-light-active flex items-center justify-center shrink-0 border border-neutral/30">
      <ImageOff size={15} className="text-primary/50" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// StatusDropdown
// ─────────────────────────────────────────────────────────────────────────────

function StatusDropdown({ category, onUpdated }: { category: Category; onUpdated: (id: string, patch: Partial<Category>) => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggle = async (field: "isActive" | "isFeatured", value: boolean) => {
    setOpen(false);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify({ [field]: value }));
      await updateCategory(category.id, fd);
      onUpdated(category.id, { [field]: value });
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
          category.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-orange-50 text-orange-600 border-orange-200 hover:bg-orange-100"
        } ${loading ? "opacity-60" : ""}`}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : <span className={`w-1.5 h-1.5 rounded-full ${category.isActive ? "bg-emerald-500" : "bg-orange-400"}`} />}
        {category.isActive ? "Hoạt động" : "Ẩn"}
        <ChevronDown size={10} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full mt-1 z-20 w-44 bg-white border border-neutral rounded-xl shadow-lg py-1 overflow-hidden">
            <p className="px-3 py-1.5 text-[10px] font-bold text-primary uppercase tracking-wider border-b border-neutral mb-1">Trạng thái hiển thị</p>
            {(
              [
                { label: "Hoạt động", value: true, dot: "bg-emerald-500" },
                { label: "Ẩn", value: false, dot: "bg-orange-400" },
              ] as const
            ).map((opt) => (
              <button
                key={String(opt.value)}
                onClick={() => toggle("isActive", opt.value)}
                disabled={category.isActive === opt.value}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors cursor-pointer ${
                  category.isActive === opt.value ? "bg-neutral-light-active text-primary font-medium cursor-default" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot}`} />
                {opt.label}
                {category.isActive === opt.value && <span className="ml-auto text-[10px] text-accent">✓</span>}
              </button>
            ))}

            <div className="border-t border-neutral mt-1 pt-1">
              <p className="px-3 py-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">Nổi bật</p>
              {(
                [
                  { label: "Nổi bật", value: true, icon: "⭐" },
                  { label: "Bình thường", value: false, icon: "—" },
                ] as const
              ).map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => toggle("isFeatured", opt.value)}
                  disabled={category.isFeatured === opt.value}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-[12px] text-left transition-colors cursor-pointer ${
                    category.isFeatured === opt.value ? "bg-neutral-light-active text-primary font-medium cursor-default" : "text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  <span className="w-2 shrink-0 text-center">{opt.icon}</span>
                  {opt.label}
                  {category.isFeatured === opt.value && <span className="ml-auto text-[10px] text-accent">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeleteConfirmModal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteConfirmModal({ category, onConfirm, onCancel, loading }: { category: Category; onConfirm: () => void; onCancel: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-neutral-light border border-neutral rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4 mx-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-promotion-light flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-promotion" />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-primary">Xóa danh mục?</p>
            <p className="text-[12px] text-primary mt-0.5">Hành động này có thể hoàn tác</p>
          </div>
        </div>
        <p className="text-[13px] text-primary bg-neutral-light-active px-3 py-2 rounded-xl border border-neutral">
          <span className="font-medium">{category.name}</span>
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-promotion hover:bg-promotion/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<CategoryMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // filter state
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("position");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [levelFilter, setLevelFilter] = useState(""); // "" | "null" | "child"
  const [featuredFilter, setFeaturedFilter] = useState(""); // "" | "true" | "false"
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // delete modal
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const resetPage = () => setPage(1);

  const hasActiveFilters = activeTab !== "ALL" || !!search || sortBy !== "position" || levelFilter !== "" || featuredFilter !== "";

  // ── fetch ──────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetCategoriesParams = {
        page,
        limit: pageSize,
        sortBy: sortBy as any,
        sortOrder,
        ...(search && { search }),
        ...(activeTab === "active" && { isActive: true }),
        ...(activeTab === "inactive" && { isActive: false }),
        // featured filter
        ...(featuredFilter === "true" && { isFeatured: true }),
        ...(featuredFilter === "false" && { isFeatured: false }),
        // level filter: "null" = root only (parentId IS NULL), "child" handled client-side
        ...(levelFilter === "root" && { rootOnly: true }),
      };
      const res = await getCategoriesAdmin(params);
      let data = res.data ?? [];

      // "child" filter: BE không có filter "có parentId" nên filter client-side
      if (levelFilter === "child") data = data.filter((c) => !!c.parentId);

      setCategories(data);
      setMeta(res.meta ?? DEFAULT_META);
    } catch (err: any) {
      setError(err?.message ?? "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, sortBy, sortOrder, levelFilter, featuredFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleTabChange = (v: StatusTab) => {
    setActiveTab(v);
    resetPage();
  };
  const handleSearch = () => {
    setSearch(searchInput);
    resetPage();
  };
  const handleClearAll = () => {
    setActiveTab("ALL");
    setSearch("");
    setSearchInput("");
    setSortBy("position");
    setSortOrder("asc");
    setLevelFilter("");
    setFeaturedFilter("");
    resetPage();
  };
  const handleInlineUpdate = (id: string, patch: Partial<Category>) => setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await softDeleteCategory(deleteTarget.id);
      setDeleteTarget(null);
      fetchCategories();
    } catch (err: any) {
      setError(err?.message ?? "Xóa thất bại");
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng danh mục" value={meta.statusCounts.ALL} sub="Tất cả trong hệ thống" icon={<Layers size={18} />} valueClassName="text-blue-600" />
        <StatsCard
          label="Danh mục gốc"
          value={loading ? "—" : categories.filter((c) => !c.parentId).length}
          sub="Không có danh mục cha"
          icon={<FolderTree size={18} />}
          valueClassName="text-violet-600"
        />
        <StatsCard label="Hoạt động" value={meta.statusCounts.active} sub="Hiển thị trên website" icon={<ChevronRight size={18} />} valueClassName="text-emerald-600" />
        <StatsCard label="Nổi bật" value={meta.statusCounts.featured} sub="Được đánh dấu nổi bật" icon={<Star size={18} />} valueClassName="text-amber-600" />
      </div>

      {/* Main card */}
      <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
        {/* ── Toolbar row 1: tabs + search + actions ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "ALL" ? meta.statusCounts.ALL : tab.value === "active" ? meta.statusCounts.active : meta.statusCounts.inactive;
            return (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                  activeTab === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="w-px h-5 bg-neutral mx-1" />

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Tìm tên, slug..."
              className="pl-9 pr-8 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-[12px] text-primary">{meta.total} danh mục</span>
            <Link href="/admin/categories/create" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-accent text-white text-[12px] font-medium hover:bg-accent/90 transition-all shadow-sm">
              <Plus size={14} /> Thêm mới
            </Link>
          </div>
        </div>

        {/* ── Toolbar row 2: advanced filters ── */}
        <div className="px-5 py-2.5 border-b border-neutral bg-neutral-light-active/40 flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={13} className="text-primary shrink-0" />
          <span className="text-[11px] text-primary font-medium mr-1">Lọc thêm:</span>

          {/* Cấp */}
          <select
            value={levelFilter}
            onChange={(e) => {
              setLevelFilter(e.target.value);
              resetPage();
            }}
            className={`px-3 py-1.5 text-[12px] border rounded-lg bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-all ${
              levelFilter ? "border-accent text-accent font-medium" : "border-neutral text-primary"
            }`}
          >
            {LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Nổi bật */}
          <select
            value={featuredFilter}
            onChange={(e) => {
              setFeaturedFilter(e.target.value);
              resetPage();
            }}
            className={`px-3 py-1.5 text-[12px] border rounded-lg bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer transition-all ${
              featuredFilter ? "border-accent text-accent font-medium" : "border-neutral text-primary"
            }`}
          >
            {FEATURED_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-[11px] text-primary">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                resetPage();
              }}
              className="px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as "asc" | "desc");
                resetPage();
              }}
              className="px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              <option value="asc">↑ Tăng</option>
              <option value="desc">↓ Giảm</option>
            </select>
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="px-5 py-2 border-b border-neutral flex items-center gap-2 flex-wrap bg-accent/5">
            <span className="text-[11px] text-primary">Đang lọc:</span>
            {activeTab !== "ALL" && (
              <Chip
                label={`Trạng thái: ${activeTab === "active" ? "Hoạt động" : "Ẩn"}`}
                onRemove={() => {
                  setActiveTab("ALL");
                  resetPage();
                }}
              />
            )}
            {search && (
              <Chip
                label={`Tìm: "${search}"`}
                onRemove={() => {
                  setSearch("");
                  setSearchInput("");
                  resetPage();
                }}
              />
            )}
            {levelFilter && (
              <Chip
                label={levelFilter === "root" ? "Danh mục gốc" : "Danh mục con"}
                onRemove={() => {
                  setLevelFilter("");
                  resetPage();
                }}
              />
            )}
            {featuredFilter && (
              <Chip
                label={featuredFilter === "true" ? "Nổi bật" : "Không nổi bật"}
                onRemove={() => {
                  setFeaturedFilter("");
                  resetPage();
                }}
              />
            )}
            {sortBy !== "position" && (
              <Chip
                label={`Sắp xếp: ${SORT_OPTIONS.find((o) => o.value === sortBy)?.label}`}
                onRemove={() => {
                  setSortBy("position");
                  resetPage();
                }}
              />
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion/20 text-promotion text-[12px]">
            <div className="flex items-center gap-2">
              <AlertCircle size={13} />
              {error}
            </div>
            <button onClick={fetchCategories} className="flex items-center gap-1 hover:underline cursor-pointer">
              <RefreshCw size={11} /> Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-light-active border-b border-neutral">
                {["STT", "Danh mục", "Cấp", "Danh mục con", "Vị trí", "Trạng thái", "Hành động"].map((col) => (
                  <th key={col} className="px-4 py-3 text-left text-[11px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <Loader2 size={28} className="animate-spin opacity-40" />
                      <span className="text-[13px]">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <FolderTree size={32} className="opacity-30" />
                      <span className="text-[13px]">Không có danh mục nào</span>
                      {hasActiveFilters && (
                        <button onClick={handleClearAll} className="text-[12px] text-accent hover:underline cursor-pointer">
                          Xóa bộ lọc
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const rowNum = (meta.page - 1) * meta.limit + idx + 1;
                  const isChild = !!cat.parentId;
                  return (
                    <tr key={cat.id} className={`border-b border-neutral hover:bg-neutral-light-active/50 transition-colors duration-100 ${isChild ? "bg-neutral-light-active/20" : ""}`}>
                      <td className="px-4 py-3.5 text-[12px] text-primary w-12">{rowNum}</td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          {isChild && <ChevronRight size={13} className="text-primary/40 shrink-0" />}
                          <CategoryImage category={cat} />
                          <div className="min-w-0">
                            <div className="text-[13px] font-medium text-primary truncate max-w-[200px]">{cat.name}</div>
                            <div className="text-[11px] text-primary font-mono truncate max-w-[200px]">/{cat.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium ${isChild ? "bg-violet-50 text-violet-600" : "bg-blue-50 text-blue-600"}`}>
                          {isChild ? "Danh mục con" : "Danh mục gốc"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 text-[12px] text-primary">
                        {cat._count?.children > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-neutral-light-active text-[11px] font-medium">
                            <FolderTree size={11} />
                            {cat._count.children}
                          </span>
                        ) : (
                          <span className="text-primary/40">—</span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-[12px] text-primary">#{cat.position ?? "—"}</td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <StatusDropdown category={cat} onUpdated={handleInlineUpdate} />
                          {cat.isFeatured && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-600">
                              <Star size={9} fill="currentColor" /> Nổi bật
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/categories/${cat.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent/10 hover:text-accent transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye size={14} />
                          </Link>
                          <Link
                            href={`/admin/categories/${cat.id}/edit`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent/10 hover:text-accent transition-all"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(cat)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-promotion-light hover:text-promotion transition-all cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && categories.length > 0 && (
          <div className="px-5 py-3 border-t border-neutral">
            <AdminPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={meta.limit}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                resetPage();
              }}
              pageSizeOptions={[10, 20, 50]}
              siblingCount={1}
            />
          </div>
        )}
      </div>

      {deleteTarget && <DeleteConfirmModal category={deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleteLoading} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Chip helper
// ─────────────────────────────────────────────────────────────────────────────

function Chip({ label, onRemove }: { label: string | undefined; onRemove: () => void }) {
  if (!label) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-[11px] text-accent font-medium">
      {label}
      <button onClick={onRemove} className="hover:text-promotion cursor-pointer ml-0.5">
        <X size={10} />
      </button>
    </span>
  );
}
