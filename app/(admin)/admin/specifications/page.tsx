"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Search, Plus, RefreshCw, SlidersHorizontal, Loader2, XCircle, Filter, ChevronDown, ChevronUp, X } from "lucide-react";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { Popzy } from "@/components/Modal";
import type { Specification } from "./specification.types";
import { getAllSpecifications, toggleSpecificationActive, createSpecification, updateSpecification } from "./_libs/specifications";
import { SORT_OPTIONS, STATUS_TABS, FILTERABLE_TABS } from "./const";
import { StatsCard } from "@/(admin)/admin/promotions/components/StatsCard";
import { getSpecificationColumns } from "./components/TableSpecifications";
import { SpecificationForm, DEFAULT_FORM, specToForm, formToCreatePayload, formToUpdatePayload, type SpecificationFormData } from "./components/SpecificationForm";

export default function SpecificationsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [allSpecs, setAllSpecs] = useState<Specification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Filters / Toolbar ─────────────────────────────────────────────────────────
  const [activeStatusTab, setActiveStatusTab] = useState("ALL");
  const [activeFilterableTab, setActiveFilterableTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<string>("sortOrder");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [groupFilter, setGroupFilter] = useState("");

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Slide-over form ───────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Specification | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchSpecs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSpecifications({ limit: 500 });
      setAllSpecs(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách thông số");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecs();
  }, [fetchSpecs]);

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const groups = new Set(allSpecs.map((s) => s.group));
    return {
      total: allSpecs.length,
      active: allSpecs.filter((s) => s.isActive).length,
      filterable: allSpecs.filter((s) => s.isFilterable).length,
      required: allSpecs.filter((s) => s.isRequired).length,
      groups: groups.size,
    };
  }, [allSpecs]);

  // ── Groups for filter dropdown ────────────────────────────────────────────────
  const groupOptions = useMemo(() => {
    const groups = [...new Set(allSpecs.map((s) => s.group))].sort();
    return groups;
  }, [allSpecs]);

  // ── Client-side filter + sort ─────────────────────────────────────────────────
  const filteredSpecs = useMemo(() => {
    let list = [...allSpecs];

    // Status tab
    if (activeStatusTab === "active") list = list.filter((s) => s.isActive);
    else if (activeStatusTab === "inactive") list = list.filter((s) => !s.isActive);

    // Filterable tab
    if (activeFilterableTab === "filterable") list = list.filter((s) => s.isFilterable);
    else if (activeFilterableTab === "not_filterable") list = list.filter((s) => !s.isFilterable);

    // Group filter
    if (groupFilter) list = list.filter((s) => s.group === groupFilter);

    // Search
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.key.toLowerCase().includes(q) || s.group.toLowerCase().includes(q));
    }

    // Sort
    list.sort((a, b) => {
      let aVal: any = (a as any)[sortBy] ?? "";
      let bVal: any = (b as any)[sortBy] ?? "";
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [allSpecs, activeStatusTab, activeFilterableTab, groupFilter, search, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredSpecs.length / pageSize));
  const paginatedSpecs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSpecs.slice(start, start + pageSize);
  }, [filteredSpecs, page, pageSize]);

  // ── Search submit ──────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setSearch(searchInput);
    setPage(1);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  }, []);

  const hasActiveFilters = search || activeStatusTab !== "ALL" || activeFilterableTab !== "ALL" || groupFilter;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveStatusTab("ALL");
    setActiveFilterableTab("ALL");
    setGroupFilter("");
    setPage(1);
  }, []);

  // ── Selection handlers ────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === paginatedSpecs.length ? new Set() : new Set(paginatedSpecs.map((s) => s.id))));
  }, [paginatedSpecs]);

  // ── Toggle active ──────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(async (spec: Specification) => {
    try {
      const res = await toggleSpecificationActive(spec.id);
      setAllSpecs((prev) => prev.map((s) => (s.id === spec.id ? res.data : s)));
    } catch (e: any) {
      alert(e?.message ?? "Không thể cập nhật trạng thái");
    }
  }, []);

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditTarget(null);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleEditClick = useCallback((spec: Specification) => {
    setEditTarget(spec);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (form: SpecificationFormData) => {
      setFormSaving(true);
      setFormError(null);
      try {
        if (editTarget) {
          const payload = formToUpdatePayload(form);
          const res = await updateSpecification(editTarget.id, payload);
          setAllSpecs((prev) => prev.map((s) => (s.id === editTarget.id ? res.data : s)));
        } else {
          const payload = formToCreatePayload(form);
          const res = await createSpecification(payload);
          setAllSpecs((prev) => [res.data, ...prev]);
        }
        setFormOpen(false);
      } catch (e: any) {
        setFormError(e?.message ?? "Có lỗi xảy ra");
      } finally {
        setFormSaving(false);
      }
    },
    [editTarget],
  );

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useMemo(
    () =>
      getSpecificationColumns({
        page,
        pageSize,
        selected,
        openStatusId,
        toggleOne,
        setOpenStatusId,
        onToggleActive: handleToggleActive,
        onEditClick: handleEditClick,
      }),
    [page, pageSize, selected, openStatusId, toggleOne, handleToggleActive, handleEditClick],
  );

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-neutral-light">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <SlidersHorizontal size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Thông số kỹ thuật</h1>
            <p className="text-[12px] text-neutral-dark">Quản lý các thuộc tính và bộ lọc sản phẩm</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSpecs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm thông số
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-5 gap-3">
        <StatsCard label="Tổng thông số" value={stats.total} icon={<SlidersHorizontal size={16} />} />
        <StatsCard label="Đang hoạt động" value={stats.active} color="text-emerald-600" icon={<span className="text-sm">✓</span>} />
        <StatsCard label="Có thể lọc" value={stats.filterable} color="text-blue-600" icon={<Filter size={16} />} />
        <StatsCard label="Bắt buộc" value={stats.required} color="text-promotion" icon={<span className="text-sm">!</span>} />
        <StatsCard label="Số nhóm" value={stats.groups} color="text-purple-600" icon={<span className="text-sm">#</span>} />
      </div>

      {/* ── Main card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* ── Toolbar ── */}
        <div className="px-5 py-4 space-y-3 border-b border-neutral">
          {/* Row 1: Tabs trạng thái */}
          <div className="flex items-center gap-1 flex-wrap">
            {STATUS_TABS.map((tab) => {
              const count = tab.value === "ALL" ? allSpecs.length : tab.value === "active" ? stats.active : allSpecs.length - stats.active;
              return (
                <button
                  key={tab.value}
                  onClick={() => {
                    setActiveStatusTab(tab.value);
                    setPage(1);
                  }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                    activeStatusTab === tab.value ? "bg-accent text-white" : "text-neutral-dark hover:bg-neutral-light-active"
                  }`}
                >
                  {tab.label}
                  <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${activeStatusTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-neutral-dark"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
            <div className="w-px h-4 bg-neutral mx-1" />
            {FILTERABLE_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveFilterableTab(tab.value);
                  setPage(1);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                  activeFilterableTab === tab.value ? "bg-blue-600 text-white" : "text-neutral-dark hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Row 2: Search + Filter toggle */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Tìm tên, key, nhóm..."
                className="w-full pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
              />
              {searchInput && (
                <button onClick={handleClearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer">
                  <X size={13} />
                </button>
              )}
            </div>
            <button onClick={handleSearch} className="px-3 py-2 bg-accent text-white text-[13px] font-medium rounded-xl hover:bg-accent/90 transition-all cursor-pointer">
              Tìm
            </button>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-[13px] transition-all cursor-pointer ${
                showFilters || groupFilter ? "border-accent text-accent bg-accent/5" : "border-neutral text-neutral-dark hover:bg-neutral-light-active"
              }`}
            >
              <Filter size={14} />
              Bộ lọc
              {showFilters ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAllFilters}
                className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
              >
                <X size={13} /> Xoá lọc
              </button>
            )}

            <span className="ml-auto text-[12px] text-neutral-dark">{filteredSpecs.length} thông số</span>
          </div>

          {/* Row 3: Expanded filters */}
          {showFilters && (
            <div className="pt-2 border-t border-neutral grid grid-cols-2 md:grid-cols-4 gap-3">
              {/* Group filter */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Nhóm</label>
                <select
                  value={groupFilter}
                  onChange={(e) => {
                    setGroupFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  <option value="">Tất cả nhóm</option>
                  {groupOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort by */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Sắp xếp theo</label>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort order */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Thứ tự</label>
                <select
                  value={sortOrder}
                  onChange={(e) => {
                    setSortOrder(e.target.value as "asc" | "desc");
                    setPage(1);
                  }}
                  className="w-full px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
                >
                  <option value="asc">Tăng dần</option>
                  <option value="desc">Giảm dần</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Selection bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} thông số</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-primary cursor-pointer">
              Bỏ chọn
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchSpecs} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : filteredSpecs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <SlidersHorizontal size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có thông số nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Thêm thông số đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable columns={columns} data={paginatedSpecs} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && filteredSpecs.length > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Hiển thị</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none cursor-pointer"
              >
                {[10, 20, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="text-[12px] text-neutral-dark">/ {filteredSpecs.length} thông số</span>
            </div>
            <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* ── Slide-over: Create / Edit Form ── */}
      {formOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !formSaving && setFormOpen(false)} />
          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-neutral-light shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <SlidersHorizontal size={15} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-primary">{editTarget ? "Chỉnh sửa thông số" : "Thêm thông số mới"}</h2>
                  {editTarget && <p className="text-[11px] text-neutral-dark font-mono">{editTarget.key}</p>}
                </div>
              </div>
              <button
                onClick={() => !formSaving && setFormOpen(false)}
                disabled={formSaving}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                <X size={16} />
              </button>
            </div>
            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <SpecificationForm
                initialData={editTarget ? specToForm(editTarget) : DEFAULT_FORM}
                isEdit={!!editTarget}
                onSubmit={handleFormSubmit}
                saving={formSaving}
                error={formError}
                submitLabel={editTarget ? "Lưu thay đổi" : "Tạo thông số"}
                onCancel={() => !formSaving && setFormOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
