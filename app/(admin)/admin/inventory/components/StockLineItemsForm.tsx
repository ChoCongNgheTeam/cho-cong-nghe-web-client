"use client";

import { Plus, Trash2 } from "lucide-react";
import { SingleProductSearch, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { searchVariantsForPicker } from "../_lib/inventory";

export interface StockLineItem {
  key: string;
  variant: EntityOption | null;
  quantity: number;
  unitCost?: number;
}

export function newLineItem(): StockLineItem {
  return { key: crypto.randomUUID(), variant: null, quantity: 1 };
}

interface StockLineItemsFormProps {
  items: StockLineItem[];
  onChange: (items: StockLineItem[]) => void;
  showUnitCost?: boolean;
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

export function StockLineItemsForm({ items, onChange, showUnitCost = false }: StockLineItemsFormProps) {
  const updateItem = (key: string, patch: Partial<StockLineItem>) => {
    onChange(items.map((it) => (it.key === key ? { ...it, ...patch } : it)));
  };

  const removeItem = (key: string) => {
    onChange(items.filter((it) => it.key !== key));
  };

  const addItem = () => {
    onChange([...items, newLineItem()]);
  };

  // Cảnh báo trùng variant giữa các dòng
  const selectedIds = items.map((it) => it.variant?.id).filter(Boolean) as string[];
  const duplicateIds = new Set(selectedIds.filter((id, idx) => selectedIds.indexOf(id) !== idx));

  return (
    <div className="space-y-3">
      <div className={`grid ${showUnitCost ? "grid-cols-[1fr_110px_130px_36px]" : "grid-cols-[1fr_110px_36px]"} gap-2 px-1`}>
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Sản phẩm</p>
        <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Số lượng</p>
        {showUnitCost && <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Đơn giá</p>}
        <span />
      </div>

      {items.map((item) => {
        const isDuplicate = item.variant && duplicateIds.has(item.variant.id);
        return (
          <div key={item.key} className="space-y-1">
            <div className={`grid ${showUnitCost ? "grid-cols-[1fr_110px_130px_36px]" : "grid-cols-[1fr_110px_36px]"} gap-2 items-start`}>
              <SingleProductSearch
                value={item.variant}
                onChange={(v) => updateItem(item.key, { variant: v })}
                onSearch={searchVariantsForPicker}
                placeholder="Tìm tên sản phẩm, mã variant..."
              />
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => updateItem(item.key, { quantity: Math.max(1, Number(e.target.value)) })}
                className={inputCls}
              />
              {showUnitCost && (
                <input
                  type="number"
                  min={0}
                  value={item.unitCost ?? ""}
                  onChange={(e) => updateItem(item.key, { unitCost: e.target.value === "" ? undefined : Number(e.target.value) })}
                  placeholder="0"
                  className={inputCls}
                />
              )}
              <button
                type="button"
                onClick={() => removeItem(item.key)}
                disabled={items.length === 1}
                title="Xoá dòng"
                className="w-9 h-[42px] flex items-center justify-center rounded-xl text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Trash2 size={15} />
              </button>
            </div>
            {isDuplicate && <p className="text-[11px] text-promotion pl-1">Sản phẩm này đã được chọn ở dòng khác</p>}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addItem}
        className="w-full flex items-center justify-center gap-1.5 px-3 py-2 border border-dashed border-neutral rounded-xl text-[12px] text-neutral-dark hover:border-accent hover:text-accent hover:bg-accent/5 transition-all cursor-pointer"
      >
        <Plus size={13} /> Thêm dòng sản phẩm
      </button>
    </div>
  );
}
