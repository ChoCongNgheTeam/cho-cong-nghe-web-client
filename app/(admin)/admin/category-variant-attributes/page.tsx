"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, RefreshCw, Link2, Loader2, XCircle, X } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import AdminPagination from "@/components/admin/PaginationAdmin";
import { StatsCard } from "@/components/admin/StatsCard";
import type { CategoryWithAttributes, AttributeSimple } from "./category-variant-attribute.types";
import { getAllCategoryAttributes, getAttributeOptions, updateCategoryAttributes } from "./_libs/category-variant-attributes";
import { getCategoryAttributeColumns } from "./components/TableCategoryAttributes";
import { CategoryAttributeForm } from "./components/CategoryAttributeForm";
import { toast } from "sonner";

export default function CategoryVariantAttributesPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState<CategoryWithAttributes[]>([]);
  const [allAttributes, setAllAttributes] = useState<AttributeSimple[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "linked" | "unlinked">("ALL");

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const resetPage = useCallback(() => setPage(1), []);

  // ── Slide-over ────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CategoryWithAttributes | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, attrRes] = await Promise.all([getAllCategoryAttributes(), getAttributeOptions()]);
      setCategories(catRes.data);
      setAllAttributes(attrRes.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Client-side filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = categories;

    if (filterTab === "linked") list = list.filter((c) => c.attributes.length > 0);
    if (filterTab === "unlinked") list = list.filter((c) => c.attributes.length === 0);

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }

    return list;
  }, [categories, filterTab, search]);

  // stats
  const linkedCount = categories.filter((c) => c.attributes.length > 0).length;
  const unlinkedCount = categories.filter((c) => c.attributes.length === 0).length;

  // pagination derived
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const hasActiveFilters = search || filterTab !== "ALL";

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setFilterTab("ALL");
    resetPage();
  }, [resetPage]);

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleEditClick = useCallback((cat: CategoryWithAttributes) => {
    setEditTarget(cat);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (attributeIds: string[]) => {
      if (!editTarget) return;

      setFormSaving(true);
      setFormError(null);

      try {
        const res = await updateCategoryAttributes(editTarget.id, attributeIds);

        // Cập nhật lại danh sách
        setCategories((prev) => prev.map((c) => (c.id === editTarget.id ? res.data : c)));
        setEditTarget(res.data);

        // Đóng form và hiển thị toast thành công
        setFormOpen(false);
      } catch (e: any) {
        const errorMsg = e?.message ?? "Có lỗi xảy ra khi cập nhật";
        setFormError(errorMsg);

        toast.error("Cập nhật thất bại", {
          description: errorMsg,
        });
      } finally {
        setFormSaving(false);
      }
    },
    [editTarget],
  );

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useCallback(() => getCategoryAttributeColumns({ onEditClick: handleEditClick }), [handleEditClick]);

  const TABS = [
    { value: "ALL", label: "Tất cả", count: categories.length },
    { value: "linked", label: "Đã liên kết", count: linkedCount },
    { value: "unlinked", label: "Chưa liên kết", count: unlinkedCount },
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Link2 size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Danh mục & Thuộc tính</h1>
            <p className="text-[12px] text-primary">Liên kết danh mục với thuộc tính biến thể sản phẩm</p>
          </div>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatsCard label="Tổng danh mục" value={categories.length} sub="Tất cả categories" icon={<Link2 size={16} />} />
        <StatsCard label="Đã liên kết" value={linkedCount} sub="Có thuộc tính biến thể" icon={<Link2 size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
        <StatsCard label="Chưa liên kết" value={unlinkedCount} sub="Chưa có thuộc tính" icon={<Link2 size={16} />} valueClassName="text-orange-500" iconClassName="text-orange-500" />
      </div>

      {/* Main card */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          {TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setFilterTab(tab.value as any);
                resetPage();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                filterTab === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
              }`}
            >
              {tab.label}
              <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${filterTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-primary"}`}>{tab.count}</span>
            </button>
          ))}

          <div className="w-px h-5 bg-neutral mx-1" />

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  resetPage();
                }
              }}
              placeholder="Tìm tên hoặc slug..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-primary">{filtered.length} danh mục</span>
        </div>

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Link2 size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có dữ liệu"}</p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            )}
          </div>
        ) : (
          <AdminTable columns={columns()} data={paginated} />
        )}

        {/* Pagination */}
        {!loading && !error && total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-primary">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  resetPage();
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-primary">/ {total} danh mục</span>
            </div>
            <AdminPagination
              currentPage={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
              pageSizeOptions={[10, 20, 50]}
              siblingCount={1}
            />
          </div>
        )}
      </div>

      {/* Slide-over */}
      {formOpen && editTarget && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !formSaving && setFormOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-neutral-light shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Link2 size={15} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-primary">Chỉnh sửa liên kết</h2>
                  <p className="text-[11px] text-primary font-mono">{editTarget.slug}</p>
                </div>
              </div>
              <button
                onClick={() => !formSaving && setFormOpen(false)}
                disabled={formSaving}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <CategoryAttributeForm
                category={editTarget}
                allAttributes={allAttributes}
                saving={formSaving}
                error={formError}
                onSubmit={handleFormSubmit}
                onCancel={() => !formSaving && setFormOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
