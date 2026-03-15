"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, Tag, Zap, Clock, CheckCircle2, XCircle, Loader2, Trash2, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { Promotion } from "./promotion.types";
import { getAllPromotions, updatePromotion, deletePromotion } from "./_libs/promotions";
import { STATUS_TABS, SORT_OPTIONS } from "./const";
import { StatsCard } from "./components/StatsCard";
import { getPromotionColumns } from "./components/TablePromotions";
import { getPromotionStatus } from "./components/PromotionStatusBadge";

export default function PromotionsPage() {
  // ── Data ─────────────────────────────────────────────────────────────────────
  const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Filters / Toolbar ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Delete modal ──────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPromotions({ limit: 100 }); // load all, filter client-side
      setAllPromotions(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: allPromotions.length,
      active: allPromotions.filter((p) => {
        const s = getPromotionStatus(p);
        return s.value === "active";
      }).length,
      upcoming: allPromotions.filter((p) => {
        const s = getPromotionStatus(p);
        return s.value === "upcoming";
      }).length,
      expired: allPromotions.filter((p) => {
        const s = getPromotionStatus(p);
        return s.value === "expired";
      }).length,
      inactive: allPromotions.filter((p) => !p.isActive).length,
    };
  }, [allPromotions]);

  // ── Tab counts ─────────────────────────────────────────────────────────────────
  const tabCounts = useMemo<Record<string, number>>(
    () => ({
      ALL: allPromotions.length,
      active: stats.active,
      inactive: stats.inactive,
      expired: stats.expired,
      upcoming: stats.upcoming,
    }),
    [allPromotions, stats],
  );

  // ── Client-side filter + sort ─────────────────────────────────────────────────
  const filteredPromotions = useMemo(() => {
    let list = [...allPromotions];

    // Tab filter
    if (activeTab !== "ALL") {
      list = list.filter((p) => getPromotionStatus(p).value === activeTab);
    }

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? "").toLowerCase().includes(q));
    }

    // Date range filter (createdAt)
    if (dateFrom) {
      list = list.filter((p) => new Date(p.createdAt) >= new Date(dateFrom));
    }
    if (dateTo) {
      const end = new Date(dateTo);
      end.setHours(23, 59, 59, 999);
      list = list.filter((p) => new Date(p.createdAt) <= end);
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
  }, [allPromotions, activeTab, search, dateFrom, dateTo, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredPromotions.length / pageSize));
  const paginatedPromotions = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredPromotions.slice(start, start + pageSize);
  }, [filteredPromotions, page, pageSize]);

  // ── Search submit ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const hasActiveFilters = search || dateFrom || dateTo || activeTab !== "ALL";

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setDateFrom("");
    setDateTo("");
    setActiveTab("ALL");
    setPage(1);
  }, []);

  // ── Selection handlers ────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === paginatedPromotions.length ? new Set() : new Set(paginatedPromotions.map((p) => p.id))));
  }, [paginatedPromotions]);

  // ── Toggle active ──────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (promotion: Promotion) => {
    try {
      const res = await updatePromotion(promotion.id, { isActive: !promotion.isActive });
      setAllPromotions((prev) => prev.map((p) => (p.id === promotion.id ? res.data : p)));
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, []);

  // ── Delete handlers ────────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((promotion: Promotion) => {
    setDeleteTarget(promotion);
    setDeleteError(null);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePromotion(deleteTarget.id);
      setAllPromotions((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa khuyến mãi");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  // ── Columns ────────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getPromotionColumns({
        page,
        pageSize,
        selected,
        openStatusId,
        toggleOne,
        setOpenStatusId,
        onToggleActive: handleToggleActive,
        onDeleteClick: handleDeleteClick,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleToggleActive, handleDeleteClick],
  );

  // ── Click outside to close status dropdown ─────────────────────────────────────
  useEffect(() => {
    if (!openStatusId) return;
    const handle = () => setOpenStatusId(null);
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [openStatusId]);

  return (
    <div className="space-y-5 p-5 bg-neutral-light min-h-full">
      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard label="Tổng khuyến mãi" value={stats.total} sub="Tất cả chương trình đã tạo" icon={<Tag size={16} />} />
        <StatsCard label="Đang hoạt động" value={stats.active} sub="Đang được áp dụng cho sản phẩm" icon={<Zap size={16} />} color="text-emerald-600" />
        <StatsCard label="Sắp diễn ra" value={stats.upcoming} sub="Chưa đến ngày bắt đầu" icon={<Clock size={16} />} color="text-blue-600" />
        <StatsCard label="Đã hết hạn" value={stats.expired} sub="Vượt quá ngày kết thúc" icon={<XCircle size={16} />} color="text-neutral-dark" />
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
                onClick={fetchPromotions}
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
              <Link href="/admin/promotions/new" className="flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-[12px] font-semibold rounded-lg transition-colors">
                <Plus size={14} />
                Thêm mới
              </Link>
            </div>
          </div>

          {/* Row 2: Search */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm theo tên, mô tả..."
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
                Xoá bộ lọc
              </button>
            )}
          </div>

          {/* Row 3: Expanded filters */}
          {showFilters && (
            <div className="pt-2 border-t border-neutral grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Date from */}
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

              {/* Date to */}
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

              {/* Sort by */}
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

              {/* Sort order */}
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

        {/* ── Selection bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} khuyến mãi</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-primary cursor-pointer">
              Bỏ chọn
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchPromotions} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có khuyến mãi nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <Link href="/admin/promotions/new" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
                Tạo khuyến mãi đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={paginatedPromotions} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && filteredPromotions.length > 0 && (
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
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-neutral-dark">/ {filteredPromotions.length} khuyến mãi</span>
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
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá khuyến mãi?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-5">"{deleteTarget.name}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
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
                  {deleting ? "Đang xoá..." : "Xoá khuyến mãi"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
