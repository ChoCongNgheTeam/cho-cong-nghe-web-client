"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Search, Plus, RefreshCw, Zap, Clock, XCircle, Loader2,
  Trash2, X, Tag, CalendarDays, ChevronDown, ArrowUpDown,
  ShieldAlert, EyeOff,
} from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { Promotion, PromotionStatus } from "./promotion.types";
import { getAllPromotions, updatePromotion, deletePromotion } from "./_libs/promotions";
import { SORT_OPTIONS } from "./const";
import { getPromotionColumns } from "./components/TablePromotions";
import { StatsCard } from "@/components/admin/StatsCard";

// ─── Hook ──────────────────────────────────────────────────────────────────────

function usePopzy() {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  return { isOpen, open, close };
}

// ─── Types ─────────────────────────────────────────────────────────────────────

interface PromotionMeta {
  page: number; limit: number; total: number; totalPages: number;
  statusCounts: { ALL: number; active: number; inactive: number; expired: number; upcoming: number };
}

const DEFAULT_META: PromotionMeta = {
  page: 1, limit: 20, total: 0, totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, expired: 0, upcoming: 0 },
};

// "ALL" = no filter; other values are single-select status filters
type FilterTab = "ALL" | PromotionStatus;

const STATUS_TABS: { value: FilterTab; label: string }[] = [
  { value: "ALL",      label: "Tất cả" },
  { value: "active",   label: "Đang hoạt động" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "expired",  label: "Đã hết hạn" },
  { value: "inactive", label: "Không hoạt động" },
];

type SortBy = "createdAt" | "name" | "priority" | "startDate" | "endDate";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function PromotionsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [meta, setMeta] = useState<PromotionMeta>(DEFAULT_META);
  // Cache statusCounts riêng — chỉ update khi fetch không có filter status
  // để tab "Tất cả" luôn hiện đúng tổng, không bị thay đổi khi lọc tab khác
  const [cachedCounts, setCachedCounts] = useState<PromotionMeta["statusCounts"]>(DEFAULT_META.statusCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────
  // Single-select status: "ALL" means no filter
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const dateRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  // ── Selection ─────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────
  const deleteModal = usePopzy();
  const [deleteTarget, setDeleteTarget] = useState<Promotion | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const activeWarningModal = usePopzy();
  const [activeDeleteTarget, setActiveDeleteTarget] = useState<Promotion | null>(null);

  const bulkDeleteModal = usePopzy();
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [bulkDeleteError, setBulkDeleteError] = useState<string | null>(null);

  // ── Outside click ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) setShowDatePicker(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllPromotions({
        page, limit: pageSize,
        search: search || undefined,
        sortBy, sortOrder,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        status: activeTab !== "ALL" ? activeTab : undefined,
      });
      setPromotions(res.data);
      setMeta(res.meta as PromotionMeta);
      // BE luôn trả statusCounts đầy đủ (active/inactive/expired/upcoming)
      // NHƯNG statusCounts.ALL = tổng theo filter hiện tại, không phải tổng thực
      // → chỉ update cachedCounts khi không có filter status
      // → khi đang filter tab, giữ nguyên cachedCounts cũ để "Tất cả" không bị đổi
      if (activeTab === "ALL") {
        setCachedCounts((res.meta as PromotionMeta).statusCounts);
      } else {
        // Vẫn update các count con (active/inactive/expired/upcoming) từ BE
        // nhưng giữ nguyên ALL từ lần fetch trước
        setCachedCounts((prev) => ({
          ...prev,
          active:   (res.meta as PromotionMeta).statusCounts.active,
          inactive: (res.meta as PromotionMeta).statusCounts.inactive,
          expired:  (res.meta as PromotionMeta).statusCounts.expired,
          upcoming: (res.meta as PromotionMeta).statusCounts.upcoming,
        }));
      }
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách khuyến mãi");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, sortBy, sortOrder, dateFrom, dateTo]);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetPage = useCallback(() => setPage(1), []);

  const hasDateFilter = !!dateFrom || !!dateTo;
  const hasSortFilter = sortBy !== "createdAt" || sortOrder !== "desc";
  const hasActiveFilters = !!(search || hasDateFilter || activeTab !== "ALL");

  // Single-select tab: clicking active tab resets to ALL; otherwise switch
  const handleSelectTab = useCallback((tab: FilterTab) => {
    setActiveTab((prev) => (prev === tab ? "ALL" : tab));
    resetPage();
  }, [resetPage]);

  const handleClearAllFilters = useCallback(() => {
    setSearch(""); setSearchInput("");
    setDateFrom(""); setDateTo("");
    setActiveTab("ALL");
    setSortBy("createdAt"); setSortOrder("desc");
    resetPage();
  }, [resetPage]);

  // ── Selection ─────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => prev.size === promotions.length ? new Set() : new Set(promotions.map((p) => p.id)));
  }, [promotions]);

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (promotion: Promotion) => {
    try {
      const res = await updatePromotion(promotion.id, { isActive: !promotion.isActive });
      setPromotions((prev) => prev.map((p) => (p.id === promotion.id ? res.data : p)));
      fetchPromotions();
    } catch (e: any) {
      setError(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, [fetchPromotions]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteClick = useCallback((promotion: Promotion) => {
    setDeleteError(null);
    if (promotion.isActive && !promotion.isExpired) {
      setActiveDeleteTarget(promotion);
      activeWarningModal.open();
    } else {
      setDeleteTarget(promotion);
      deleteModal.open();
    }
  }, [activeWarningModal, deleteModal]);

  const handleProceedDeleteActive = useCallback(() => {
    activeWarningModal.close();
    if (activeDeleteTarget) {
      setDeleteTarget(activeDeleteTarget);
      setActiveDeleteTarget(null);
      setTimeout(() => deleteModal.open(), 150);
    }
  }, [activeWarningModal, activeDeleteTarget, deleteModal]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true); setDeleteError(null);
    try {
      await deletePromotion(deleteTarget.id);
      deleteModal.close(); setDeleteTarget(null);
      setSelected((prev) => { const next = new Set(prev); next.delete(deleteTarget.id); return next; });
      fetchPromotions();
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xóa khuyến mãi");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, deleteModal, fetchPromotions]);

  // ── Bulk ──────────────────────────────────────────────────────────────────
  const handleBulkDeleteConfirm = useCallback(async () => {
    setBulkDeleting(true); setBulkDeleteError(null);
    try {
      await Promise.all([...selected].map((id) => deletePromotion(id)));
      bulkDeleteModal.close(); setSelected(new Set()); fetchPromotions();
    } catch (e: any) {
      setBulkDeleteError(e?.message ?? "Không thể xóa một số khuyến mãi");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected, bulkDeleteModal, fetchPromotions]);

  const handleBulkDeactivate = useCallback(async () => {
    try {
      const targets = promotions.filter((p) => selected.has(p.id) && p.isActive);
      await Promise.all(targets.map((p) => updatePromotion(p.id, { isActive: false })));
      setSelected(new Set()); fetchPromotions();
    } catch (e: any) {
      setError(e?.message ?? "Không thể vô hiệu hóa");
    }
  }, [selected, promotions, fetchPromotions]);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useCallback(() =>
    getPromotionColumns({
      page, pageSize, selected, openStatusId, toggleOne, setOpenStatusId,
      onToggleActive: handleToggleActive, onDeleteClick: handleDeleteClick,
    }),
    [page, pageSize, selected, openStatusId, toggleOne, handleToggleActive, handleDeleteClick],
  );

  const selectedActiveCount = [...selected].filter((id) => promotions.find((p) => p.id === id)?.isActive).length;

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Zap size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Khuyến mãi</h1>
            <p className="text-[13px] text-primary">Quản lý các chương trình khuyến mãi và giảm giá</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPromotions} disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/promotions/new"
            className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all">
            <Plus size={15} /> Thêm khuyến mãi
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatsCard label="Tổng khuyến mãi" value={cachedCounts.ALL} sub="Tất cả chương trình" icon={<Tag size={18} />} valueClassName="text-accent" />
        <StatsCard label="Đang hoạt động" value={cachedCounts.active} sub="Đang được áp dụng" icon={<Zap size={18} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
        <StatsCard label="Sắp diễn ra" value={cachedCounts.upcoming} sub="Chưa đến ngày bắt đầu" icon={<Clock size={18} />} valueClassName="text-blue-600" iconClassName="text-blue-600" />
        <StatsCard label="Đã hết hạn" value={cachedCounts.expired} sub="Vượt quá ngày kết thúc" icon={<XCircle size={18} />} valueClassName="text-primary" iconClassName="text-primary" />
      </div>

      {/* ── Main table card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">

        {/* ── Toolbar ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">

          {/* Status tabs — single-select, combinable with other filters */}
          {STATUS_TABS.map((tab) => {
            const isActive = activeTab === tab.value;
            const count = cachedCounts[tab.value as keyof typeof cachedCounts] ?? 0;
            return (
              <button
                key={tab.value}
                onClick={() => handleSelectTab(tab.value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                  isActive ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${
                  isActive ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"
                }`}>
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
              onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); resetPage(); } }}
              placeholder="Tìm tên, mô tả..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button onClick={() => { setSearchInput(""); setSearch(""); resetPage(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary cursor-pointer">
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort dropdown */}
          <div ref={sortRef} className="relative">
            <button onClick={() => setShowSortDropdown((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                hasSortFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
              }`}>
              <ArrowUpDown size={14} />
              {hasSortFilter ? (SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sắp xếp") : "Sắp xếp"}
              {hasSortFilter ? (
                <X size={12} onClick={(e) => { e.stopPropagation(); setSortBy("createdAt"); setSortOrder("desc"); resetPage(); }} className="hover:text-promotion" />
              ) : (
                <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              )}
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-neutral">Sắp xếp theo</p>
                {SORT_OPTIONS.map((opt) => (
                  <button key={opt.value} onClick={() => { setSortBy(opt.value); setShowSortDropdown(false); resetPage(); }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                      sortBy === opt.value ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                    }`}>
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-neutral px-3 py-2 flex gap-1.5">
                  {(["asc", "desc"] as const).map((o) => (
                    <button key={o} onClick={() => { setSortOrder(o); setShowSortDropdown(false); resetPage(); }}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        sortOrder === o ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                      }`}>
                      {o === "asc" ? "Tăng dần" : "Giảm dần"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Date filter */}
          <div ref={dateRef} className="relative">
            <button onClick={() => setShowDatePicker((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                hasDateFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
              }`}>
              <CalendarDays size={14} />
              {hasDateFilter ? `${dateFrom || "..."} → ${dateTo || "..."}` : "Ngày tạo"}
              {hasDateFilter && (
                <X size={12} onClick={(e) => { e.stopPropagation(); setDateFrom(""); setDateTo(""); resetPage(); }} className="hover:text-promotion" />
              )}
            </button>
            {showDatePicker && (
              <div className="absolute top-full right-0 mt-1.5 w-72 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 p-4 space-y-3">
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Khoảng thời gian</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-primary">Từ ngày</label>
                    <input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-primary">Đến ngày</label>
                    <input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)}
                      className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setDateFrom(""); setDateTo(""); setShowDatePicker(false); resetPage(); }}
                    className="flex-1 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active cursor-pointer">Xóa</button>
                  <button onClick={() => { setShowDatePicker(false); resetPage(); }}
                    className="flex-1 py-1.5 rounded-lg bg-accent text-white text-[12px] font-medium hover:bg-accent/90 cursor-pointer">Áp dụng</button>
                </div>
              </div>
            )}
          </div>

          {/* Clear all filters */}
          {(hasActiveFilters || hasSortFilter) && (
            <button onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
              <X size={13} /> Xoá lọc
            </button>
          )}
        </div>

        {/* ── Active filter summary (combinable indicator) ── */}
        {hasActiveFilters && (
          <div className="px-5 py-2 bg-accent/3 border-b border-neutral flex items-center gap-2 flex-wrap text-[11px] text-neutral-dark">
            <span className="font-medium text-primary">Đang lọc:</span>
            {activeTab !== "ALL" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                {STATUS_TABS.find((t) => t.value === activeTab)?.label}
                <button onClick={() => { setActiveTab("ALL"); resetPage(); }} className="hover:text-promotion cursor-pointer"><X size={10} /></button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                "{search}"
                <button onClick={() => { setSearch(""); setSearchInput(""); resetPage(); }} className="hover:text-promotion cursor-pointer"><X size={10} /></button>
              </span>
            )}
            {hasDateFilter && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                {dateFrom || "..."} → {dateTo || "..."}
                <button onClick={() => { setDateFrom(""); setDateTo(""); resetPage(); }} className="hover:text-promotion cursor-pointer"><X size={10} /></button>
              </span>
            )}
            <span className="ml-auto text-[10px]">{meta.total} kết quả</span>
          </div>
        )}

        {/* ── Bulk action bar ── */}
        {selected.size > 0 && (
          <div className="px-5 py-2.5 bg-accent/5 border-b border-accent/20 flex items-center gap-3 flex-wrap">
            <span className="text-[12px] font-semibold text-accent">Đã chọn {selected.size} khuyến mãi</span>
            {selectedActiveCount > 0 && (
              <button onClick={handleBulkDeactivate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                <EyeOff size={13} /> Vô hiệu hoá ({selectedActiveCount})
              </button>
            )}
            <button onClick={bulkDeleteModal.open}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-promotion/30 text-[12px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer">
              <Trash2 size={13} /> Xoá ({selected.size})
            </button>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-primary hover:text-primary cursor-pointer ml-auto">Bỏ chọn</button>
          </div>
        )}

        {/* ── Table ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchPromotions} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">Thử lại</button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : promotions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Zap size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có khuyến mãi nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">Xoá bộ lọc</button>
            ) : (
              <Link href="/admin/promotions/new" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">Tạo khuyến mãi đầu tiên</Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns()} data={promotions} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary">Hiển thị</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); resetPage(); }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer">
                {[10, 20, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="text-[12px] text-primary">/ {meta.total} khuyến mãi</span>
            </div>
            <AdminPagination
              currentPage={meta.page} totalPages={meta.totalPages} total={meta.total}
              pageSize={meta.limit} onPageChange={setPage}
              onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
              pageSizeOptions={[10, 20, 50]} siblingCount={1}
            />
          </div>
        )}
      </div>

      {/* ── Modal: cảnh báo active ── */}
      <Popzy isOpen={activeWarningModal.isOpen} onClose={activeWarningModal.close} footer={false}
        closeMethods={["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 mx-auto mb-4"><ShieldAlert size={22} strokeWidth={1.5} /></div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Khuyến mãi đang hoạt động!</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Khuyến mãi</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-3">"{activeDeleteTarget?.name}"</p>
            <p className="text-[13px] text-primary/60 text-center mb-6">đang được áp dụng cho khách hàng. Bạn có chắc chắn muốn xóa không?</p>
            <div className="flex gap-2">
              <button onClick={activeWarningModal.close} className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">Giữ lại</button>
              <button onClick={handleProceedDeleteActive} className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer">Vẫn tiếp tục xóa</button>
            </div>
          </div>
        }
      />

      {/* ── Modal: xác nhận xóa đơn ── */}
      <Popzy isOpen={deleteModal.isOpen} onClose={() => !deleting && deleteModal.close()} footer={false}
        closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4"><Trash2 size={22} strokeWidth={1.5} /></div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá khuyến mãi?</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{deleteTarget?.name}"</p>
            <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
            {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
            <div className="flex gap-2">
              <button onClick={() => deleteModal.close()} disabled={deleting} className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50">Huỷ</button>
              <button onClick={handleDeleteConfirm} disabled={deleting} className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Đang xoá..." : "Xoá khuyến mãi"}
              </button>
            </div>
          </div>
        }
      />

      {/* ── Modal: bulk delete ── */}
      <Popzy isOpen={bulkDeleteModal.isOpen} onClose={() => !bulkDeleting && bulkDeleteModal.close()} footer={false}
        closeMethods={bulkDeleting ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4"><Trash2 size={22} strokeWidth={1.5} /></div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-2">Xoá {selected.size} khuyến mãi?</h3>
            {selectedActiveCount > 0 && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-[12px] text-center">
                ⚠ Có {selectedActiveCount} khuyến mãi đang hoạt động trong danh sách
              </div>
            )}
            <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
            {bulkDeleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{bulkDeleteError}</div>}
            <div className="flex gap-2">
              <button onClick={() => bulkDeleteModal.close()} disabled={bulkDeleting} className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50">Huỷ</button>
              <button onClick={handleBulkDeleteConfirm} disabled={bulkDeleting} className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                {bulkDeleting && <Loader2 size={13} className="animate-spin" />}
                {bulkDeleting ? "Đang xoá..." : `Xoá ${selected.size} khuyến mãi`}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}