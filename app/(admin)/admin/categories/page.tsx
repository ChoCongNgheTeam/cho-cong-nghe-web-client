"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Search, Plus, Eye, Pencil, Trash2, X, RefreshCw, Loader2, ImageOff, FolderTree, Layers, Star, ChevronRight } from "lucide-react";
import { Category } from "./category.types";
import { getAllCategories } from "./_libs/getAllCategories";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CategoryMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: {
    ALL: number;
    active: number;
    inactive: number;
    featured: number;
  };
}

const DEFAULT_META: CategoryMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, featured: 0 },
};

const STATUS_TABS = [
  { label: "Tất cả", value: "ALL" },
  { label: "Hoạt động", value: "active" },
  { label: "Ẩn", value: "inactive" },
];

function CategoryImage({ category }: { category: Category }) {
  const [imgError, setImgError] = useState(false);
  const src = category.imageUrl ?? category.imagePath ?? null;

  if (src && !imgError) {
    return (
      <div className="relative w-8 h-8 shrink-0 rounded overflow-hidden border border-neutral/40">
        <Image src={src} alt={category.name} fill className="object-cover" onError={() => setImgError(true)} unoptimized />
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded bg-neutral-light-active flex items-center justify-center shrink-0 border border-neutral/30 text-primary/70">
      <ImageOff size={16} strokeWidth={1.5} />
    </div>
  );
}

export default function AdminCategories() {
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const [categories, setCategories] = useState<Category[]>([]);
  const [meta, setMeta] = useState<CategoryMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20); // mặc định theo BE ví dụ
  const [activeTab, setActiveTab] = useState<"ALL" | "active" | "inactive">("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  // ─── Fetch ───────────────────────────────────────────────────────────────────
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        limit: pageSize,
        status: activeTab === "ALL" ? undefined : activeTab,
        search: search || undefined,
        // thêm featured, dateFrom/dateTo,... nếu BE hỗ trợ sau này
      };

      const res = await getAllCategories(params);
      setCategories(res.data || []);
      setMeta(res.meta || DEFAULT_META);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Refetch khi quay lại từ detail page
  useEffect(() => {
    const wasOnDetail = prevPathname.current !== pathname && prevPathname.current.startsWith("/admin/categories/");
    prevPathname.current = pathname;
    if (wasOnDetail) fetchCategories();
  }, [pathname, fetchCategories]);

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleTabChange = (value: "ALL" | "active" | "inactive") => {
    setActiveTab(value);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const hasFilter = activeTab !== "ALL";

  return (
    <div className="space-y-5 p-5 bg-neutral-light h-full">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng danh mục" value={meta.statusCounts.ALL ?? 0} sub="Tất cả danh mục trong hệ thống" icon={<Layers size={18} />} valueClassName="text-blue-600" />
        <StatsCard
          label="Danh mục gốc"
          value={loading ? "—" : categories.filter((c) => !c.parentId).length}
          sub="Không có danh mục cha"
          icon={<FolderTree size={18} />}
          valueClassName="text-violet-600"
        />
        <StatsCard label="Hoạt động" value={meta.statusCounts.active ?? 0} sub="Hiển thị trên website" icon={<ChevronRight size={18} />} valueClassName="text-emerald-600" />
        <StatsCard label="Nổi bật" value={meta.statusCounts.featured ?? 0} sub="Được đánh dấu nổi bật" icon={<Star size={18} />} valueClassName="text-amber-600" />
      </div>

      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral gap-4 flex-wrap">
          {/* Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value as any)}
                className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>
                  {meta.statusCounts[tab.value] ?? 0}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Search */}
            <form onSubmit={handleSearch} className="relative">
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Tìm tên, slug..."
                className="w-52 pl-9 pr-3 py-2 text-[12px] border border-neutral rounded-lg bg-neutral-light-active text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
              />
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/50" />
            </form>

            <Link
              href="/admin/categories/create"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent-hover transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Thêm danh mục
            </Link>
          </div>
        </div>

        {/* Filter chips */}
        {hasFilter && (
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-neutral bg-neutral-light-active/50 flex-wrap">
            <span className="text-[11px] text-neutral-dark">Đang lọc:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-light border border-accent text-[11px] text-accent font-medium">
              Trạng thái: {activeTab === "active" ? "Hoạt động" : "Ẩn"}
              <X
                size={10}
                className="cursor-pointer hover:text-promotion"
                onClick={() => {
                  setActiveTab("ALL");
                  setPage(1);
                }}
              />
            </span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion-light-active">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchCategories} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-light-active border-b border-neutral">
                {["STT", "Tên danh mục", "Mô tả", "Danh mục con", "Vị trí", "Nổi bật", "Trạng thái", "Hành động"].map((col, i) => (
                  <th key={i} className="px-4 py-3 text-left text-[12px] font-semibold text-primary uppercase tracking-wider whitespace-nowrap">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <Loader2 size={36} className="animate-spin opacity-40" />
                      <span className="text-sm">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-primary">
                      <FolderTree size={36} className="opacity-40" />
                      <span className="text-sm">Không có danh mục nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                categories.map((cat, idx) => {
                  const rowNum = (meta.page - 1) * meta.limit + idx + 1;
                  const isChild = !!cat.parentId;

                  return (
                    <tr key={cat.id} className={`border-b border-neutral hover:bg-neutral-light-active/60 transition-colors duration-100 ${isChild ? "bg-neutral-light-hover/20" : ""}`}>
                      <td className="px-4 py-3.5 text-[12px] text-primary">{rowNum}</td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          {isChild && <ChevronRight size={14} className="text-primary/50" />}
                          <CategoryImage category={cat} />
                          <div>
                            <div className="text-[13px] font-medium text-primary">{cat.name}</div>
                            <div className="text-[11px] text-primary/60 font-mono">/{cat.slug}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 text-[12px] text-primary line-clamp-1 max-w-xs">{cat.description || "—"}</td>

                      <td className="px-4 py-3.5 text-[12px] text-primary">{cat._count?.children ?? 0}</td>

                      <td className="px-4 py-3.5 text-[12px] text-primary">#{cat.position ?? "—"}</td>

                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${cat.isFeatured ? "bg-amber-100 text-amber-700" : "bg-neutral-light-active text-primary/70"}`}
                        >
                          {cat.isFeatured ? "Nổi bật" : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[11px] font-medium ${cat.isActive ? "bg-emerald-100 text-emerald-700" : "bg-orange-100 text-orange-700"}`}>
                          {cat.isActive ? "Hoạt động" : "Ẩn"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/categories/${cat.id}`}
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent transition-all"
                          >
                            <Eye size={14} />
                          </Link>
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-accent-light hover:text-accent transition-all">
                            <Pencil size={14} />
                          </button>
                          <button className="w-7 h-7 flex items-center justify-center rounded-lg text-primary hover:bg-promotion-light hover:text-promotion transition-all">
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

        {/* Pagination - dùng meta từ BE giống Orders */}
        <div className="px-5 py-3 border-t border-neutral">
          <AdminPagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.limit}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
            siblingCount={1}
          />
        </div>
      </div>
    </div>
  );
}
