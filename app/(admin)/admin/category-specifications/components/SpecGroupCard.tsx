"use client";

import { useState } from "react";
import { GripVertical, Trash2, ChevronDown, ChevronUp, Loader2, Pencil, Check, X, AlertTriangle } from "lucide-react";
import type { CategorySpecItem } from "../category_specification.types";
import { FILTER_TYPE_LABELS, FILTER_TYPE_COLORS } from "../../specifications/const";

interface SpecGroupCardProps {
  groupName: string;
  items: CategorySpecItem[];
  onUpdate: (
    specificationId: string,
    changes: Partial<{
      groupName: string;
      isRequired: boolean;
      sortOrder: number;
    }>,
  ) => Promise<void>;
  onRemove: (specificationId: string) => Promise<void>;
}

interface ItemRowProps {
  item: CategorySpecItem;
  onUpdate: SpecGroupCardProps["onUpdate"];
  onRemove: SpecGroupCardProps["onRemove"];
}

// ── Confirm Modal ─────────────────────────────────────────────────────────────
interface ConfirmRemoveModalProps {
  specName: string;
  removing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmRemoveModal({ specName, removing, onConfirm, onCancel }: ConfirmRemoveModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={!removing ? onCancel : undefined} />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm bg-neutral-light rounded-2xl shadow-xl border border-neutral overflow-hidden">
        {/* Header */}
        <div className="flex items-start gap-3 px-5 pt-5 pb-4">
          <div className="w-9 h-9 rounded-xl bg-promotion/10 flex items-center justify-center shrink-0">
            <AlertTriangle size={16} className="text-promotion" />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-primary">Xoá thông số khỏi danh mục?</h3>
            <p className="text-[12px] text-neutral-dark mt-1 leading-relaxed">
              Thông số <span className="font-semibold text-primary">"{specName}"</span> sẽ bị gỡ khỏi danh mục này. Bạn có thể thêm lại sau.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-neutral mx-5" />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-4">
          <button
            onClick={onCancel}
            disabled={removing}
            className="px-4 py-2 text-[13px] font-medium text-neutral-dark border border-neutral rounded-xl hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            disabled={removing}
            className="flex items-center gap-2 px-4 py-2 text-[13px] font-semibold text-white bg-promotion hover:bg-promotion/90 rounded-xl transition-colors cursor-pointer disabled:opacity-60"
          >
            {removing ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Đang xoá...
              </>
            ) : (
              <>
                <Trash2 size={13} />
                Xoá
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({ item, onUpdate, onRemove }: ItemRowProps) {
  const [editingSortOrder, setEditingSortOrder] = useState(false);
  const [sortOrderValue, setSortOrderValue] = useState(String(item.sortOrder));
  const [updatingRequired, setUpdatingRequired] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [savingSortOrder, setSavingSortOrder] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const spec = item.specification;

  const handleToggleRequired = async () => {
    setUpdatingRequired(true);
    try {
      await onUpdate(item.specificationId, { isRequired: !item.isRequired });
    } finally {
      setUpdatingRequired(false);
    }
  };

  const handleSaveSortOrder = async () => {
    const val = parseInt(sortOrderValue, 10);
    if (isNaN(val)) {
      setSortOrderValue(String(item.sortOrder));
      setEditingSortOrder(false);
      return;
    }
    setSavingSortOrder(true);
    try {
      await onUpdate(item.specificationId, { sortOrder: val });
      setEditingSortOrder(false);
    } finally {
      setSavingSortOrder(false);
    }
  };

  const handleConfirmRemove = async () => {
    setRemoving(true);
    try {
      await onRemove(item.specificationId);
    } finally {
      setRemoving(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-light-active/50 transition-colors group">
        {/* Drag handle (visual only) */}
        <GripVertical size={14} className="text-neutral-dark/30 shrink-0 cursor-grab" />

        {/* Icon + Name */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          {spec.icon && <span className="text-base shrink-0 leading-none">{spec.icon}</span>}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[13px] font-medium text-primary">{spec.name}</span>
              {spec.unit && <span className="text-[11px] text-neutral-dark/70">({spec.unit})</span>}
              {item.isRequired && <span className="text-[10px] px-1.5 py-0.5 rounded bg-promotion/10 text-promotion font-semibold">Bắt buộc</span>}
              {spec.isFilterable && spec.filterType && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${FILTER_TYPE_COLORS[spec.filterType] ?? ""}`}>{FILTER_TYPE_LABELS[spec.filterType]}</span>
              )}
            </div>
            <span className="text-[11px] text-neutral-dark font-mono bg-neutral-light-active px-1.5 py-0.5 rounded mt-0.5 inline-block">{spec.key}</span>
          </div>
        </div>

        {/* Sort Order */}
        <div className="flex items-center gap-1 shrink-0">
          {editingSortOrder ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                type="number"
                value={sortOrderValue}
                onChange={(e) => setSortOrderValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveSortOrder();
                  if (e.key === "Escape") {
                    setSortOrderValue(String(item.sortOrder));
                    setEditingSortOrder(false);
                  }
                }}
                className="w-14 px-2 py-1 text-[12px] border border-accent rounded-lg text-primary bg-neutral-light focus:outline-none text-center"
                min={0}
              />
              {savingSortOrder ? (
                <Loader2 size={13} className="animate-spin text-accent" />
              ) : (
                <>
                  <button onClick={handleSaveSortOrder} className="w-6 h-6 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 cursor-pointer">
                    <Check size={12} />
                  </button>
                  <button
                    onClick={() => {
                      setSortOrderValue(String(item.sortOrder));
                      setEditingSortOrder(false);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active cursor-pointer"
                  >
                    <X size={12} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <button
              onClick={() => setEditingSortOrder(true)}
              title="Chỉnh thứ tự"
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-semibold text-primary hover:bg-neutral-light-active opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
            >
              <Pencil size={11} />
              {item.sortOrder}
            </button>
          )}
        </div>

        {/* Toggle Required */}
        <button
          onClick={handleToggleRequired}
          disabled={updatingRequired}
          title={item.isRequired ? "Bỏ bắt buộc" : "Đặt bắt buộc"}
          className={`w-7 h-7 flex items-center justify-center rounded-lg text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50 ${
            item.isRequired ? "bg-promotion/10 text-promotion hover:bg-promotion/20" : "text-neutral-dark hover:bg-neutral-light-active opacity-0 group-hover:opacity-100"
          }`}
        >
          {updatingRequired ? <Loader2 size={12} className="animate-spin" /> : "!"}
        </button>

        {/* Remove — now opens confirm modal */}
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={removing}
          title="Xoá khỏi danh mục"
          className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer disabled:opacity-50 opacity-0 group-hover:opacity-100"
        >
          {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={13} />}
        </button>
      </div>

      {/* Confirm Modal */}
      {confirmOpen && <ConfirmRemoveModal specName={spec.name} removing={removing} onConfirm={handleConfirmRemove} onCancel={() => setConfirmOpen(false)} />}
    </>
  );
}

// ── Group Card ────────────────────────────────────────────────────────────────
export function SpecGroupCard({ groupName, items, onUpdate, onRemove }: SpecGroupCardProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden">
      {/* Group header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-light-active border-b border-neutral hover:bg-neutral-light-active/80 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-primary uppercase tracking-wider">{groupName}</span>
          <span className="text-[11px] px-2 py-0.5 rounded-md bg-neutral text-neutral-dark font-medium">{items.length} thông số</span>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-neutral-dark" /> : <ChevronUp size={14} className="text-neutral-dark" />}
      </button>

      {/* Items */}
      {!collapsed && (
        <div className="divide-y divide-neutral/50">
          {items.map((item) => (
            <ItemRow key={item.specificationId} item={item} onUpdate={onUpdate} onRemove={onRemove} />
          ))}
        </div>
      )}
    </div>
  );
}
