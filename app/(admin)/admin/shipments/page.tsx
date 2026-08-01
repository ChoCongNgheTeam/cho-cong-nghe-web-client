"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { PackageCheck, Truck, Printer, Loader2, XCircle, X, PlusCircle, Cog } from "lucide-react";
import Link from "next/link";
import AdminTable from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/AdminPagination";
import { StatsCard } from "@/components/admin/StatsCard";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { SortDropdown } from "@/components/admin/shared/SortDropdown";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { useToasty } from "@/components/toast";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { getAllShipments, cancelShipment, printBulkLabels } from "./_lib/shipments";
import { getShipmentColumns } from "./components/TableShipments";
import { BulkCreateShipmentModal } from "./components/BulkCreateShipmentModal";
import { STATUS_TABS, SORT_OPTIONS, PROVIDER_OPTIONS } from "./_lib/constants";
import type { Shipment, ShipmentsMeta, ShipmentStatus, ShippingProviderCode } from "./shipment.types";

interface ShipmentExtraParams {
  status?: ShipmentStatus;
  providerCode?: ShippingProviderCode;
}

export default function ShipmentsAdminPage() {
  const { success, error: toastError } = useToasty();

  const [activeTab, setActiveTab] = useState<"ALL" | ShipmentStatus>("ALL");
  const [providerFilter, setProviderFilter] = useState<ShippingProviderCode | "">("");

  const extraParams = useMemo<ShipmentExtraParams>(
    () => ({
      ...(activeTab !== "ALL" ? { status: activeTab } : {}),
      ...(providerFilter ? { providerCode: providerFilter } : {}),
    }),
    [activeTab, providerFilter],
  );

  const {
    data: shipments,
    meta,
    loading,
    error,
    refetch: fetchShipments,
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
  } = useAdminListPage<Shipment, "createdAt" | "expectedDeliveryAt", ShipmentExtraParams, ShipmentsMeta>({
    fetchFn: getAllShipments,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1, statusCounts: {} },
    extraParams,
    getId: (s) => s.id,
  });

  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchInput = useCallback(
    (val: string) => {
      setSearchInput(val);
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
      searchTimeout.current = setTimeout(() => setSearch(val), 400);
    },
    [setSearch, setSearchInput],
  );

  const [showBulkCreate, setShowBulkCreate] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Shipment | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [printing, setPrinting] = useState(false);

  const columns = useMemo(
    () =>
      getShipmentColumns({
        page,
        pageSize,
        selected,
        toggleOne,
        onCancelClick: (shipment) => setCancelTarget(shipment),
      }),
    [page, pageSize, selected, toggleOne],
  );

  const allSelected = shipments.length > 0 && selected.size === shipments.length;

  const handleCancelConfirm = useCallback(async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelShipment(cancelTarget.id);
      setCancelTarget(null);
      fetchShipments();
      success("Đã huỷ vận đơn");
    } catch (err: unknown) {
      setCancelError((err as Error)?.message || "Không thể huỷ vận đơn");
    } finally {
      setCancelling(false);
    }
  }, [cancelTarget, fetchShipments, success]);

  const handleBulkPrint = useCallback(async () => {
    setPrinting(true);
    try {
      const { blob, filename } = await printBulkLabels([...selected]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setSelected(new Set());
    } catch (err: unknown) {
      toastError((err as Error)?.message || "Không thể in tem vận đơn");
    } finally {
      setPrinting(false);
    }
  }, [selected, setSelected, toastError]);

  const statusCounts = meta.statusCounts ?? {};

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-5 pb-3 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <PackageCheck size={18} />
          </div>
          <div>
            <h1 className="text-[18px] font-bold text-primary">Quản lý vận đơn</h1>
            <p className="text-[12px] text-primary">Theo dõi trạng thái giao hàng theo đơn</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/shipping-providers"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
          >
            <Cog size={14} />
            Nhà vận chuyển
          </Link>
          <button
            onClick={() => setShowBulkCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold transition-colors cursor-pointer"
          >
            <PlusCircle size={15} />
            Tạo vận đơn
          </button>
        </div>
      </div>

      <div className="px-6 space-y-4 pb-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatsCard label="Tổng vận đơn" value={statusCounts.ALL ?? meta.total} sub="Theo bộ lọc hiện tại" icon={<PackageCheck size={16} />} />
          <StatsCard
            label="Đang vận chuyển"
            value={(statusCounts.PICKED_UP ?? 0) + (statusCounts.IN_TRANSIT ?? 0) + (statusCounts.CREATED ?? 0)}
            sub="Đã tạo → đang giao"
            icon={<Truck size={16} />}
            valueClassName="text-indigo-500"
            iconClassName="text-indigo-500"
          />
          <StatsCard label="Đã giao" value={statusCounts.DELIVERED ?? 0} sub="Giao thành công" valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
          <StatsCard
            label="Thất bại / Hoàn trả"
            value={(statusCounts.FAILED ?? 0) + (statusCounts.RETURNED ?? 0)}
            sub="Cần xử lý"
            valueClassName="text-promotion"
            iconClassName="text-promotion"
          />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-neutral overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                resetPage();
              }}
              className={`px-4 py-2.5 text-[13px] font-medium transition-colors border-b-2 -mb-px whitespace-nowrap cursor-pointer ${
                activeTab === tab.value ? "border-accent text-accent" : "border-transparent text-primary hover:text-primary"
              }`}
            >
              {tab.label}
              {typeof statusCounts[tab.value] === "number" && <span className="ml-1.5 text-[11px] text-neutral-dark">({statusCounts[tab.value]})</span>}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex-1 min-w-[200px] max-w-xs">
            <SearchBox
              value={searchInput}
              onChange={handleSearchInput}
              onSubmit={(v) => {
                if (searchTimeout.current) clearTimeout(searchTimeout.current);
                setSearch(v);
                resetPage();
              }}
              onClear={() => {
                handleSearchInput("");
                resetPage();
              }}
              placeholder="Tìm mã đơn, mã vận đơn..."
              widthClassName="w-full"
            />
          </div>

          <select
            value={providerFilter}
            onChange={(e) => {
              setProviderFilter(e.target.value as ShippingProviderCode | "");
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            <option value="">Tất cả nhà vận chuyển</option>
            {PROVIDER_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <SortDropdown sortBy={sortBy} sortOrder={sortOrder} options={SORT_OPTIONS} onSortByChange={(v) => setSortBy(v as typeof sortBy)} onSortOrderChange={setSortOrder} ascLabel="Cũ nhất" descLabel="Mới nhất" />
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-4 py-2.5 bg-accent/5 border border-accent/20 rounded-xl">
            <span className="text-[13px] text-accent font-medium">Đã chọn {selected.size} vận đơn</span>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={handleBulkPrint}
                disabled={printing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 text-[12px] font-medium hover:bg-blue-100 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {printing ? <Loader2 size={12} className="animate-spin" /> : <Printer size={12} />}
                In tem hàng loạt
              </button>
              <button onClick={() => setSelected(new Set())} className="flex items-center gap-1 text-[12px] text-primary hover:text-accent transition-colors cursor-pointer">
                <X size={12} /> Bỏ chọn
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 px-4 py-3 bg-promotion-light border border-promotion/30 rounded-xl">
            <XCircle size={16} className="text-promotion shrink-0" />
            <p className="text-[13px] text-promotion">{error}</p>
            <button onClick={fetchShipments} className="ml-auto text-[12px] font-medium text-promotion hover:underline cursor-pointer">
              Thử lại
            </button>
          </div>
        )}

        {/* Table */}
        <div className="bg-white border border-neutral rounded-xl overflow-hidden">
          {shipments.length > 0 && (
            <div className="px-4 py-2.5 border-b border-neutral flex items-center gap-2">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
              <span className="text-[12px] text-primary">{allSelected ? "Bỏ chọn tất cả" : `Chọn tất cả ${shipments.length} vận đơn trên trang`}</span>
            </div>
          )}
          <AdminTable columns={columns} data={shipments} loading={loading} emptyMessage="Không có vận đơn nào" />

          {!loading && meta.total > 0 && (
            <div className="px-4 py-3 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
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
                  {[20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                <span className="text-[12px] text-primary">/ {meta.total} vận đơn</span>
              </div>
              <AdminPagination
                currentPage={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  resetPage();
                }}
                pageSizeOptions={[20, 50, 100]}
                siblingCount={1}
              />
            </div>
          )}
        </div>
      </div>

      {/* Tạo vận đơn hàng loạt */}
      <BulkCreateShipmentModal
        isOpen={showBulkCreate}
        onClose={() => setShowBulkCreate(false)}
        onDone={() => {
          fetchShipments();
          success("Đã tạo vận đơn hàng loạt");
        }}
      />

      {/* Huỷ vận đơn */}
      {cancelTarget && (
        <ConfirmDeleteModal
          isOpen={!!cancelTarget}
          onClose={() => {
            setCancelTarget(null);
            setCancelError(null);
          }}
          title="Huỷ vận đơn?"
          description="Bạn có chắc chắn muốn huỷ vận đơn cho đơn hàng"
          itemName={cancelTarget.order.orderCode}
          warningText="Vận đơn sẽ được báo huỷ với nhà vận chuyển. Hành động này không thể hoàn tác."
          onConfirm={handleCancelConfirm}
          loading={cancelling}
          error={cancelError}
          confirmLabel="Huỷ vận đơn"
          confirmLoadingLabel="Đang huỷ..."
        />
      )}
    </div>
  );
}
