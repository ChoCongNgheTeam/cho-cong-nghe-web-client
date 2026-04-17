"use client";

import { useState, useMemo } from "react";
import { Search, X, Plus, Loader2 } from "lucide-react";
import type { Specification } from "../../specifications/specification.types";
import type { CategorySpecItem } from "../category_specification.types";
import { FILTER_TYPE_LABELS, FILTER_TYPE_COLORS } from "../../specifications/const";

interface AddSpecModalProps {
  allSpecs: Specification[];
  existingItems: CategorySpecItem[];
  defaultGroup: string;
  onAdd: (payload: { specificationId: string; groupName: string; isRequired: boolean; sortOrder: number }) => Promise<void>;
  onClose: () => void;
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

export function AddSpecModal({ allSpecs, existingItems, defaultGroup, onAdd, onClose }: AddSpecModalProps) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Specification | null>(null);
  const [groupName, setGroupName] = useState(defaultGroup || "Thông số khác");
  const [isRequired, setIsRequired] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingIds = useMemo(() => new Set(existingItems.map((i) => i.specificationId)), [existingItems]);

  const filtered = useMemo(() => {
    return allSpecs.filter((s) => !existingIds.has(s.id) && (s.name.toLowerCase().includes(search.toLowerCase()) || s.key.toLowerCase().includes(search.toLowerCase())));
  }, [allSpecs, existingIds, search]);

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await onAdd({
        specificationId: selected.id,
        groupName: groupName.trim() || "Thông số khác",
        isRequired,
        sortOrder: Number(sortOrder),
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-light rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                <Plus size={14} />
              </div>
              <h2 className="text-[14px] font-bold text-primary">Thêm thông số vào danh mục</h2>
            </div>
            <button
              onClick={onClose}
              disabled={saving}
              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
            {error && <div className="px-3 py-2 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[12px]">{error}</div>}

            {/* Step 1: Chọn thông số */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">1. Chọn thông số</p>

              {selected ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-accent/5 border border-accent/30">
                  {selected.icon && <span className="text-base">{selected.icon}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-primary">{selected.name}</p>
                    <p className="text-[11px] text-neutral-dark font-mono">{selected.key}</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-neutral-dark hover:text-primary cursor-pointer">
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm thông số..."
                      className="pl-8 pr-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent w-full placeholder:text-neutral-dark/50"
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-neutral rounded-xl divide-y divide-neutral">
                    {filtered.length === 0 ? (
                      <p className="py-6 text-center text-[12px] text-neutral-dark">{search ? "Không tìm thấy thông số phù hợp" : "Tất cả thông số đã được thêm"}</p>
                    ) : (
                      filtered.map((spec) => (
                        <button
                          key={spec.id}
                          onClick={() => setSelected(spec)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-neutral-light-active transition-colors cursor-pointer text-left"
                        >
                          {spec.icon && <span className="text-base shrink-0">{spec.icon}</span>}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[13px] font-medium text-primary">{spec.name}</span>
                              {spec.isFilterable && spec.filterType && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${FILTER_TYPE_COLORS[spec.filterType] ?? ""}`}>{FILTER_TYPE_LABELS[spec.filterType]}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-neutral-dark font-mono">
                              {spec.key}
                              {spec.unit ? ` · ${spec.unit}` : ""}
                            </p>
                          </div>
                          <span className="text-[11px] text-neutral-dark/60 shrink-0">{spec.group}</span>
                        </button>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Step 2: Cài đặt */}
            {selected && (
              <div className="space-y-3">
                <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">2. Cài đặt trong danh mục</p>

                <div className="space-y-1.5">
                  <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Nhóm</label>
                  <input value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Thông số khác" className={inputCls} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Thứ tự</label>
                    <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} min={0} className={inputCls} />
                  </div>

                  <label className="flex items-start gap-2.5 p-3 rounded-xl border border-neutral hover:bg-neutral-light-active transition-colors cursor-pointer self-end">
                    <input type="checkbox" checked={isRequired} onChange={(e) => setIsRequired(e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
                    <div>
                      <p className="text-[13px] font-medium text-primary">Bắt buộc</p>
                      <p className="text-[11px] text-neutral-dark">Yêu cầu khi tạo SP</p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-neutral flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
            <button
              onClick={handleAdd}
              disabled={!selected || saving}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              {saving && <Loader2 size={13} className="animate-spin" />}
              {saving ? "Đang thêm..." : "Thêm vào danh mục"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
