"use client";

import { useState, useMemo } from "react";
import { Loader2, AlertCircle, Search, X, Check } from "lucide-react";
import { CategoryWithAttributes, AttributeSimple } from "../category-variant-attribute.types";

interface CategoryAttributeFormProps {
  category: CategoryWithAttributes;
  allAttributes: AttributeSimple[];
  saving: boolean;
  error: string | null;
  onSubmit: (attributeIds: string[]) => Promise<void>;
  onCancel: () => void;
}

export function CategoryAttributeForm({ category, allAttributes, saving, error, onSubmit, onCancel }: CategoryAttributeFormProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(category.attributes.map((a) => a.id)));
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return allAttributes;
    return allAttributes.filter((a) => a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
  }, [allAttributes, search]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(Array.from(selected));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Category info */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-4 space-y-1">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh mục đang chỉnh sửa</p>
        <p className="text-[14px] font-semibold text-primary">{category.name}</p>
        <p className="text-[11px] font-mono text-neutral-dark bg-neutral-light-active inline-block px-2 py-0.5 rounded">{category.slug}</p>
      </div>

      {/* Attribute picker */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Chọn thuộc tính</p>
          <span className="text-[11px] text-neutral-dark bg-neutral-light-active px-2 py-0.5 rounded-lg">Đã chọn: {selected.size}</span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên hoặc code..."
            className="w-full pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark cursor-pointer">
              <X size={12} />
            </button>
          )}
        </div>

        {/* List */}
        <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <p className="text-[12px] text-neutral-dark/50 italic text-center py-4">Không tìm thấy thuộc tính</p>
          ) : (
            filtered.map((attr) => {
              const isSelected = selected.has(attr.id);
              return (
                <button
                  key={attr.id}
                  type="button"
                  onClick={() => toggle(attr.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all cursor-pointer text-left ${
                    isSelected ? "border-accent bg-accent/5" : "border-neutral bg-neutral-light hover:bg-neutral-light-active"
                  }`}
                >
                  {/* checkbox visual */}
                  <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-accent border-accent" : "border-neutral-dark/30"}`}>
                    {isSelected && <Check size={10} className="text-white" strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-primary block">{attr.name}</span>
                    <span className="text-[11px] font-mono text-neutral-dark">{attr.code}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Quick clear */}
        {selected.size > 0 && (
          <button type="button" onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-promotion transition-colors cursor-pointer">
            Bỏ chọn tất cả
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
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
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>
    </form>
  );
}
