"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ClipboardCheck, RefreshCw, Loader2, XCircle, Plus, X } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { usePopzy } from "@/hooks/usePopzy";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { useToasty } from "@/components/toast";
import { Stocktake, StocktakesResponse, StocktakeStatus } from "../inventory.types";
import { getStocktakes, createStocktake } from "../_lib/stocktake";
import { STOCKTAKE_STATUS_LABEL } from "../_lib/constants";
import { getStocktakeColumns } from "../components/TableStocktakes";
import { CreateStocktakeModal } from "../components/CreateStocktakeModal";
import { getActiveWarehouses } from "../../warehouses/_lib/warehouses";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

interface StocktakeExtraParams {
  status?: StocktakeStatus;
  warehouseId?: string;
}

const STATUS_TABS: { value: StocktakeStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "DRAFT", label: STOCKTAKE_STATUS_LABEL.DRAFT.label },
  { value: "IN_PROGRESS", label: STOCKTAKE_STATUS_LABEL.IN_PROGRESS.label },
  { value: "COMPLETED", label: STOCKTAKE_STATUS_LABEL.COMPLETED.label },
  { value: "CANCELLED", label: STOCKTAKE_STATUS_LABEL.CANCELLED.label },
];

export default function StocktakeListPage() {
  const router = useRouter();
  const { success } = useToasty();

  const [statusFilter, setStatusFilter] = useState<StocktakeStatus | "ALL">("ALL");
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);

  useEffect(() => {
    getActiveWarehouses().then((res) => setWarehouses(res.data)).catch(() => {});
  }, []);

  const extraParams = useMemo<StocktakeExtraParams>(
    () => ({
      ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
      ...(warehouseOption ? { warehouseId: warehouseOption.id } : {}),
    }),
    [statusFilter, warehouseOption],
  );

  const {
    data: stocktakes,
    meta,
    loading,
    error,
    refetch: fetchStocktakes,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
  } = useAdminListPage<Stocktake, "createdAt", StocktakeExtraParams, StocktakesResponse["meta"]>({
    fetchFn: getStocktakes,
    defaultSortBy: "createdAt",
    defaultSortOrder: "desc",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (s) => s.id,
  });

  const hasActiveFilters = statusFilter !== "ALL" || !!warehouseOption;

  const handleClearAllFilters = useCallback(() => {
    setStatusFilter("ALL");
    setWarehouseOption(null);
    setPage(1);
  }, [setPage]);

  const createModal = usePopzy();

  const handleCreateSubmit = async (warehouseId: string | undefined, note: string) => {
    const res = await createStocktake({ warehouseId, note: note || undefined });
    createModal.close();
    success("Tạo phiếu kiểm kê thành công!");
    router.push(`/admin/inventory/stocktake/${res.data.id}`);
  };

  const columns = getStocktakeColumns(page, pageSize);

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Kiểm kê kho</h1>
            <p className="text-[12px] text-primary">Đối chiếu tồn kho thực tế với hệ thống</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStocktakes}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={createModal.open} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Tạo phiếu kiểm kê
          </button>
        </div>
      </div>

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setStatusFilter(tab.value);
                resetPage();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                statusFilter === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
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
            <button onClick={fetchStocktakes} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : stocktakes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardCheck size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có phiếu kiểm kê nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={createModal.open} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Tạo phiếu kiểm kê đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable<Stocktake> columns={columns} data={stocktakes} rowKey="id" className="mx-0" />
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

      <CreateStocktakeModal isOpen={createModal.isOpen} onClose={createModal.close} warehouses={warehouses} onSubmit={handleCreateSubmit} />
    </div>
  );
}
