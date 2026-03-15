"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, Package, CheckCircle2, EyeOff, XCircle, Loader2, Trash2, Filter, ChevronDown, ChevronUp, X, Star, ArchiveRestore } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { ProductCard } from "./product.types";
import { getAllProducts, softDeleteProduct, toggleProductActive, bulkAction } from "./_libs/products";
import { getProductColumns } from "./components/TableProducts";
import { formatDate } from "@/helpers";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Hiển thị" },
  { value: "inactive", label: "Ẩn" },
  { value: "outOfStock", label: "Hết hàng" },
  { value: "featured", label: "Nổi bật" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Ngày tạo" },
  { value: "updatedAt", label: "Cập nhật gần nhất" },
  { value: "name", label: "Tên sản phẩm" },
  { value: "viewsCount", label: "Lượt xem" },
  { value: "ratingAverage", label: "Đánh giá" },
  { value: "totalSoldCount", label: "Đã bán" },
];

// ─────────────────────────────────────────────────────────────────────────────
// STATS CARD
// ─────────────────────────────────────────────────────────────────────────────

function StatsCard({ label, value, sub, icon, color = "text-accent" }: { label: string; value: number | string; sub: string; icon: React.ReactNode; color?: string }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">{label}</span>
        <span className={`${color} opacity-70`}>{icon}</span>
      </div>
      <p className={`text-[26px] font-bold ${color}`}>{value}</p>
      <p className="text-[11px] text-neutral-dark">{sub}</p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductsPage() {
  // ── Data ────────────────────────────────────────────────────────────────────
  const [allProducts, setAllProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Filters / Toolbar ───────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Selection ───────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // ── Delete modal ────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<ProductCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Bulk action ─────────────────────────────────────────────────────────────
  const [bulkLoading, setBulkLoading] = useState(false);

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllProducts({ limit: 500 }); // load all, filter client-side
      setAllProducts(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: allProducts.length,
      active: allProducts.filter((p) => p.isActive && !p.deletedAt).length,
      inactive: allProducts.filter((p) => !p.isActive && !p.deletedAt).length,
      outOfStock: allProducts.filter((p) => !p.inStock && !p.deletedAt).length,
      featured: allProducts.filter((p) => p.isFeatured && !p.deletedAt).length,
    }),
    [allProducts],
  );

  // ── Tab counts ──────────────────────────────────────────────────────────────
  const tabCounts = useMemo<Record<string, number>>(
    () => ({
      ALL: allProducts.length,
      active: stats.active,
      inactive: stats.inactive,
      outOfStock: stats.outOfStock,
      featured: stats.featured,
    }),
    [allProducts, stats],
  );

  // ── Client-side filter + sort ────────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let list = [...allProducts];

    // Tab filter
    if (activeTab === "active") {
      list = list.filter((p) => p.isActive && !p.deletedAt);
    } else if (activeTab === "inactive") {
      list = list.filter((p) => !p.isActive && !p.deletedAt);
    } else if (activeTab === "outOfStock") {
      list = list.filter((p) => !p.inStock && !p.deletedAt);
    } else if (activeTab === "featured") {
      list = list.filter((p) => p.isFeatured && !p.deletedAt);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q));
    }

    // Date range (createdAt)
    if (dateFrom) {
      list = list.filter((p) => p.createdAt && new Date(p.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((p) => p.createdAt && new Date(p.createdAt) <= end);
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any = (a as any)[sortBy] ?? "";
      let bVal: any = (b as any)[sortBy] ?? "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [allProducts, activeTab, search, dateFrom, dateTo, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const paginatedProducts = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, page, pageSize]);

  // ── Search ───────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const hasActiveFilters = !!(search || dateFrom || dateTo || activeTab !== "ALL");

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setActiveTab("ALL");
    setPage(1);
  }, []);

  // ── Selection ────────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === paginatedProducts.length ? new Set() : new Set(paginatedProducts.map((p) => p.id))));
  }, [paginatedProducts]);

  // ── Toggle active ────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (product: ProductCard) => {
    try {
      await toggleProductActive(product.id, !product.isActive);
      setAllProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, isActive: !p.isActive } : p)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái");
    }
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
      // Mark as deleted in local state (move to trash)
      setAllProducts((prev) => prev.map((p) => (p.id === deleteTarget.id ? { ...p, deletedAt: new Date().toISOString(), isActive: false } : p)));
      setDeleteTarget(null);
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa sản phẩm");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  // ── Bulk actions ─────────────────────────────────────────────────────────────
  const handleBulkAction = useCallback(
    async (action: "delete" | "activate" | "deactivate" | "feature" | "unfeature") => {
      if (selected.size === 0) return;
      setBulkLoading(true);
      try {
        const ids = Array.from(selected);
        await bulkAction(action, ids);
        setSelected(new Set());
        await fetchProducts(); // refetch to sync state
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
        onToggleActive: handleToggleActive,
        onDeleteClick: handleDeleteClick,
      }),
    [page, pageSize, selected, toggleOne, handleToggleActive, handleDeleteClick],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng sản phẩm" value={stats.total} sub="Tất cả sản phẩm trong hệ thống" icon={<Package size={16} />} />
        <StatsCard label="Đang hiển thị" value={stats.active} sub="Khách hàng có thể xem được" icon={<CheckCircle2 size={16} />} color="text-emerald-600" />
        <StatsCard label="Đang ẩn" value={stats.inactive} sub="Chưa được hiển thị cho khách" icon={<EyeOff size={16} />} color="text-orange-500" />
        <StatsCard label="Nổi bật" value={stats.featured} sub="Sản phẩm được đánh dấu featured" icon={<Star size={16} />} color="text-amber-500" />
      </div>

      {/* ── Main table card ── */}
      <div className="bg-neutral-light border border-neutral rounded-xl">
        {/* ── Toolbar ── */}
        <div className="px-5 py-4 border-b border-neutral space-y-3">
          {/* Row 1: Tabs + Actions */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Status tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveTab(tab.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    activeTab === tab.value ? "bg-accent text-white shadow-sm" : "text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {tab.label}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>
                    {tabCounts[tab.value] ?? 0}
                  </span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={fetchProducts}
                disabled={loading}
                title="Làm mới"
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-neutral text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </button>
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-colors cursor-pointer ${
                  showFilters || hasActiveFilters ? "border-accent text-accent bg-accent/5" : "border-neutral text-neutral-dark hover:bg-neutral-light-active"
                }`}
              >
                <Filter size={13} />
                Lọc
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
                {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
              <Link href="/admin/products/create" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold rounded-lg transition-colors">
                <Plus size={14} />
                Thêm sản phẩm
              </Link>
            </div>
          </div>

          {/* Row 2: Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm theo tên, slug..."
                className="w-full pl-8 pr-8 py-1.5 text-[12px] bg-neutral-light border border-neutral rounded-lg text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              {searchInput && (
                <button onClick={handleClearSearch} className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>
            <button onClick={handleSearch} className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-medium rounded-lg transition-colors cursor-pointer">
              Tìm
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="px-3 py-1.5 border border-neutral text-[12px] text-neutral-dark hover:bg-neutral-light-active rounded-lg transition-colors cursor-pointer"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {/* Row 3: Expanded filters */}
          {showFilters && (
            <div className="pt-2 border-t border-neutral grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Từ ngày</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Đến ngày</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Thứ tự</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc");
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  <option value="desc">Mới nhất trước</option>
                  <option value="asc">Cũ nhất trước</option>
                </select>
              </div>
            </div>
          )}
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

        {/* ── Table / States ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchProducts} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Package size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có sản phẩm nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xóa bộ lọc
              </button>
            ) : (
              <Link href="/admin/products/create" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
                Tạo sản phẩm đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={paginatedProducts} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-neutral-dark">/ {filteredProducts.length} sản phẩm</span>
            </div>
            <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
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
