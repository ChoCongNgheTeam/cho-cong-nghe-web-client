"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PackagePlus, Loader2, AlertCircle } from "lucide-react";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { useToasty } from "@/components/toast";
import { stockIn, getVariantAsSearchOption } from "../_lib/inventory";
import { StockLineItemsForm, newLineItem, type StockLineItem } from "../components/StockLineItemsForm";
import { STOCK_IN_REASON_OPTIONS } from "../_lib/constants";
import type { StockMovementReason } from "../inventory.types";
import { getActiveWarehouses } from "../../warehouses/_lib/warehouses";
import { getActiveSuppliers } from "../../suppliers/_lib/suppliers";
import type { WarehouseLite } from "../../warehouses/warehouse.types";
import type { SupplierLite } from "../../suppliers/supplier.types";

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

export default function StockInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToasty();

  const [warehouses, setWarehouses] = useState<WarehouseLite[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierLite[]>([]);

  useEffect(() => {
    getActiveWarehouses().then((res) => setWarehouses(res.data)).catch(() => {});
    getActiveSuppliers().then((res) => setSuppliers(res.data)).catch(() => {});
  }, []);

  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [supplierOption, setSupplierOption] = useState<EntityOption | null>(null);
  const [reason, setReason] = useState<StockMovementReason>("PURCHASE");
  const [note, setNote] = useState("");
  const [items, setItems] = useState<StockLineItem[]>([newLineItem()]);

  useEffect(() => {
    const variantId = searchParams.get("variantId");
    if (!variantId) return;
    getVariantAsSearchOption(variantId).then((option) => {
      if (option) setItems([{ key: crypto.randomUUID(), variant: option, quantity: 1 }]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      await stockIn({
        warehouseId: warehouseOption?.id,
        supplierId: supplierOption?.id,
        reason,
        note: note.trim() || undefined,
        items: validItems.map((it) => ({ productVariantId: it.variant!.id, quantity: it.quantity, unitCost: it.unitCost })),
      });
      success("Nhập kho thành công!");
      router.push("/admin/inventory/history");
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Nhập kho thất bại";
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
        <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
          <PackagePlus size={18} />
        </div>
        <div>
          <h1 className="text-[20px] font-bold text-primary">Nhập kho</h1>
          <p className="text-[12px] text-primary">Ghi nhận hàng nhập vào kho</p>
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
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin phiếu nhập</p>

          <div className="grid grid-cols-2 gap-4">
            {warehouses.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Kho nhập</label>
                <SingleSelectDropdown value={warehouseOption} onChange={setWarehouseOption} options={warehouses.map((w) => ({ id: w.id, name: w.name }))} placeholder="Kho mặc định" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Nhà cung cấp</label>
              <SingleSelectDropdown value={supplierOption} onChange={setSupplierOption} options={suppliers.map((s) => ({ id: s.id, name: s.name }))} placeholder="Không chọn" />
            </div>

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Lý do nhập</label>
              <select value={reason} onChange={(e) => setReason(e.target.value as StockMovementReason)} className={inputCls}>
                {STOCK_IN_REASON_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Ghi chú</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ghi chú thêm về phiếu nhập" className={`${inputCls} resize-none`} />
          </div>
        </div>

        <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh sách sản phẩm nhập</p>
          <StockLineItemsForm items={items} onChange={setItems} showUnitCost />
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
            {saving ? "Đang lưu..." : "Xác nhận nhập kho"}
          </button>
        </div>
      </form>
    </div>
  );
}
