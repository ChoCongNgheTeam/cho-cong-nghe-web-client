"use client";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { Popzy } from "@/components/modal";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import type { InventoryOverviewRow } from "../inventory.types";
import type { WarehouseLite } from "../../warehouses/warehouse.types";

interface ThresholdModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: InventoryOverviewRow | null;
  warehouses: WarehouseLite[];
  onSubmit: (warehouseId: string | undefined, threshold: number) => Promise<void>;
}

export function ThresholdModal({ isOpen, onClose, row, warehouses, onSubmit }: ThresholdModalProps) {
  const [warehouseOption, setWarehouseOption] = useState<EntityOption | null>(null);
  const [threshold, setThreshold] = useState<number>(5);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Đồng bộ giá trị mặc định mỗi khi mở modal cho 1 row khác
  const rowId = row?.id;
  const [lastRowId, setLastRowId] = useState<string | undefined>(undefined);
  if (rowId !== lastRowId) {
    setLastRowId(rowId);
    const firstStock = row?.stocks[0];
    setThreshold(firstStock?.lowStockThreshold ?? 5);
    setWarehouseOption(firstStock ? { id: firstStock.warehouseId, name: firstStock.warehouseName } : null);
    setError(null);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(warehouseOption?.id, threshold);
      onClose();
    } catch (err: unknown) {
      setError((err as Error)?.message || "Không thể cập nhật ngưỡng cảnh báo");
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
          <h3 className="text-[16px] font-bold text-primary mb-1">Chỉnh ngưỡng cảnh báo tồn kho</h3>
          {row && <p className="text-[12px] text-neutral-dark mb-4">{row.product.name}</p>}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
                <AlertCircle size={15} className="mt-0.5 shrink-0" />
                {error}
              </div>
            )}

            {warehouses.length > 1 && (
              <div className="space-y-1.5">
                <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Kho</label>
                <SingleSelectDropdown
                  value={warehouseOption}
                  onChange={setWarehouseOption}
                  options={warehouses.map((w) => ({ id: w.id, name: w.name }))}
                  placeholder="Chọn kho"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Ngưỡng cảnh báo (số lượng)</label>
              <input
                type="number"
                min={0}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                required
              />
              <p className="text-[11px] text-neutral-dark/70">Khi tồn kho ở kho này ≤ ngưỡng, sản phẩm sẽ hiện trong mục "Cảnh báo tồn kho thấp".</p>
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
                {saving ? "Đang lưu..." : "Lưu ngưỡng"}
              </button>
            </div>
          </form>
        </div>
      }
    />
  );
}
