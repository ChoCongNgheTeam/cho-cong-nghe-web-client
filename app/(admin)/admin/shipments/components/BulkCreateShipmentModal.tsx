"use client";

import { useMemo, useState } from "react";
import { Loader2, AlertCircle, CheckCircle2, XCircle, Package } from "lucide-react";
import { Popzy } from "@/components/modal";
import AdminPagination from "@/components/admin/AdminPagination";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { formatDate, formatVND } from "@/helpers";
import { getEligibleOrders, createBulkShipments } from "../_lib/shipments";
import { PROVIDER_OPTIONS, ENABLED_PROVIDERS, ORDER_STATUS_OPTIONS_FOR_PICKER } from "../_lib/constants";
import type { EligibleOrder, EligibleOrdersMeta, ShippingProviderCode, BulkCreateShipmentResultItem } from "../shipment.types";

interface BulkCreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Gọi khi đóng modal SAU KHI đã tạo ít nhất 1 lần — để trang Vận đơn refetch danh sách. */
  onDone: () => void;
}

interface EligibleExtraParams {
  orderStatus?: string;
}

const selectCls = "px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer";

export function BulkCreateShipmentModal({ isOpen, onClose, onDone }: BulkCreateShipmentModalProps) {
  const [orderStatus, setOrderStatus] = useState<string>("");
  const extraParams = useMemo<EligibleExtraParams>(() => ({ orderStatus: orderStatus || undefined }), [orderStatus]);

  const {
    data: orders,
    meta,
    loading,
    error,
    page,
    setPage,
    setSearch,
    searchInput,
    setSearchInput,
    resetPage,
    selected,
    toggleOne,
    clearSelection,
  } = useAdminListPage<EligibleOrder, "orderDate", EligibleExtraParams, EligibleOrdersMeta>({
    fetchFn: getEligibleOrders,
    defaultSortBy: "orderDate",
    defaultMeta: { page: 1, limit: 10, total: 0, totalPages: 1 },
    extraParams,
    getId: (o) => o.id,
  });

  const [providerCode, setProviderCode] = useState<ShippingProviderCode>("GHN");
  const [weightGram, setWeightGram] = useState(500);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [results, setResults] = useState<BulkCreateShipmentResultItem[] | null>(null);

  const successCount = results?.filter((r) => r.success).length ?? 0;

  const resetLocalState = () => {
    setResults(null);
    setSubmitError(null);
    clearSelection();
  };

  const handleClose = () => {
    if (submitting) return;
    const hadResults = !!results;
    resetLocalState();
    onClose();
    if (hadResults) onDone();
  };

  const handleSubmit = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await createBulkShipments({ orderIds: [...selected], providerCode, weightGram });
      setResults(res.data);
    } catch (err: unknown) {
      setSubmitError((err as Error)?.message || "Không thể tạo vận đơn hàng loạt");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Popzy
      isOpen={isOpen}
      onClose={handleClose}
      footer={false}
      closeMethods={submitting ? [] : ["button", "overlay", "escape"]}
      cssClass="!w-[min(880px,95%)]"
      content={
        results ? (
          <div className="py-1 space-y-4">
            <h3 className="text-[16px] font-bold text-primary">Kết quả tạo vận đơn</h3>
            <p className="text-[13px] text-primary">
              Đã tạo thành công {successCount}/{results.length} vận đơn.
            </p>
            <div className="max-h-[360px] overflow-y-auto border border-neutral rounded-xl divide-y divide-neutral">
              {results.map((r) => {
                const order = orders.find((o) => o.id === r.orderId);
                return (
                  <div key={r.orderId} className="flex items-center justify-between gap-3 px-4 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium text-primary truncate">{order?.orderCode ?? r.orderId}</p>
                      {!r.success && <p className="text-[11px] text-promotion truncate">{r.error}</p>}
                      {r.success && r.providerOrderCode && <p className="text-[11px] text-neutral-dark font-mono">{r.providerOrderCode}</p>}
                    </div>
                    {r.success ? <CheckCircle2 size={16} className="text-emerald-500 shrink-0" /> : <XCircle size={16} className="text-promotion shrink-0" />}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end pt-1">
              <button onClick={handleClose} className="px-5 py-2.5 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer">
                Đóng
              </button>
            </div>
          </div>
        ) : (
          <div className="py-1 space-y-4">
            <div>
              <h3 className="text-[16px] font-bold text-primary">Tạo vận đơn hàng loạt</h3>
              <p className="text-[12px] text-neutral-dark mt-0.5">Chọn các đơn hàng chưa có vận đơn để tạo cùng lúc</p>
            </div>

            {submitError && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
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
                placeholder="Tìm mã đơn, tên, SĐT..."
                widthClassName="w-56"
              />
              <select
                value={orderStatus}
                onChange={(e) => {
                  setOrderStatus(e.target.value);
                  resetPage();
                }}
                className={selectCls}
              >
                <option value="">Tất cả trạng thái</option>
                {ORDER_STATUS_OPTIONS_FOR_PICKER.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <span className="ml-auto text-[12px] text-primary">Đã chọn {selected.size} đơn</span>
            </div>

            <div className="border border-neutral rounded-xl overflow-hidden">
              <div className="max-h-[320px] overflow-y-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-neutral-light-active z-10">
                    <tr>
                      <th className="w-10 px-3 py-2"></th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-primary uppercase">Đơn hàng</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-primary uppercase">Người nhận</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-primary uppercase">Tổng tiền</th>
                      <th className="px-3 py-2 text-left text-[11px] font-semibold text-primary uppercase">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center">
                          <Loader2 size={20} className="animate-spin text-accent mx-auto" />
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[13px] text-promotion">
                          {error}
                        </td>
                      </tr>
                    ) : orders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-10 text-center text-[13px] text-neutral-dark">
                          <Package size={24} className="mx-auto mb-2 opacity-40" />
                          Không có đơn hàng nào chưa tạo vận đơn
                        </td>
                      </tr>
                    ) : (
                      orders.map((o) => (
                        <tr key={o.id} className={`border-t border-neutral cursor-pointer hover:bg-neutral-light-active/50 ${selected.has(o.id) ? "bg-accent/5" : ""}`} onClick={() => toggleOne(o.id)}>
                          <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                            <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleOne(o.id)} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[12px] font-semibold text-accent">{o.orderCode}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <p className="text-[12px] text-primary">{o.shippingContactName}</p>
                            <p className="text-[11px] text-neutral-dark">{o.shippingPhone}</p>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[12px] font-medium text-primary">{formatVND(Number(o.totalAmount))}</span>
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-[12px] text-primary">{formatDate(o.orderDate)}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {!loading && meta.total > 0 && (
                <div className="px-3 py-2 border-t border-neutral">
                  <AdminPagination currentPage={meta.page} totalPages={meta.totalPages} total={meta.total} pageSize={meta.limit} onPageChange={setPage} pageSizeOptions={[10, 20]} siblingCount={1} />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2 border-t border-neutral flex-wrap">
              <div className="flex-1 flex items-center gap-2 flex-wrap">
                <select value={providerCode} onChange={(e) => setProviderCode(e.target.value as ShippingProviderCode)} className={selectCls}>
                  {PROVIDER_OPTIONS.map((p) => (
                    <option key={p.value} value={p.value} disabled={!ENABLED_PROVIDERS.includes(p.value)}>
                      {p.label}
                      {!ENABLED_PROVIDERS.includes(p.value) ? " (sắp có)" : ""}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min={1}
                  value={weightGram}
                  onChange={(e) => setWeightGram(Number(e.target.value))}
                  placeholder="Khối lượng (g)"
                  className="w-32 px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              <button
                type="button"
                onClick={handleClose}
                disabled={submitting}
                className="px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || selected.size === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {submitting && <Loader2 size={14} className="animate-spin" />}
                {submitting ? "Đang tạo..." : `Tạo vận đơn (${selected.size})`}
              </button>
            </div>
          </div>
        )
      }
    />
  );
}
