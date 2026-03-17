"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, Ticket, Loader2, XCircle, Filter, ChevronDown, ChevronUp, X, Trash2, Zap, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { VoucherCard } from "./voucher.types";
import { getAllVouchers, updateVoucher, deleteVoucher, bulkDeleteVouchers } from "./_libs/vouchers";
import { STATUS_TABS, SORT_OPTIONS } from "./const";
import { StatsCard } from "@/(admin)/admin/promotions/components/StatsCard";
import { getVoucherColumns } from "./components/TableVouchers";
import { getVoucherStatus } from "./components/VoucherStatusBadge";
import { formatVND } from "@/helpers";

export default function VouchersPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [allVouchers, setAllVouchers] = useState<VoucherCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalFromServer, setTotalFromServer] = useState(0);

  // ── Pagination (server-side) ──────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [discountTypeFilter, setDiscountTypeFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<VoucherCard | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Map tab → API params
      const isActiveParam = activeTab === "active" || activeTab === "upcoming" ? true : activeTab === "inactive" ? false : undefined;
      const isExpiredParam = activeTab === "expired" ? true : undefined;

      const res = await getAllVouchers({
        page,
        limit: pageSize,
        search: search || undefined,
        discountType: (discountTypeFilter as any) || undefined,
        isActive: isActiveParam,
        isExpired: isExpiredParam,
        sortBy: sortBy as any,
        sortOrder,
      });
      setAllVouchers(res.data);
      setTotalFromServer(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách voucher");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, activeTab, discountTypeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  // ── Stats (client-side từ trang hiện tại) ─────────────────────────────────────
  const stats = useMemo(
    () => ({
      total: totalFromServer,
      active: allVouchers.filter((v) => getVoucherStatus(v).value === "active").length,
      upcoming: allVouchers.filter((v) => getVoucherStatus(v).value === "upcoming").length,
      expired: allVouchers.filter((v) => getVoucherStatus(v).value === "expired").length,
      inactive: allVouchers.filter((v) => !v.isActive).length,
    }),
    [allVouchers, totalFromServer],
  );

  const hasActiveFilters = search || activeTab !== "ALL" || discountTypeFilter;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setDiscountTypeFilter("");
    setPage(1);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === allVouchers.length ? new Set() : new Set(allVouchers.map((v) => v.id))));
  }, [allVouchers]);

  // ── Toggle active ─────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (voucher: VoucherCard) => {
    try {
      const res = await updateVoucher(voucher.id, { isActive: !voucher.isActive });
      setAllVouchers((prev) => prev.map((v) => (v.id === voucher.id ? { ...v, ...res.data } : v)));
    } catch (e: any) {
      alert(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, []);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteVoucher(deleteTarget.id);
      setAllVouchers((prev) => prev.filter((v) => v.id !== deleteTarget.id));
      setDeleteTarget(null);
      setSelected((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá voucher");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget]);

  const handleBulkDelete = useCallback(async () => {
    if (!selected.size) return;
    setBulkDeleting(true);
    try {
      await bulkDeleteVouchers([...selected]);
      setAllVouchers((prev) => prev.filter((v) => !selected.has(v.id)));
      setSelected(new Set());
    } catch (e: any) {
      alert(e?.message ?? "Không thể xoá các voucher đã chọn");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected]);

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getVoucherColumns({
        page,
        pageSize,
        selected,
        openStatusId,
        toggleOne,
        setOpenStatusId,
        onToggleActive: handleToggleActive,
        onDeleteClick: setDeleteTarget,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleToggleActive],
  );

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Ticket size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Voucher</h1>
            <p className="text-[12px] text-neutral-dark">Quản lý mã giảm giá và phạm vi áp dụng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchVouchers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Làm mới
          </button>
          <Link href="/admin/vouchers/new" className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl">
            <Plus size={15} /> Tạo voucher
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Tổng voucher" value={stats.total} icon={<Ticket size={16} />} />
        <StatsCard label="Đang hoạt động" value={stats.active} color="text-emerald-600" icon={<CheckCircle2 size={16} />} />
        <StatsCard label="Sắp diễn ra" value={stats.upcoming} color="text-blue-600" icon={<Clock size={16} />} />
        <StatsCard label="Đã hết hạn" value={stats.expired} color="text-neutral-dark" icon={<span className="text-sm">✕</span>} />
        <StatsCard label="Tạm dừng" value={stats.inactive} color="text-orange-500" icon={<Zap size={16} />} />
      </div>

      {/* ── Main card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
        <div className="px-5 py-4 space-y-3 border-b border-neutral">
          {/* Row 1: Status tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${activeTab === tab.value ? "bg-accent text-white" : "text-neutral-dark hover:bg-neutral-light-active"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 2: Search + filter toggle */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setSearch(searchInput);
                    setPage(1);
                  }
                }}
                placeholder="Tìm mã, mô tả voucher..."
                className="w-full pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              {searchInput && (
                <button
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                    setPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => {
                setSearch(searchInput);
                setPage(1);
              }}
              className="px-3 py-2 bg-accent text-white text-[13px] font-medium rounded-xl hover:bg-accent/90 cursor-pointer"
            >
              Tìm
            </button>
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-[13px] cursor-pointer ${showFilters || discountTypeFilter ? "border-accent text-accent bg-accent/5" : "border-neutral text-neutral-dark hover:bg-neutral-light-active"}`}
            >
              <Filter size={14} /> Bộ lọc {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-neutral-dark hover:text-primary hover:bg-neutral-light-active cursor-pointer"
              >
                <X size={13} /> Xoá lọc
              </button>
            )}
            <span className="ml-auto text-[12px] text-neutral-dark">{totalFromServer} voucher</span>
          </div>

          {/* Row 3: Expanded filters */}
          {showFilters && (
            <div className="pt-2 border-t border-neutral grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Loại giảm</label>
                <select
                  value={discountTypeFilter}
                  onChange={(e) => {
                    setDiscountTypeFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  <option value="">Tất cả</option>
                  <option value="DISCOUNT_PERCENT">Giảm %</option>
                  <option value="DISCOUNT_FIXED">Giảm tiền</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
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
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
                >
                  <option value="desc">Mới nhất trước</option>
                  <option value="asc">Cũ nhất trước</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} voucher</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-primary cursor-pointer">
              Bỏ chọn
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[12px] font-medium rounded-lg cursor-pointer"
            >
              {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Xoá {selected.size} voucher
            </button>
          </div>
        )}

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchVouchers} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : allVouchers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Ticket size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có voucher nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <Link href="/admin/vouchers/new" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
                Tạo voucher đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={allVouchers} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* Pagination */}
        {!loading && !error && allVouchers.length > 0 && (
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
              <span className="text-[12px] text-neutral-dark">/ {totalFromServer} voucher</span>
            </div>
            <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Delete Modal */}
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
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá voucher?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
              <p className="text-[14px] font-bold text-primary text-center font-mono mb-5">"{deleteTarget.code}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Voucher sẽ được chuyển vào thùng rác.</p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  {deleting ? "Đang xoá..." : "Xoá voucher"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
