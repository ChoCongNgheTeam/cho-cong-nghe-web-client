"use client";

import { useState, useCallback } from "react";
import { Sparkles, Loader2, Check, X, Info, AlertCircle, ChevronDown, ChevronUp, Wand2 } from "lucide-react";
import apiRequest from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────

interface SpecItem {
  id: string; // specificationId
  name: string;
  group: string;
  unit?: string | null;
}

interface SpecGrouped {
  groupName: string;
  items: SpecItem[];
}

interface SpecForm {
  specificationId: string;
  value: string;
  isHighlight: boolean;
  enabled: boolean;
}

interface SuggestionResult {
  specificationId: string;
  name: string;
  group: string;
  unit?: string | null;
  suggestedValue: string;
  currentValue: string;
  isNew: boolean; // true = field đang trống, false = sẽ ghi đè
}

interface AiSpecSuggestButtonProps {
  productName: string;
  categoryId: string;
  // Danh sách spec groups từ template (để biết field nào cần fill)
  specGroups: SpecGrouped[];
  // Current spec values
  specs: SpecForm[];
  // Callback khi user xác nhận apply
  onApply: (updates: Record<string, string>) => void;
}

// ─── Utils ───────────────────────────────────────────────────

const scoreColor = (count: number, total: number) => {
  const pct = total > 0 ? count / total : 0;
  if (pct >= 0.7) return "text-emerald-600";
  if (pct >= 0.4) return "text-yellow-600";
  return "text-neutral-dark";
};

// ─── Preview Modal ───────────────────────────────────────────

function PreviewModal({
  suggestions,
  productName,
  onConfirm,
  onCancel,
}: {
  suggestions: SuggestionResult[];
  productName: string;
  onConfirm: (selected: Record<string, string>) => void;
  onCancel: () => void;
}) {
  // Mặc định check tất cả field mới (trống), uncheck field sẽ ghi đè
  const [selected, setSelected] = useState<Set<string>>(new Set(suggestions.filter((s) => s.isNew).map((s) => s.specificationId)));

  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = (v: boolean) => setSelected(v ? new Set(suggestions.map((s) => s.specificationId)) : new Set());

  const grouped = suggestions.reduce<Record<string, SuggestionResult[]>>((acc, s) => {
    if (!acc[s.group]) acc[s.group] = [];
    acc[s.group].push(s);
    return acc;
  }, {});

  const handleConfirm = () => {
    const updates: Record<string, string> = {};
    for (const s of suggestions) {
      if (selected.has(s.specificationId)) {
        updates[s.specificationId] = s.suggestedValue;
      }
    }
    onConfirm(updates);
  };

  const newCount = suggestions.filter((s) => s.isNew).length;
  const overwriteCount = suggestions.filter((s) => !s.isNew).length;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-primary-dark/50 backdrop-blur-sm">
      <div className="bg-neutral-light rounded-2xl border border-neutral shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <Sparkles size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-primary">AI gợi ý thông số</p>
              <p className="text-[10px] text-neutral-dark truncate max-w-[220px]">{productName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 px-5 py-2.5 bg-neutral-light-active border-b border-neutral shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {newCount} điền mới
          </div>
          {overwriteCount > 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 rounded-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
              {overwriteCount} ghi đè
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-neutral-dark">
              {selected.size}/{suggestions.length} đã chọn
            </span>
            <button type="button" onClick={() => toggleAll(selected.size < suggestions.length)} className="text-[10px] font-medium text-accent hover:underline cursor-pointer">
              {selected.size < suggestions.length ? "Chọn tất cả" : "Bỏ hết"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-bold text-neutral-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                {group}
                <span className="h-px flex-1 bg-neutral" />
              </p>
              <div className="space-y-1.5">
                {items.map((s) => {
                  const isSelected = selected.has(s.specificationId);
                  return (
                    <label
                      key={s.specificationId}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                        ${isSelected ? (s.isNew ? "border-emerald-200 bg-emerald-50/50" : "border-yellow-200 bg-yellow-50/50") : "border-neutral bg-neutral-light-active/40 opacity-60"}`}
                    >
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(s.specificationId)} className="mt-0.5 w-3.5 h-3.5 accent-accent cursor-pointer shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-semibold text-primary">{s.name}</span>
                          {s.unit && <span className="text-[10px] text-neutral-dark">({s.unit})</span>}
                          {!s.isNew && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200 font-medium">ghi đè</span>}
                        </div>
                        <div className="mt-1 flex items-center gap-1.5">
                          {!s.isNew && (
                            <>
                              <span className="text-[11px] text-neutral-dark line-through">{s.currentValue}</span>
                              <span className="text-[10px] text-neutral-dark">→</span>
                            </>
                          )}
                          <span className={`text-[12px] font-medium ${isSelected ? "text-primary" : "text-neutral-dark"}`}>{s.suggestedValue}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 py-4 border-t border-neutral shrink-0">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-[13px] font-semibold text-white transition-colors cursor-pointer"
          >
            <Check size={13} />
            Áp dụng {selected.size} thông số
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function AiSpecSuggestButton({ productName, categoryId, specGroups, specs, onApply }: AiSpecSuggestButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestionResult[] | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Flatten tất cả spec items từ groups
  const allSpecItems = specGroups.flatMap((g) => g.items.map((item) => ({ ...item, group: g.groupName })));

  // Chỉ fill field trống (onlyEmpty = true theo default)
  const emptySpecItems = allSpecItems.filter((item) => {
    const current = specs.find((s) => s.specificationId === item.id);
    return !current?.value?.trim();
  });

  const canSuggest = !!productName.trim() && !!categoryId && allSpecItems.length > 0;

  const handleSuggest = useCallback(async () => {
    if (!canSuggest) return;
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const specsToFill = emptySpecItems.length > 0 ? emptySpecItems : allSpecItems;

      const res = await apiRequest.post<{
        data: { suggestions: Record<string, string | null>; filledCount: number };
      }>(
        "/ai-content/suggest-specifications",
        {
          productName: productName.trim(),
          categoryId,
          specifications: specsToFill.map((s) => ({
            specificationId: s.id,
            name: s.name,
            group: s.group,
            unit: s.unit,
          })),
          onlyEmpty: true,
        },
        { timeout: 60_000 },
      );

      const raw = (res as any)?.data?.suggestions ?? {};

      // Build SuggestionResult array — chỉ include field có giá trị (not null)
      const results: SuggestionResult[] = [];
      for (const item of specsToFill) {
        const suggested = raw[item.id];
        if (suggested) {
          const currentSpec = specs.find((s) => s.specificationId === item.id);
          results.push({
            specificationId: item.id,
            name: item.name,
            group: item.group,
            suggestedValue: suggested,
            currentValue: currentSpec?.value ?? "",
            isNew: !currentSpec?.value?.trim(),
          });
        }
      }

      if (results.length === 0) {
        setError("AI không gợi ý được thông số nào từ tên sản phẩm này. Thử thêm thông tin vào tên sản phẩm.");
        return;
      }

      setSuggestions(results);
      setShowPreview(true);
    } catch (e: any) {
      setError(e?.message ?? "Không thể gợi ý thông số. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }, [canSuggest, productName, categoryId, allSpecItems, emptySpecItems, specs]);

  const handleConfirmApply = (updates: Record<string, string>) => {
    onApply(updates);
    setShowPreview(false);
    setSuggestions(null);
  };

  if (!canSuggest) return null;

  const emptyCount = emptySpecItems.length;

  return (
    <>
      {/* Inline button + error — đặt ngay trên section thông số */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={handleSuggest}
          disabled={loading}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border text-[12px] font-medium
            transition-all cursor-pointer
            ${loading ? "border-accent/30 bg-accent/5 text-accent/60 cursor-not-allowed" : "border-accent/40 bg-accent/5 text-accent hover:bg-accent/10 hover:border-accent/60 active:scale-[0.98]"}`}
        >
          {loading ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              AI đang phân tích...
            </>
          ) : (
            <>
              <Wand2 size={12} />
              AI gợi ý thông số
              {emptyCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-accent/15 text-[10px] font-semibold">{emptyCount} trống</span>}
            </>
          )}
        </button>

        {suggestions && !showPreview && (
          <button type="button" onClick={() => setShowPreview(true)} className="inline-flex items-center gap-1.5 text-[11px] text-accent hover:underline cursor-pointer">
            <Check size={11} className="text-emerald-500" />
            Đã có {suggestions.length} gợi ý — xem lại
          </button>
        )}

        {error && (
          <div className="flex items-center gap-1.5 text-[11px] text-promotion">
            <AlertCircle size={11} />
            {error}
          </div>
        )}

        {!productName.trim() && (
          <div className="flex items-center gap-1.5 text-[11px] text-neutral-dark">
            <Info size={11} />
            Nhập tên sản phẩm để AI gợi ý thông số
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && suggestions && <PreviewModal suggestions={suggestions} productName={productName} onConfirm={handleConfirmApply} onCancel={() => setShowPreview(false)} />}
    </>
  );
}
