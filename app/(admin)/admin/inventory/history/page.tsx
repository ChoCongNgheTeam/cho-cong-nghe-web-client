"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { History, RefreshCw, Loader2, XCircle, X } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { DateRangeFilterPopover } from "@/components/admin/shared/DateRangeFilterPopover";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { StockMovement, StockMovementsResponse, StockMovementType } from "../inventory.types";
import { getMovementHistory } from "../_lib/inventory";
import { MOVEMENT_TYPE_TABS } from "../_lib/constants";
import { getMovementColumns } from "../components/TableMovements";
import { getActiveWarehouses } from "../../warehouses/_lib/warehouses";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

interface MovementExtraParams {
  type?: StockMovementType;
  warehouseId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export default function InventoryHistoryPage() {
  const [typeFilter, setTypeFilter] = useState<StockMovementType | "ALL">("ALL");
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    getActiveWarehouses().then((res) => setWarehouses(res.data)).catch(() => {});
  }, []);

  const extraParams = useMemo<MovementExtraParams>(
    () => ({
      ...(typeFilter !== "ALL" ? { type: typeFilter } : {}),
      ...(warehouseOption ? { warehouseId: warehouseOption.id } : {}),
      ...(dateFrom ? { dateFrom } : {}),
      ...(dateTo ? { dateTo } : {}),
    }),
    [typeFilter, warehouseOption, dateFrom, dateTo],
  );

  const {
    data: movements,
    meta,
    loading,
    error,
    refetch: fetchMovements,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
  } = useAdminListPage<StockMovement, "createdAt", MovementExtraParams, StockMovementsResponse["meta"]>({
    fetchFn: getMovementHistory,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (m) => m.id,
  });

  const hasActiveFilters = typeFilter !== "ALL" || !!warehouseOption || !!dateFrom || !!dateTo;

  const handleClearAllFilters = useCallback(() => {
    setTypeFilter("ALL");
    setWarehouseOption(null);
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, [setPage]);

  const columns = getMovementColumns(page, pageSize);

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <History size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Lịch sử nhập/xuất</h1>
            <p className="text-[12px] text-primary">Toàn bộ biến động tồn kho: nhập, xuất, bán, hoàn, điều chỉnh</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchMovements}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <Link href="/admin/inventory" className="px-4 py-2 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-all cursor-pointer">
            ← Tồn kho sản phẩm
          </Link>
        </div>
      </div>

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              setTypeFilter("ALL");
              resetPage();
            }}
            className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${typeFilter === "ALL" ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"}`}
          >
            Tất cả
          </button>
          {MOVEMENT_TYPE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setTypeFilter(tab.value);
                resetPage();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                typeFilter === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="w-px h-5 bg-neutral mx-1" />

          {warehouses.length > 1 && (
            <div className="w-44">
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

          <DateRangeFilterPopover
            dateFrom={dateFrom}
            dateTo={dateTo}
            onApply={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
              resetPage();
            }}
            onClear={() => {
              setDateFrom("");
              setDateTo("");
              resetPage();
            }}
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-primary">{meta.total} phiếu</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchMovements} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : movements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <History size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có biến động tồn kho nào"}</p>
            {hasActiveFilters && (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <AdminTable<StockMovement> columns={columns} data={movements} rowKey="id" className="mx-0" />
        )}

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
    </div>
  );
}
