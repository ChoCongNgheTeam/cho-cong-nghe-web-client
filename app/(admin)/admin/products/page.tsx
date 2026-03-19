"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Search, Plus, RefreshCw, Package, CheckCircle2, EyeOff, Loader2, Trash2, X, Star, ArrowUpDown, ChevronDown, CalendarDays } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { ProductCard } from "./product.types";
import { getAllProducts, softDeleteProduct, toggleProductActive, bulkAction } from "./_libs/products";
import { getProductColumns } from "./components/TableProducts";
import { StatsCard } from "@/components/admin/StatsCard";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Hiển thị" },
  { value: "inactive", label: "Đang ẩn" },
  { value: "outOfStock", label: "Hết hàng" },
  { value: "featured", label: "Nổi bật" },
];

const SORT_OPTIONS = [
  { value: "createdAt", order: "desc", label: "Mới nhất" },
  { value: "createdAt", order: "asc", label: "Cũ nhất" },
  { value: "name", order: "asc", label: "Tên A → Z" },
  { value: "name", order: "desc", label: "Tên Z → A" },
  { value: "viewsCount", order: "desc", label: "Lượt xem nhiều nhất" },
  { value: "ratingAverage", order: "desc", label: "Đánh giá cao nhất" },
  { value: "totalSoldCount", order: "desc", label: "Bán chạy nhất" },
] as const;

type SortKey = `${(typeof SORT_OPTIONS)[number]["value"]}_${(typeof SORT_OPTIONS)[number]["order"]}`;
type SortValue = (typeof SORT_OPTIONS)[number]["value"];
type SortOrder = (typeof SORT_OPTIONS)[number]["order"];
// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface ProductMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: Record<string, number>;
}

const DEFAULT_META: ProductMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, outOfStock: 0, featured: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [meta, setMeta] = useState<ProductMeta>(DEFAULT_META);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Query params ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt_desc");

  // Date range
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);

  // Sort dropdown
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // ── Selection ────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Delete modal ─────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ProductCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Bulk action ──────────────────────────────────────────────────────────────
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Close dropdowns on outside click ─────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [sortBy, sortOrder] = sortKey.split("_") as [SortValue, SortOrder];

  const tabToParams = (tab: string) => {
    if (tab === "active") return { isActive: true, inStock: undefined, isFeatured: undefined };
    if (tab === "inactive") return { isActive: false, inStock: undefined, isFeatured: undefined };
    if (tab === "outOfStock") return { isActive: undefined, inStock: false, isFeatured: undefined };
    if (tab === "featured") return { isActive: undefined, inStock: undefined, isFeatured: true };
    return { isActive: undefined, inStock: undefined, isFeatured: undefined };
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts({
        page,
        limit: pageSize,
        search: search || undefined,
        sortBy,
        sortOrder,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        ...tabToParams(activeTab),
      });
      setProducts(res.data);
      setMeta(res.meta);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, sortBy, sortOrder, dateFrom, dateTo]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(1), []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    resetPage();
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    resetPage();
  };

  const handleClearDate = () => {
    setDateFrom("");
    setDateTo("");
    setShowDatePicker(false);
    resetPage();
  };

  const handleSortChange = (key: SortKey) => {
    setSortKey(key);
    setShowSortDropdown(false);
    resetPage();
  };

  const handleClearAllFilters = () => {
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setActiveTab("ALL");
    setSortKey("createdAt_desc");
    resetPage();
  };

  const hasDateFilter = !!dateFrom || !!dateTo;
  const hasSortFilter = sortKey !== "createdAt_desc";
  const hasActiveFilters = !!(search || hasDateFilter || activeTab !== "ALL");

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === products.length ? new Set() : new Set(products.map((p) => p.id))));
  }, [products]);

  // ── Toggle status — optimistic update ────────────────────────────────────────
  const handleStatusChange = useCallback((productId: string, updates: { isActive?: boolean; isFeatured?: boolean }) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, ...updates } : p)));
  }, []);

  // ── Delete ───────────────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((product: ProductCard) => {
    setDeleteTarget(product);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await softDeleteProduct(deleteTarget.id);
      setDeleteTarget(null);
      fetchProducts();
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchProducts]);

  // ── Bulk actions ─────────────────────────────────────────────────────────────
  const handleBulkAction = useCallback(
    async (action: "delete" | "activate" | "deactivate" | "feature" | "unfeature") => {
      if (selected.size === 0) return;
      setBulkLoading(true);
      try {
        await bulkAction(action, Array.from(selected));
        setSelected(new Set());
        fetchProducts();
      } catch (e: any) {
        setError(e?.message ?? "Thao tác thất bại");
      } finally {
        setBulkLoading(false);
      }
    },
    [selected, fetchProducts],
  );

  // ── Columns ──────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getProductColumns({
        page,
        pageSize,
        selected,
        toggleOne,
        onStatusChange: handleStatusChange,
        onDeleteClick: handleDeleteClick,
      }),
    [page, pageSize, selected, toggleOne, handleStatusChange, handleDeleteClick],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Package size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Sản phẩm</h1>
            <p className="text-[12px] text-neutral-dark">Quản lý toàn bộ sản phẩm trong hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link
            href="/admin/products/create"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Plus size={15} />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard label="Tổng sản phẩm" value={meta.statusCounts.ALL ?? 0} sub="Tất cả sản phẩm" icon={<Package size={18} />} valueClassName="text-accent" />
        <StatsCard
          label="Đang hiển thị"
          value={meta.statusCounts.active ?? 0}
          sub="Khách hàng có thể xem"
          icon={<CheckCircle2 size={18} />}
          valueClassName="text-emerald-600"
          iconClassName="text-emerald-600"
        />
        <StatsCard label="Đang ẩn" value={meta.statusCounts.inactive ?? 0} sub="Chưa hiển thị cho khách" icon={<EyeOff size={18} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
        <StatsCard label="Nổi bật" value={meta.statusCounts.featured ?? 0} sub="Sản phẩm được featured" icon={<Star size={18} />} valueClassName="text-amber-500" iconClassName="text-amber-500" />
      </div>

      {/* ── Main table card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* ── Toolbar: 1 row ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {/* Status tabs */}
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleTabChange(tab.value)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                activeTab === tab.value ? "bg-accent text-white" : "text-neutral-dark hover:bg-neutral-light-active"
              }`}
            >
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-neutral-dark"}`}>
                {meta.statusCounts[tab.value] ?? 0}
              </span>
            </button>
          ))}

          <div className="w-px h-5 bg-neutral mx-1" />

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  resetPage();
                }
              }}
              placeholder="Tìm tên, slug..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setShowSortDropdown((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                hasSortFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
              }`}
            >
              <ArrowUpDown size={14} />
              {hasSortFilter ? SORT_OPTIONS.find((o) => `${o.value}_${o.order}` === sortKey)?.label : "Sắp xếp"}
              {hasSortFilter ? (
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSortChange("createdAt_desc");
                  }}
                  className="hover:text-promotion"
                />
              ) : (
                <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              )}
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-semibold text-neutral-dark uppercase tracking-wider border-b border-neutral">Sắp xếp theo</p>
                {SORT_OPTIONS.map((opt) => {
                  const key = `${opt.value}_${opt.order}` as SortKey;
                  return (
                    <button
                      key={key}
                      onClick={() => handleSortChange(key)}
                      className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                        sortKey === key ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date filter */}
          <div ref={dateRef} className="relative">
            <button
              onClick={() => setShowDatePicker((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                hasDateFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
              }`}
            >
              <CalendarDays size={14} />
              {hasDateFilter ? `${dateFrom || "..."} → ${dateTo || "..."}` : "Ngày tạo"}
              {hasDateFilter && (
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDate();
                  }}
                  className="hover:text-promotion"
                />
              )}
            </button>
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-1.5 w-72 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 p-4 space-y-3">
                <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Khoảng thời gian</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-dark">Từ ngày</label>
                    <input
                      type="date"
                      value={dateFrom}
                      max={dateTo || undefined}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-dark">Đến ngày</label>
                    <input
                      type="date"
                      value={dateTo}
                      min={dateFrom || undefined}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleClearDate} className="flex-1 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active cursor-pointer">
                    Xóa
                  </button>
                  <button
                    onClick={() => {
                      setShowDatePicker(false);
                      resetPage();
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 cursor-pointer"
                  >
                    Áp dụng
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Clear filters */}
          {(hasActiveFilters || hasSortFilter) && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-neutral-dark">{meta.total} sản phẩm</span>
        </div>

        {/* ── Bulk action bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20 flex-wrap">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} sản phẩm</span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleBulkAction("activate")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-emerald-300 text-[11px] font-medium text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Hiển thị
              </button>
              <button
                onClick={() => handleBulkAction("deactivate")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-orange-300 text-[11px] font-medium text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Ẩn
              </button>
              <button
                onClick={() => handleBulkAction("feature")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-amber-300 text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Nổi bật
              </button>
              <button
                onClick={() => handleBulkAction("unfeature")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-neutral text-[11px] font-medium text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Bỏ nổi bật
              </button>
              <button
                onClick={() => handleBulkAction("delete")}
                disabled={bulkLoading}
                className="px-2.5 py-1 rounded-lg border border-promotion/30 text-[11px] font-medium text-promotion hover:bg-promotion-light transition-colors cursor-pointer disabled:opacity-50"
              >
                Xóa
              </button>
            </div>
            {bulkLoading && <Loader2 size={13} className="animate-spin text-accent" />}
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-primary cursor-pointer ml-auto">
              Bỏ chọn
            </button>
          </div>
        )}

        {/* ── Error banner ── */}
        {error && (
          <div className="flex items-center justify-between px-5 py-3 bg-promotion-light border-b border-promotion/20">
            <span className="text-[12px] text-promotion">{error}</span>
            <button onClick={fetchProducts} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
              <RefreshCw size={12} /> Thử lại
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có sản phẩm nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xóa bộ lọc
              </button>
            ) : (
              <Link href="/admin/products/create" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Tạo sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={products} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  resetPage();
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-neutral-dark">/ {meta.total} sản phẩm</span>
            </div>
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
        )}
      </div>

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <Popzy
          isOpen={!!deleteTarget}
          onClose={() => !deleting && setDeleteTarget(null)}
          footer={false}
          closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
          content={
            <div className="py-2">
              <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                <Trash2 size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xóa sản phẩm?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xóa</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-2">"{deleteTarget.name}"</p>
              <p className="text-[12px] text-neutral-dark text-center mb-6">Sản phẩm sẽ được chuyển vào thùng rác và có thể khôi phục sau.</p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  {deleting ? "Đang xóa..." : "Xóa sản phẩm"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
