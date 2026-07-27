"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Loader2, XCircle, PackageX, TrendingDown } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { StatsCard } from "@/components/admin/StatsCard";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { LowStockAlert, LowStockAlertsResponse } from "../inventory.types";
import { getLowStockAlerts } from "../_lib/inventory";
import { getAlertColumns } from "../components/TableAlerts";
import { getActiveWarehouses } from "../../warehouses/_lib/warehouses";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

interface AlertsExtraParams {
  warehouseId?: string;
}

export default function InventoryAlertsPage() {
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);

  useEffect(() => {
    getActiveWarehouses().then((res) => setWarehouses(res.data)).catch(() => {});
  }, []);

  const extraParams = useMemo<AlertsExtraParams>(() => ({ ...(warehouseOption ? { warehouseId: warehouseOption.id } : {}) }), [warehouseOption]);

  const {
    data: alerts,
    meta,
    loading,
    error,
    refetch: fetchAlerts,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
  } = useAdminListPage<LowStockAlert, "createdAt", AlertsExtraParams, LowStockAlertsResponse["meta"]>({
    fetchFn: getLowStockAlerts,
    defaultSortBy: "createdAt",
    defaultPageSize: 50,
    defaultMeta: { page: 1, limit: 50, total: 0, totalPages: 1, outOfStockCount: 0, lowStockCount: 0 },
    extraParams,
    getId: (a) => `${a.variantId}-${a.warehouseId}`,
  });

  const columns = getAlertColumns(page, pageSize);

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Cảnh báo tồn kho thấp</h1>
            <p className="text-[12px] text-primary">Sản phẩm sắp hết hoặc đã hết hàng, cần nhập bổ sung</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
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

      {/* Stats */}
      <div className="px-6 pb-5 grid grid-cols-2 gap-3 max-w-md">
        <StatsCard label="Hết hàng" value={meta.outOfStockCount} sub="Cần nhập gấp" icon={<PackageX size={16} />} valueClassName="text-promotion" iconClassName="text-promotion" />
        <StatsCard label="Sắp hết" value={meta.lowStockCount} sub="Dưới ngưỡng cảnh báo" icon={<TrendingDown size={16} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
      </div>

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
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
          <span className="ml-auto text-[12px] text-primary">{meta.total} cảnh báo</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchAlerts} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <AlertTriangle size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">Không có cảnh báo nào — tồn kho đang ổn 🎉</p>
          </div>
        ) : (
          <AdminTable<LowStockAlert> columns={columns} data={alerts} rowKey={(a) => `${a.variantId}-${a.warehouseId}`} className="mx-0" />
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
              pageSizeOptions={[20, 50, 100]}
              siblingCount={1}
            />
          </div>
        )}
      </div>
    </div>
  );
}
