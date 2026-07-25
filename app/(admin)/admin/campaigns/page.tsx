"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { Plus, RefreshCw, Megaphone, Loader2, XCircle, X, Trash2, Zap, Clock, CheckCircle2, ArrowUpDown, ChevronDown } from "lucide-react";
import Link from "next/link";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import type { Campaign, CampaignType } from "./campaign.types";
import { getAllCampaigns, updateCampaign, deleteCampaign, bulkDeleteCampaigns, type CampaignsResponse, type CampaignStatusCounts } from "./_lib/campaigns";
import { SORT_OPTIONS, TYPE_OPTIONS, STATUS_TABS } from "./_lib/constants";
import { getCampaignColumns } from "./components/TableCampaigns";
import { StatsCard } from "@/components/admin/StatsCard";
import { getCampaignStatus } from "./components/CampaignStatusBadge";
import { useAdminPrefix } from "@/contexts/AdminPrefixContext";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";

type SortField = "createdAt" | "name" | "startDate" | "endDate";
type StatusTab = "ALL" | "active" | "inactive" | "upcoming" | "expired";

interface CampaignExtraParams {
  type?: CampaignType;
  status?: "active" | "inactive" | "upcoming" | "expired";
}

const DEFAULT_STATUS_COUNTS: CampaignStatusCounts = { ALL: 0, active: 0, inactive: 0, upcoming: 0, expired: 0 };

export default function CampaignsPage() {
  // Filter đặc thù module
  const [activeTab, setActiveTab] = useState<StatusTab>("ALL");
  const [typeFilter, setTypeFilter] = useState<CampaignType | undefined>(undefined);
  // ALL count riêng — không đổi khi filter tab, chỉ đồng bộ lại mỗi khi có meta mới
  const [cachedCounts, setCachedCounts] = useState<CampaignStatusCounts>(DEFAULT_STATUS_COUNTS);

  const extraParams = useMemo<CampaignExtraParams>(
    () => ({
      ...(typeFilter ? { type: typeFilter } : {}),
      ...(activeTab !== "ALL" ? { status: activeTab } : {}),
    }),
    [typeFilter, activeTab],
  );

  const {
    data: campaigns,
    setData: setCampaigns,
    meta,
    loading,
    error,
    refetch: fetchCampaigns,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    search,
    setSearch,
    searchInput,
    setSearchInput,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selected,
    setSelected,
    toggleOne,
    toggleAll,
  } = useAdminListPage<Campaign, SortField, CampaignExtraParams, CampaignsResponse["meta"]>({
    fetchFn: getAllCampaigns,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1, statusCounts: DEFAULT_STATUS_COUNTS },
    extraParams,
    getId: (c) => c.id,
  });

  // Đồng bộ cachedCounts mỗi khi có meta mới (giữ ALL không đổi khi đang lọc theo tab con)
  useEffect(() => {
    if (activeTab === "ALL") {
      setCachedCounts(meta.statusCounts);
    } else {
      setCachedCounts((prev) => ({
        ...prev,
        active: meta.statusCounts.active,
        inactive: meta.statusCounts.inactive,
        expired: meta.statusCounts.expired,
        upcoming: meta.statusCounts.upcoming,
      }));
    }
  }, [meta, activeTab]);

  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const prefix = useAdminPrefix();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setShowSortDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
  }, [resetPage, setSearch, setSearchInput, setSortBy, setSortOrder]);

  // Single-select: bấm lại tab đang active → reset về ALL
  const handleSelectTab = useCallback(
    (tab: StatusTab) => {
      setActiveTab((prev) => (prev === tab ? "ALL" : tab));
      resetPage();
    },
    [resetPage],
  );

  const handleToggleActive = useCallback(
    async (campaign: Campaign) => {
      try {
        const res = await updateCampaign(campaign.id, { isActive: !campaign.isActive });
        setCampaigns((prev) => prev.map((c) => (c.id === campaign.id ? res.data : c)));
        fetchCampaigns();
      } catch (e: unknown) {
        alert((e as Error)?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [fetchCampaigns, setCampaigns],
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
    } catch (e: unknown) {
      setDeleteError((e as Error)?.message ?? "Không thể xoá chiến dịch");
    } finally {
      setDeleting(false);
    }
  }, [deleteTarget, fetchCampaigns, setSelected]);

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
    } catch (e: unknown) {
      alert((e as Error)?.message ?? "Không thể xoá các chiến dịch đã chọn");
    } finally {
      setBulkDeleting(false);
    }
  }, [selected, campaigns, fetchCampaigns, setSelected]);

  const columns = useMemo(
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
        prefix,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleToggleActive, prefix],
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
          <Link href={`${prefix}/campaigns/new`} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all">
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
            const count = cachedCounts[tab.value];
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
          <SearchBox
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={(v) => {
              setSearch(v);
              resetPage();
            }}
            onClear={() => {
              setSearchInput("");
              setSearch("");
              resetPage();
            }}
            placeholder="Tìm tên, mô tả..."
          />

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
                &quot;{search}&quot;
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
          <AdminTable columns={columns} data={campaigns} selectable selectedIds={selected} onToggleAll={toggleAll} />
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

      {/* Delete modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => !deleting && setDeleteTarget(null)}
        title="Xoá chiến dịch?"
        itemName={deleteTarget?.name}
        warningText="Chiến dịch sẽ được chuyển vào thùng rác."
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError}
        confirmLabel="Xoá chiến dịch"
      />
    </div>
  );
}
