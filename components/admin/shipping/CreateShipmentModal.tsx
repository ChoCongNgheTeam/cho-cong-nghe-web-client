"use client";

import { useState, type FormEvent } from "react";
import { Loader2, AlertCircle, Truck } from "lucide-react";
import { Popzy } from "@/components/modal";
import { createShipment } from "@/app/(admin)/admin/shipments/_lib/shipments";
import { PROVIDER_OPTIONS, ENABLED_PROVIDERS } from "@/app/(admin)/admin/shipments/_lib/constants";
import type { Shipment, ShippingProviderCode } from "@/app/(admin)/admin/shipments/shipment.types";

interface CreateShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderCode: string;
  onCreated: (shipment: Shipment) => void;
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

const labelCls = "text-[12px] font-semibold text-neutral-dark uppercase tracking-wider";

/**
 * CreateShipmentModal — tạo vận đơn cho 1 đơn hàng đơn lẻ. Dùng ở trang chi
 * tiết Order (SectionCard "Vận chuyển"). Muốn tạo nhiều đơn cùng lúc thì dùng
 * BulkCreateShipmentModal ở trang Vận đơn (app/(admin)/admin/shipments).
 */
export function CreateShipmentModal({ isOpen, onClose, orderId, orderCode, onCreated }: CreateShipmentModalProps) {
  const [providerCode, setProviderCode] = useState<ShippingProviderCode>("GHN");
  const [weightGram, setWeightGram] = useState(500);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await createShipment({ orderId, providerCode, weightGram, note: note.trim() || undefined });
      onCreated(res.data);
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Không thể tạo vận đơn");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popzy
      isOpen={isOpen}
      onClose={() => !saving && onClose()}
      footer={false}
      closeMethods={saving ? [] : ["button", "overlay", "escape"]}
      content={
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <Truck size={16} />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-primary">Tạo vận đơn</h3>
              <p className="text-[12px] text-neutral-dark">Đơn hàng {orderCode}</p>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-1.5">
            <label className={labelCls}>Nhà vận chuyển</label>
            <select value={providerCode} onChange={(e) => setProviderCode(e.target.value as ShippingProviderCode)} className={`${inputCls} cursor-pointer`}>
              {PROVIDER_OPTIONS.map((p) => (
                <option key={p.value} value={p.value} disabled={!ENABLED_PROVIDERS.includes(p.value)}>
                  {p.label}
                  {!ENABLED_PROVIDERS.includes(p.value) ? " (sắp có)" : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Khối lượng (gram)</label>
            <input type="number" min={1} value={weightGram} onChange={(e) => setWeightGram(Number(e.target.value))} className={inputCls} required />
          </div>

          <div className="space-y-1.5">
            <label className={labelCls}>Ghi chú (tuỳ chọn)</label>
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Ghi chú cho đơn vị vận chuyển" className={`${inputCls} resize-none`} />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {saving && <Loader2 size={14} className="animate-spin" />}
              {saving ? "Đang tạo..." : "Tạo vận đơn"}
            </button>
          </div>
        </form>
      }
    />
  );
}
