"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Layers, ChevronDown, Plus, RefreshCw, Loader2, XCircle, PackageSearch, Info } from "lucide-react";
import type { CategorySpecItem, SpecGroup } from "./category_specification.types";
import type { Specification } from "../specifications/specification.types";
import { getActiveCategories, getCategorySpecs, upsertCategorySpec, removeCategorySpec, type CategoryOption } from "./_libs/category_specifications";
import { getAllSpecifications } from "../specifications/_libs/specifications";
import { AddSpecModal } from "./components/AddSpecModal";
import { SpecGroupCard } from "./components/SpecGroupCard";

// ── helpers ───────────────────────────────────────────────────────────────────
function groupItems(items: CategorySpecItem[]): SpecGroup[] {
  const map = new Map<string, CategorySpecItem[]>();
  for (const item of items) {
    const g = item.groupName || "Thông số khác";
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return Array.from(map.entries()).map(([groupName, its]) => ({
    groupName,
    items: its.sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CategorySpecificationsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [allSpecs, setAllSpecs] = useState<Specification[]>([]);
  const [items, setItems] = useState<CategorySpecItem[]>([]);
  const [categoryName, setCategoryName] = useState("");

  // ── UI State ──────────────────────────────────────────────────────────────
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingSpecs, setLoadingSpecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [catSearch, setCatSearch] = useState("");

  // ── Load categories + all active specs once ────────────────────────────────
  useEffect(() => {
    const init = async () => {
      setLoadingCategories(true);
      try {
        const [catRes, specRes] = await Promise.all([getActiveCategories(), getAllSpecifications({ limit: 500, isActive: true })]);
        setCategories(catRes.data ?? []);
        setAllSpecs(specRes.data ?? []);
      } catch {
        setError("Không thể tải dữ liệu khởi động");
      } finally {
        setLoadingCategories(false);
      }
    };
    init();
  }, []);

  // ── Load specs for selected category ──────────────────────────────────────
  const fetchCategorySpecs = useCallback(async (categoryId: string) => {
    if (!categoryId) return;
    setLoadingSpecs(true);
    setError(null);
    try {
      const res = await getCategorySpecs(categoryId);
      setItems(res.data.items);
      setCategoryName(res.data.category.name);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải thông số danh mục");
    } finally {
      setLoadingSpecs(false);
    }
  }, []);

  useEffect(() => {
    if (selectedCategoryId) fetchCategorySpecs(selectedCategoryId);
    else setItems([]);
  }, [selectedCategoryId, fetchCategorySpecs]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const groups = useMemo(() => groupItems(items), [items]);

  const filteredCategories = useMemo(() => categories.filter((c) => c.name.toLowerCase().includes(catSearch.toLowerCase())), [categories, catSearch]);

  const selectedCategory = useMemo(() => categories.find((c) => c.id === selectedCategoryId), [categories, selectedCategoryId]);

  // Suggest the most common groupName in this category as default
  const defaultGroupName = useMemo(() => {
    if (groups.length === 0) return "Thông số khác";
    const freq = new Map<string, number>();
    for (const g of groups) freq.set(g.groupName, (freq.get(g.groupName) ?? 0) + g.items.length);
    return [...freq.entries()].sort((a, b) => b[1] - a[1])[0][0];
  }, [groups]);

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleUpdate = useCallback(
    async (
      specificationId: string,
      changes: Partial<{
        groupName: string;
        isRequired: boolean;
        sortOrder: number;
      }>,
    ) => {
      const existing = items.find((i) => i.specificationId === specificationId)!;
      const payload = {
        specificationId,
        groupName: changes.groupName ?? existing.groupName,
        isRequired: changes.isRequired ?? existing.isRequired,
        sortOrder: changes.sortOrder ?? existing.sortOrder,
      };
      const res = await upsertCategorySpec(selectedCategoryId, payload);
      setItems((prev) => prev.map((i) => (i.specificationId === specificationId ? res.data : i)));
    },
    [items, selectedCategoryId],
  );

  const handleRemove = useCallback(
    async (specificationId: string) => {
      await removeCategorySpec(selectedCategoryId, specificationId);
      setItems((prev) => prev.filter((i) => i.specificationId !== specificationId));
    },
    [selectedCategoryId],
  );

  const handleAdd = useCallback(
    async (payload: { specificationId: string; groupName: string; isRequired: boolean; sortOrder: number }) => {
      const res = await upsertCategorySpec(selectedCategoryId, payload);
      setItems((prev) => {
        const exists = prev.find((i) => i.specificationId === payload.specificationId);
        if (exists) return prev.map((i) => (i.specificationId === payload.specificationId ? res.data : i));
        return [...prev, res.data];
      });
    },
    [selectedCategoryId],
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap border-b border-neutral">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Layers size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Thông số theo danh mục</h1>
            <p className="text-[13px] text-neutral-dark">Gắn và cấu hình thông số kỹ thuật cho từng danh mục sản phẩm</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedCategoryId && (
            <button
              onClick={() => fetchCategorySpecs(selectedCategoryId)}
              disabled={loadingSpecs}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-neutral text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loadingSpecs ? "animate-spin" : ""} />
            </button>
          )}

          {selectedCategoryId && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
              <Plus size={14} />
              Thêm thông số
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-6 space-y-5 max-w-4xl mx-auto">
        {/* ── Category Selector ── */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Chọn danh mục</label>

          {loadingCategories ? (
            <div className="flex items-center gap-2 px-4 py-3 border border-neutral rounded-xl text-[13px] text-neutral-dark">
              <Loader2 size={14} className="animate-spin" />
              Đang tải danh mục...
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setCatDropdownOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 border border-neutral rounded-xl text-[13px] text-primary bg-neutral-light hover:border-accent/50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent/30"
              >
                <span className={selectedCategory ? "text-primary font-medium" : "text-neutral-dark/50"}>{selectedCategory ? selectedCategory.name : "-- Chọn danh mục --"}</span>
                <ChevronDown size={14} className={`text-neutral-dark transition-transform ${catDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {catDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setCatDropdownOpen(false)} />
                  <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-neutral-light border border-neutral rounded-xl shadow-lg overflow-hidden">
                    <div className="p-2 border-b border-neutral">
                      <input
                        autoFocus
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                        placeholder="Tìm danh mục..."
                        className="w-full px-3 py-2 text-[13px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-neutral-dark/50"
                      />
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredCategories.length === 0 ? (
                        <p className="py-4 text-center text-[12px] text-neutral-dark">Không tìm thấy danh mục</p>
                      ) : (
                        filteredCategories.map((cat) => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategoryId(cat.id);
                              setCatDropdownOpen(false);
                              setCatSearch("");
                            }}
                            className={`w-full text-left px-4 py-2.5 text-[13px] hover:bg-neutral-light-active transition-colors cursor-pointer ${
                              cat.id === selectedCategoryId ? "text-accent font-semibold bg-accent/5" : "text-primary"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Info banner khi chưa chọn ── */}
        {!selectedCategoryId && !loadingCategories && (
          <div className="flex items-start gap-3 px-4 py-4 rounded-2xl bg-accent/5 border border-accent/20 text-[13px] text-accent">
            <Info size={16} className="shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold mb-0.5">Chọn danh mục để bắt đầu</p>
              <p className="text-accent/70 text-[12px]">Sau khi chọn danh mục, bạn có thể gắn thông số kỹ thuật, đặt nhóm, thứ tự và yêu cầu bắt buộc cho từng thông số.</p>
            </div>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
            <XCircle size={15} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}

        {/* ── Loading content ── */}
        {selectedCategoryId && loadingSpecs && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        )}

        {/* ── Empty state ── */}
        {selectedCategoryId && !loadingSpecs && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <PackageSearch size={40} className="text-neutral-dark/30" />
            <p className="text-[13px] text-neutral-dark font-medium">
              Danh mục <span className="text-primary font-semibold">{categoryName}</span> chưa có thông số nào
            </p>
            <p className="text-[12px] text-neutral-dark/70">Nhấn "Thêm thông số" để bắt đầu cấu hình</p>
            <button
              onClick={() => setAddModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer mt-1"
            >
              <Plus size={14} />
              Thêm thông số đầu tiên
            </button>
          </div>
        )}

        {/* ── Spec Groups ── */}
        {selectedCategoryId && !loadingSpecs && groups.length > 0 && (
          <div className="space-y-3">
            {/* Summary bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-[12px] text-neutral-dark">
                <span>
                  <span className="font-semibold text-primary">{items.length}</span> thông số
                </span>
                <span>·</span>
                <span>
                  <span className="font-semibold text-primary">{groups.length}</span> nhóm
                </span>
                <span>·</span>
                <span>
                  <span className="font-semibold text-promotion">{items.filter((i) => i.isRequired).length}</span> bắt buộc
                </span>
              </div>
            </div>

            {groups.map((group) => (
              <SpecGroupCard key={group.groupName} groupName={group.groupName} items={group.items} onUpdate={handleUpdate} onRemove={handleRemove} />
            ))}
          </div>
        )}
      </div>

      {/* ── Add Modal ── */}
      {addModalOpen && <AddSpecModal allSpecs={allSpecs} existingItems={items} defaultGroup={defaultGroupName} onAdd={handleAdd} onClose={() => setAddModalOpen(false)} />}
    </div>
  );
}
