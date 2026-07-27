"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Popzy } from "@/components/modal";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

interface CreateStocktakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  warehouses: WarehouseLite[];
  onSubmit: (warehouseId: string | undefined, note: string) => Promise<void>;
}

export function CreateStocktakeModal({ isOpen, onClose, warehouses, onSubmit }: CreateStocktakeModalProps) {
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(warehouseOption?.id, note.trim());
      setNote("");
      setWarehouseOption(null);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Không thể tạo phiếu kiểm kê");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Popzy
      isOpen={isOpen}
      onClose={onClose}
      footer={false}
      closeMethods={saving ? [] : ["button", "overlay", "escape"]}
      content={
        <div className="py-1">
          <h3 className="text-[16px] font-bold text-primary mb-1">Tạo phiếu kiểm kê</h3>
          <p className="text-[12px] text-neutral-dark mb-4">Hệ thống sẽ chốt số liệu tồn kho hiện tại của toàn bộ sản phẩm đang có hàng trong kho để đối chiếu.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {warehouses.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Kho kiểm kê</label>
                <SingleSelectDropdown value={warehouseOption} onChange={setWarehouseOption} options={warehouses.map((w) => ({ id: w.id, name: w.name }))} placeholder="Kho mặc định" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Ghi chú thêm về đợt kiểm kê"
                className="w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={saving} className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50">
                Huỷ
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {saving ? "Đang tạo..." : "Tạo phiếu kiểm kê"}
              </button>
            </div>
          </form>
        </div>
      }
    />
  );
}
