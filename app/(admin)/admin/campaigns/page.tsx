"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Plus, RefreshCw, Megaphone, Loader2, XCircle, X, Trash2, Zap, Clock, CheckCircle2, ArrowUpDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { Campaign, CampaignType } from "./campaign.types";
import { getAllCampaigns, updateCampaign, deleteCampaign, bulkDeleteCampaigns } from "./_libs/campaigns";
import { SORT_OPTIONS, TYPE_OPTIONS } from "./const";
import { getCampaignColumns } from "./components/TableCampaigns";
import { StatsCard } from "@/components/admin/StatsCard";
import { getCampaignStatus } from "./components/CampaignStatusBadge";
// ─── Types ─────────────────────────────────────────────────────────────────────

interface CampaignMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  statusCounts: { ALL: number; active: number; inactive: number; upcoming: number; expired: number };
}

const DEFAULT_META: CampaignMeta = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
  statusCounts: { ALL: 0, active: 0, inactive: 0, upcoming: 0, expired: 0 },
};

const STATUS_TABS = [
  { value: "ALL", label: "Tất cả" },
  { value: "active", label: "Đang hoạt động" },
  { value: "upcoming", label: "Sắp diễn ra" },
  { value: "expired", label: "Đã kết thúc" },
  { value: "inactive", label: "Tạm dừng" },
];

type SortField = "createdAt" | "name" | "startDate" | "endDate";

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [meta, setMeta] = useState<CampaignMeta>(DEFAULT_META);
  // ALL count riêng — không thay đổi khi filter tab
  const [cachedCounts, setCachedCounts] = useState<CampaignMeta["statusCounts"]>(DEFAULT_META.statusCounts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<CampaignType | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllCampaigns({
        page,
        limit: pageSize,
        search: search || undefined,
        type: typeFilter,
        sortBy,
        sortOrder,
        // Gửi status param lên BE — BE sẽ filter đúng active/upcoming/expired/inactive
        // ALL → không gửi status (BE trả tất cả)
        ...(activeTab !== "ALL" ? { status: activeTab as any } : {}),
      });
      setCampaigns(res.data);
      setMeta(res.meta as CampaignMeta);

      // cachedCounts: ALL luôn giữ tổng thực
      const counts = (res.meta as CampaignMeta).statusCounts;
      if (activeTab === "ALL") {
        setCachedCounts(counts);
      } else {
        // Giữ ALL từ lần fetch trước, update các count con
        setCachedCounts((prev) => ({
          ...prev,
          active: counts.active,
          inactive: counts.inactive,
          expired: counts.expired,
          upcoming: counts.upcoming,
        }));
      }
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách chiến dịch");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, activeTab, search, typeFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const resetPage = useCallback(() => setPage(1), []);
  const hasSortFilter = sortBy !== "createdAt" || sortOrder !== "desc";
  const hasActiveFilters = !!(search || activeTab !== "ALL" || typeFilter);

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setTypeFilter(undefined);
    setSortBy("createdAt");
    setSortOrder("desc");
    resetPage();
  }, [resetPage]);

  // Single-select: bấm lại tab đang active → reset về ALL
  const handleSelectTab = useCallback(
    (tab: string) => {
      setActiveTab((prev) => (prev === tab ? "ALL" : tab));
      resetPage();
    },
    [resetPage],
  );

  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === campaigns.length ? new Set() : new Set(campaigns.map((c) => c.id))));
  }, [campaigns]);

  const handleToggleActive = useCallback(
    async (campaign: Campaign) => {
      try {
        const res = await updateCampaign(campaign.id, { isActive: !campaign.isActive });
        setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? res.data : c)));
        fetchCampaigns();
      } catch (e: any) {
        alert(e?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [fetchCampaigns],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCampaign(deleteTarget.id);
      setDeleteTarget(null);
      setSelected((prev) => {
        const n = new Set(prev);
        n.delete(deleteTarget.id);
        return n;
      });
      fetchCampaigns();
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá chiến dịch");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchCampaigns]);

  const handleBulkDelete = useCallback(async () => {
    if (selected.size === 0) return;
    const hasActive = campaigns.some((c) => {
      if (!selected.has(c.id)) return false;
      const status = getCampaignStatus(c);
      return c.isActive && status.value !== "expired";
    });
    if (hasActive) {
      alert("Không thể xóa chiến dịch đang hoạt động. Vui lòng tắt trước.");
      return;
    }
    setBulkDeleting(true);
    try {
      await bulkDeleteCampaigns([...selected]);
      setSelected(new Set());
      fetchCampaigns();
    } catch (e: any) {
      alert(e?.message ?? "Không thể xoá các chiến dịch đã chọn");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected, campaigns, fetchCampaigns]);

  const columns = useCallback(
    () =>
      getCampaignColumns({
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
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Megaphone size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Chiến dịch</h1>
            <p className="text-[12px] text-primary">Quản lý chiến dịch marketing và danh mục nổi bật</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchCampaigns}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/campaigns/new" className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all">
            <Plus size={15} /> Tạo chiến dịch
          </Link>
        </div>
      </div>

      {/* Stats — dùng cachedCounts */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Tổng chiến dịch" value={cachedCounts.ALL} sub="Tất cả chiến dịch" icon={<Megaphone size={16} />} />
        <StatsCard label="Đang hoạt động" value={cachedCounts.active} sub="Đang chạy" icon={<CheckCircle2 size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
        <StatsCard label="Sắp diễn ra" value={cachedCounts.upcoming} sub="Chưa bắt đầu" icon={<Clock size={16} />} valueClassName="text-blue-600" iconClassName="text-blue-600" />
        <StatsCard label="Tạm dừng" value={cachedCounts.inactive} sub="Đang bị tắt" icon={<Zap size={16} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
      </div>

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
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
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${isActive ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>{count}</span>
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
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  resetPage();
                }
              }}
              placeholder="Tìm tên, mô tả..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Type filter */}
          <select
            value={typeFilter ?? ""}
            onChange={(e) => {
              setTypeFilter(e.target.value === "" ? undefined : (e.target.value as CampaignType));
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent cursor-pointer"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          {/* Sort */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setShowSortDropdown((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[12px] transition-all cursor-pointer ${
                hasSortFilter ? "border-accent bg-accent/5 text-accent" : "border-neutral text-primary hover:bg-neutral-light-active"
              }`}
            >
              <ArrowUpDown size={14} />
              {hasSortFilter ? (SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sắp xếp") : "Sắp xếp"}
              {hasSortFilter ? (
                <X
                  size={12}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSortBy("createdAt");
                    setSortOrder("desc");
                    resetPage();
                  }}
                  className="hover:text-promotion"
                />
              ) : (
                <ChevronDown size={12} className={`transition-transform ${showSortDropdown ? "rotate-180" : ""}`} />
              )}
            </button>
            {showSortDropdown && (
              <div className="absolute top-full left-0 mt-1.5 w-52 bg-neutral-light border border-neutral rounded-xl shadow-lg z-20 overflow-hidden">
                <p className="px-3 py-2 text-[10px] font-semibold text-primary uppercase tracking-wider border-b border-neutral">Sắp xếp theo</p>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      setSortBy(opt.value);
                      setShowSortDropdown(false);
                      resetPage();
                    }}
                    className={`w-full text-left px-3 py-2 text-[12px] transition-colors cursor-pointer ${
                      sortBy === opt.value ? "bg-accent/5 text-accent font-semibold" : "text-primary hover:bg-neutral-light-active"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
                <div className="border-t border-neutral px-3 py-2 flex gap-1.5">
                  {(["asc", "desc"] as const).map((o) => (
                    <button
                      key={o}
                      onClick={() => {
                        setSortOrder(o);
                        setShowSortDropdown(false);
                        resetPage();
                      }}
                      className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                        sortOrder === o ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                      }`}
                    >
                      {o === "asc" ? "Tăng dần" : "Giảm dần"}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {(hasActiveFilters || hasSortFilter) && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}
          <span className="ml-auto text-[12px] text-primary">{meta.total} chiến dịch</span>
        </div>

        {/* Active filter summary */}
        {hasActiveFilters && (
          <div className="px-5 py-2 border-b border-neutral flex items-center gap-2 flex-wrap text-[11px] text-neutral-dark">
            <span className="font-medium text-primary">Đang lọc:</span>
            {activeTab !== "ALL" && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                {STATUS_TABS.find((t) => t.value === activeTab)?.label}
                <button
                  onClick={() => {
                    setActiveTab("ALL");
                    resetPage();
                  }}
                  className="hover:text-promotion cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {search && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                "{search}"
                <button
                  onClick={() => {
                    setSearch("");
                    setSearchInput("");
                    resetPage();
                  }}
                  className="hover:text-promotion cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
            {typeFilter && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 text-accent rounded-md font-medium">
                {typeFilter}
                <button
                  onClick={() => {
                    setTypeFilter(undefined);
                    resetPage();
                  }}
                  className="hover:text-promotion cursor-pointer"
                >
                  <X size={10} />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Selection bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} chiến dịch</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-primary cursor-pointer">
              Bỏ chọn
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 ml-auto px-3 py-1.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[12px] font-medium rounded-lg cursor-pointer"
            >
              {bulkDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
              Xoá {selected.size} chiến dịch
            </button>
          </div>
        )}

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchCampaigns} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Megaphone size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có chiến dịch nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <Link href="/admin/campaigns/new" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
                Tạo chiến dịch đầu tiên
              </Link>
            )}
          </div>
        ) : (
          <AdminTable columns={columns()} data={campaigns} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* Pagination */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  resetPage();
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-primary">/ {meta.total} chiến dịch</span>
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
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá chiến dịch?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
              <p className="text-[14px] font-semibold text-primary text-center mb-5">"{deleteTarget.name}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Chiến dịch sẽ được chuyển vào thùng rác.</p>
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
                  {deleting ? "Đang xoá..." : "Xoá chiến dịch"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
