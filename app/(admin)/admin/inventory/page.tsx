"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Boxes, RefreshCw, Loader2, XCircle, X, PackagePlus, PackageMinus, AlertTriangle, History } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { usePopzy } from "@/hooks/usePopzy";
import { useToasty } from "@/components/toast";
import { InventoryOverviewRow, InventoryOverviewResponse, StockStatusFilter } from "./inventory.types";
import { getInventoryOverview, updateLowStockThreshold } from "./_lib/inventory";
import { STOCK_STATUS_TABS } from "./_lib/constants";
import { getInventoryColumns } from "./components/TableInventory";
import { ThresholdModal } from "./components/ThresholdModal";
import { getActiveWarehouses } from "../warehouses/_lib/warehouses";
import type { WarehouseLite } from "../warehouses/warehouse.types";

interface InventoryExtraParams {
  stockStatus?: StockStatusFilter;
  warehouseId?: string;
}

export default function InventoryPage() {
  const { success, error: toastError } = useToasty();

  const [stockStatus, setStockStatus] = useState<StockStatusFilter>("ALL");
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);

  useEffect(() => {
    getActiveWarehouses()
      .then((res) => setWarehouses(res.data))
      .catch(() => {});
  }, []);

  const extraParams = useMemo<InventoryExtraParams>(
    () => ({
      ...(stockStatus !== "ALL" ? { stockStatus } : {}),
      ...(warehouseOption ? { warehouseId: warehouseOption.id } : {}),
    }),
    [stockStatus, warehouseOption],
  );

  const {
    data: rows,
    meta,
    loading,
    error,
    refetch: fetchInventory,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    search,
    setSearch,
    searchInput,
    setSearchInput,
  } = useAdminListPage<InventoryOverviewRow, "createdAt", InventoryExtraParams, InventoryOverviewResponse["meta"]>({
    fetchFn: getInventoryOverview,
    defaultSortBy: "createdAt",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (r) => r.id,
  });

  const hasActiveFilters = search || stockStatus !== "ALL" || !!warehouseOption;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setStockStatus("ALL");
    setWarehouseOption(null);
    setPage(1);
  }, [setSearch, setSearchInput, setPage]);

  // Threshold modal
  const thresholdModal = usePopzy();
  const [thresholdTarget, setThresholdTarget] = useState<InventoryOverviewRow | null>(null);

  const handleEditThreshold = (row: InventoryOverviewRow) => {
    setThresholdTarget(row);
    thresholdModal.open();
  };

  const handleThresholdSubmit = async (warehouseId: string | undefined, threshold: number) => {
    if (!thresholdTarget) return;
    await updateLowStockThreshold(thresholdTarget.id, { warehouseId, lowStockThreshold: threshold });
    success("Cập nhật ngưỡng cảnh báo thành công!");
    fetchInventory();
  };

  const columns = getInventoryColumns({ page, pageSize, onEditThreshold: handleEditThreshold });

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Boxes size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Tồn kho sản phẩm</h1>
            <p className="text-[12px] text-primary">Theo dõi số lượng tồn kho theo từng biến thể sản phẩm</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchInventory}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/inventory/alerts" className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
            <AlertTriangle size={14} /> Cảnh báo
          </Link>
          <Link href="/admin/inventory/history" className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
            <History size={14} /> Lịch sử
          </Link>
          <Link href="/admin/inventory/stock-out" className="flex items-center gap-1.5 px-4 py-2 border border-neutral rounded-xl text-[13px] font-semibold text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
            <PackageMinus size={15} /> Xuất kho
          </Link>
          <Link href="/admin/inventory/stock-in" className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <PackagePlus size={15} /> Nhập kho
          </Link>
        </div>
      </div>

      {/* Main card */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {STOCK_STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStockStatus(tab.value);
                resetPage();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                stockStatus === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="w-px h-5 bg-neutral mx-1" />

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
            placeholder="Tìm tên sản phẩm, mã variant..."
          />

          {warehouses.length > 1 && (
            <div className="w-48">
              <SingleSelectDropdown
                value={warehouseOption}
                onChange={(v) => {
                  setWarehouseOption(v);
                  resetPage();
                }}
                options={warehouses.map((w) => ({ id: w.id, name: w.name }))}
                placeholder="Tất cả các kho"
              />
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-primary">{meta.total} sản phẩm</span>
        </div>

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchInventory} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Boxes size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có dữ liệu tồn kho"}</p>
            {hasActiveFilters && (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <AdminTable<InventoryOverviewRow> columns={columns} data={rows} rowKey="id" className="mx-0" />
        )}

        {/* Pagination */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral">
            <AdminPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={pageSize}
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

      <ThresholdModal isOpen={thresholdModal.isOpen} onClose={thresholdModal.close} row={thresholdTarget} warehouses={warehouses} onSubmit={handleThresholdSubmit} />
    </div>
  );
}
