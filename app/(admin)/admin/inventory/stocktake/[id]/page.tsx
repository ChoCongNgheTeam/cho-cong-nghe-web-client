"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ClipboardCheck, Loader2, XCircle, Save, CheckCircle2, Ban } from "lucide-react";
import { StatusBadge } from "@/components/admin/shared/StatusBadge";
import { useToasty } from "@/components/toast";
import { Stocktake } from "../../inventory.types";
import { getStocktakeDetail, updateStocktakeItems, completeStocktake, cancelStocktake } from "../../_lib/stocktake";
import { STOCKTAKE_STATUS_LABEL } from "../../_lib/constants";
import { ConfirmActionModal } from "../../components/ConfirmActionModal";

const isEditableStatus = (status: Stocktake["status"]) => status === "DRAFT" || status === "IN_PROGRESS";

export default function StocktakeDetailPage() {
  const params = useParams<{ id: string }>();
  const { success, error: toastError } = useToasty();

  const [stocktake, setStocktake] = useState<Stocktake | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [actuals, setActuals] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getStocktakeDetail(params.id);
      setStocktake(res.data);
      const initial: Record<string, number> = {};
      res.data.items.forEach((item) => {
        initial[item.productVariantId] = item.actualQuantity ?? item.systemQuantity;
      });
      setActuals(initial);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Không thể tải phiếu kiểm kê");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  const editable = stocktake ? isEditableStatus(stocktake.status) : false;

  const handleSaveDraft = async () => {
    if (!stocktake) return;
    setSaving(true);
    try {
      const items = stocktake.items.map((item) => ({ productVariantId: item.productVariantId, actualQuantity: actuals[item.productVariantId] ?? item.systemQuantity }));
      const res = await updateStocktakeItems(stocktake.id, { items });
      setStocktake(res.data);
      success("Đã lưu số lượng kiểm kê!");
    } catch (err: unknown) {
      toastError((err as Error)?.message || "Không thể lưu số lượng");
    } finally {
      setSaving(false);
    }
  };

  // Complete
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);

  const handleComplete = async () => {
    if (!stocktake) return;
    setCompleting(true);
    setCompleteError(null);
    try {
      // Lưu số lượng mới nhất trước khi hoàn tất, tránh mất dữ liệu chưa "Lưu tạm"
      const items = stocktake.items.map((item) => ({ productVariantId: item.productVariantId, actualQuantity: actuals[item.productVariantId] ?? item.systemQuantity }));
      await updateStocktakeItems(stocktake.id, { items });
      const res = await completeStocktake(stocktake.id);
      setStocktake(res.data);
      setCompleteOpen(false);
      success("Đã hoàn tất kiểm kê — tồn kho đã được điều chỉnh!");
    } catch (err: unknown) {
      setCompleteError((err as Error)?.message || "Không thể hoàn tất kiểm kê");
    } finally {
      setCompleting(false);
    }
  };

  // Cancel
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancel = async () => {
    if (!stocktake) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const res = await cancelStocktake(stocktake.id);
      setStocktake(res.data);
      setCancelOpen(false);
      success("Đã hủy phiếu kiểm kê");
    } catch (err: unknown) {
      setCancelError((err as Error)?.message || "Không thể hủy phiếu kiểm kê");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !stocktake) {
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center gap-3">
        <XCircle size={36} className="text-promotion opacity-50" />
        <p className="text-[13px] text-primary">{error || "Không tìm thấy phiếu kiểm kê"}</p>
        <Link href="/admin/inventory/stocktake" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const statusInfo = STOCKTAKE_STATUS_LABEL[stocktake.status];
  const checkedCount = stocktake.items.filter((i) => i.actualQuantity !== null).length;

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/inventory/stocktake" className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral text-primary hover:bg-neutral-light-active transition-colors">
            <ArrowLeft size={16} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <ClipboardCheck size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-[18px] font-bold text-primary font-mono">{stocktake.code}</h1>
              <StatusBadge label={statusInfo.label} className={statusInfo.color} />
            </div>
            <p className="text-[12px] text-primary">
              Kho: {stocktake.warehouse.name} · {stocktake.items.length} sản phẩm · đã kiểm {checkedCount}/{stocktake.items.length}
            </p>
          </div>
        </div>

        {editable && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCancelOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <Ban size={14} /> Hủy phiếu
            </button>
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Lưu tạm
            </button>
            <button
              onClick={() => setCompleteOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer"
            >
              <CheckCircle2 size={15} /> Hoàn tất kiểm kê
            </button>
          </div>
        )}
      </div>

      {stocktake.note && (
        <div className="mx-6 mb-4 px-4 py-2.5 rounded-xl bg-neutral-light-active border border-neutral text-[12px] text-primary">
          <span className="font-semibold">Ghi chú: </span>
          {stocktake.note}
        </div>
      )}

      {/* Items table */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral bg-neutral-light-active/40">
              <th className="text-left px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Sản phẩm</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Tồn hệ thống</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Tồn thực tế</th>
              <th className="text-center px-4 py-3 text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Chênh lệch</th>
            </tr>
          </thead>
          <tbody>
            {stocktake.items.map((item) => {
              const actual = actuals[item.productVariantId] ?? item.systemQuantity;
              const diff = actual - item.systemQuantity;
              return (
                <tr key={item.id} className="border-b border-neutral last:border-0">
                  <td className="px-4 py-3">
                    <p className="text-[13px] text-primary">{item.productVariant.product.name}</p>
                    {item.productVariant.code && <p className="text-[11px] text-neutral-dark font-mono">{item.productVariant.code}</p>}
                  </td>
                  <td className="px-4 py-3 text-center text-[13px] text-neutral-dark">{item.systemQuantity}</td>
                  <td className="px-4 py-3 text-center">
                    {editable ? (
                      <input
                        type="number"
                        min={0}
                        value={actual}
                        onChange={(e) => setActuals((prev) => ({ ...prev, [item.productVariantId]: Math.max(0, Number(e.target.value)) }))}
                        className="w-20 mx-auto block px-2 py-1.5 text-[13px] text-center border border-neutral rounded-lg bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
                      />
                    ) : (
                      <span className="text-[13px] text-primary">{item.actualQuantity ?? "—"}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[13px] font-bold ${diff === 0 ? "text-neutral-dark" : diff > 0 ? "text-emerald-600" : "text-promotion"}`}>
                      {diff > 0 ? "+" : ""}
                      {diff}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmActionModal
        isOpen={completeOpen}
        onClose={() => setCompleteOpen(false)}
        title="Hoàn tất kiểm kê?"
        description="Hệ thống sẽ tự động điều chỉnh tồn kho theo số liệu thực tế đã nhập cho các dòng có chênh lệch. Hành động này không thể hoàn tác."
        confirmLabel="Hoàn tất kiểm kê"
        confirmLoadingLabel="Đang hoàn tất..."
        onConfirm={handleComplete}
        loading={completing}
        error={completeError}
      />

      <ConfirmActionModal
        isOpen={cancelOpen}
        onClose={() => setCancelOpen(false)}
        title="Hủy phiếu kiểm kê?"
        description="Phiếu kiểm kê sẽ chuyển sang trạng thái đã hủy, không ảnh hưởng đến tồn kho hiện tại."
        confirmLabel="Hủy phiếu"
        confirmLoadingLabel="Đang hủy..."
        tone="danger"
        onConfirm={handleCancel}
        loading={cancelling}
        error={cancelError}
      />
    </div>
  );
}
