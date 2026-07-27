"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackageMinus, Loader2, AlertCircle } from "lucide-react";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { useToasty } from "@/components/toast";
import { stockOut } from "../_lib/inventory";
import { StockLineItemsForm, newLineItem, type StockLineItem } from "../components/StockLineItemsForm";
import { STOCK_OUT_REASON_OPTIONS } from "../_lib/constants";
import type { StockMovementReason } from "../inventory.types";
import { getActiveWarehouses } from "../../warehouses/_lib/warehouses";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

export default function StockOutPage() {
  const router = useRouter();
  const { success, error: toastError } = useToasty();

  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);

  useEffect(() => {
    getActiveWarehouses().then((res) => setWarehouses(res.data)).catch(() => {});
  }, []);

  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [reason, setReason] = useState<StockMovementReason>("DAMAGE");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<StockLineItem[]>([newLineItem()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validItems = items.filter((it) => it.variant && it.quantity > 0);
  const hasDuplicate = new Set(validItems.map((it) => it.variant!.id)).size !== validItems.length;
  const canSubmit = validItems.length > 0 && !hasDuplicate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);
    try {
      await stockOut({
        warehouseId: warehouseOption?.id,
        reason,
        note: note.trim() || undefined,
        items: validItems.map((it) => ({ productVariantId: it.variant!.id, quantity: it.quantity })),
      });
      success("Xuất kho thành công!");
      router.push("/admin/inventory/history");
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Xuất kho thất bại";
      setError(message);
      toastError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <Link href="/admin/inventory" className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral text-primary hover:bg-neutral-light-active transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
          <PackageMinus size={18} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-primary">Xuất kho</h1>
          <p className="text-[12px] text-primary">Ghi nhận hàng xuất khỏi kho (hỏng, thất lạc, trả NCC...)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-6 mb-8 max-w-3xl space-y-5">
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
            <AlertCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin phiếu xuất</p>

          <div className="grid grid-cols-2 gap-4">
            {warehouses.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Kho xuất</label>
                <SingleSelectDropdown value={warehouseOption} onChange={setWarehouseOption} options={warehouses.map((w) => ({ id: w.id, name: w.name }))} placeholder="Kho mặc định" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Lý do xuất</label>
              <select value={reason} onChange={(e) => setReason(e.target.value as StockMovementReason)} className={inputCls}>
                {STOCK_OUT_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Ghi chú</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ghi chú thêm về phiếu xuất" className={`${inputCls} resize-none`} />
          </div>
        </div>

        <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh sách sản phẩm xuất</p>
          <StockLineItemsForm items={items} onChange={setItems} />
          <p className="text-[11px] text-neutral-dark/70">Hệ thống sẽ từ chối nếu số lượng xuất vượt quá tồn kho hiện có.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/inventory" className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors">
            Huỷ
          </Link>
          <button
            type="submit"
            disabled={saving || !canSubmit}
            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? "Đang lưu..." : "Xác nhận xuất kho"}
          </button>
        </div>
      </form>
    </div>
  );
}
