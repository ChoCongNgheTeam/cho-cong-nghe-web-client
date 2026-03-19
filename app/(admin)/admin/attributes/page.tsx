"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Plus, RefreshCw, Tag, Loader2, XCircle, X, Layers, CheckCircle2 } from "lucide-react";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import type { Attribute, CreateOptionPayload, UpdateOptionPayload } from "./attribute.types";
import { getAllAttributes, toggleAttributeActive, createAttribute, updateAttribute, createOption, updateOption, getAttribute } from "./_libs/attributes";
import { SORT_OPTIONS, STATUS_TABS } from "./const/index";
import { getAttributeColumns } from "./components/TableAttributes";
import { AttributeForm, DEFAULT_FORM, attrToForm, formToCreatePayload, formToUpdatePayload, type AttributeFormData } from "./components/AttributeForm";
import { StatsCard } from "@/components/admin/StatsCard";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  activeCounts: { ALL: number; ACTIVE: number; INACTIVE: number };
}

export default function AttributesPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [attrs, setAttrs] = useState<Attribute[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1, activeCounts: { ALL: 0, ACTIVE: 0, INACTIVE: 0 } });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"createdAt" | "name" | "code">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Slide-over ────────────────────────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Attribute | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // ── Fetch (server-side filter/sort/pagination) ────────────────────────────────
  const fetchAttrs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isActiveParam = activeTab === "ACTIVE" ? true : activeTab === "INACTIVE" ? false : undefined;
      const res = await getAllAttributes({
        page,
        limit: pageSize,
        search: search || undefined,
        isActive: isActiveParam,
        sortBy,
        sortOrder,
      });
      setAttrs(res.data);
      setMeta(res.meta as Meta);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải danh sách thuộc tính");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, activeTab, sortBy, sortOrder]);

  useEffect(() => {
    fetchAttrs();
  }, [fetchAttrs]);

  // Reset page khi filter thay đổi
  const resetPage = useCallback(() => setPage(1), []);

  const hasActiveFilters = search || activeTab !== "ALL";

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setPage(1);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const toggleOne = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) => (prev.size === attrs.length ? new Set() : new Set(attrs.map((a) => a.id))));
  }, [attrs]);

  // ── Toggle active ─────────────────────────────────────────────────────────────
  const handleToggleActive = useCallback(
    async (attr: Attribute) => {
      try {
        const res = await toggleAttributeActive(attr.id);
        setAttrs((prev) => prev.map((a) => (a.id === attr.id ? res.data : a)));
        // Refresh meta counts
        fetchAttrs();
      } catch (e: any) {
        alert(e?.message ?? "Không thể cập nhật trạng thái");
      }
    },
    [fetchAttrs],
  );

  // ── Form handlers ─────────────────────────────────────────────────────────────
  const handleOpenCreate = useCallback(() => {
    setEditTarget(null);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleEditClick = useCallback((attr: Attribute) => {
    setEditTarget(attr);
    setFormError(null);
    setFormOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (form: AttributeFormData) => {
      setFormSaving(true);
      setFormError(null);
      try {
        if (editTarget) {
          const payload = formToUpdatePayload(form);
          const res = await updateAttribute(editTarget.id, payload);
          setAttrs((prev) => prev.map((a) => (a.id === editTarget.id ? res.data : a)));
          setEditTarget(res.data);
        } else {
          const payload = formToCreatePayload(form);
          await createAttribute(payload);
          setFormOpen(false);
          fetchAttrs();
        }
      } catch (e: any) {
        setFormError(e?.message ?? "Có lỗi xảy ra");
      } finally {
        setFormSaving(false);
      }
    },
    [editTarget, fetchAttrs],
  );

  // ── Option handlers ───────────────────────────────────────────────────────────
  const handleAddOption = useCallback(
    async (payload: CreateOptionPayload) => {
      if (!editTarget) return;
      await createOption(editTarget.id, payload);
      const updated = await getAttribute(editTarget.id);
      setAttrs((prev) => prev.map((a) => (a.id === editTarget.id ? updated.data : a)));
      setEditTarget(updated.data);
    },
    [editTarget],
  );

  const handleUpdateOption = useCallback(
    async (optionId: string, payload: UpdateOptionPayload) => {
      if (!editTarget) return;
      await updateOption(editTarget.id, optionId, payload);
      const updated = await getAttribute(editTarget.id);
      setAttrs((prev) => prev.map((a) => (a.id === editTarget.id ? updated.data : a)));
      setEditTarget(updated.data);
    },
    [editTarget],
  );

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = useCallback(
    () =>
      getAttributeColumns({
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
            <Tag size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Thuộc tính sản phẩm</h1>
            <p className="text-[12px] text-neutral-dark">Quản lý thuộc tính và danh sách giá trị (options)</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAttrs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm thuộc tính
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Tổng thuộc tính" value={meta.activeCounts.ALL} sub="Tất cả attributes" icon={<Tag size={16} />} />
        <StatsCard
          label="Đang hoạt động"
          value={meta.activeCounts.ACTIVE}
          sub="Khách hàng có thể xem được"
          icon={<CheckCircle2 size={18} />}
          valueClassName="text-emerald-600"
          iconClassName="text-emerald-600"
        />
        <StatsCard label="Không hoạt động" value={meta.activeCounts.INACTIVE} sub="Đang bị ẩn" icon={<XCircle size={16} />} valueClassName="text-neutral-dark" iconClassName="text-neutral-dark" />
        <StatsCard
          label="Tổng Options"
          value={attrs.reduce((s, a) => s + a.options.length, 0)}
          sub="Tổng số lựa chọn"
          icon={<Layers size={16} />}
          valueClassName="text-blue-600"
          iconClassName="text-blue-600"
        />
      </div>

      {/* ── Main card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* ── Toolbar: 1 row ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {/* Status tabs */}
          {STATUS_TABS.map((tab) => {
            const count = tab.value === "ALL" ? meta.activeCounts.ALL : tab.value === "ACTIVE" ? meta.activeCounts.ACTIVE : meta.activeCounts.INACTIVE;
            return (
              <button
                key={tab.value}
                onClick={() => {
                  setActiveTab(tab.value);
                  resetPage();
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                  activeTab === tab.value ? "bg-accent text-white" : "text-neutral-dark hover:bg-neutral-light-active"
                }`}
              >
                {tab.label}
                <span className={`text-[11px] px-1.5 py-0.5 rounded-md font-semibold ${activeTab === tab.value ? "bg-white/20 text-white" : "bg-neutral-light-active text-neutral-dark"}`}>
                  {count}
                </span>
              </button>
            );
          })}

          <div className="w-px h-5 bg-neutral mx-1" />

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setSearch(searchInput);
                  resetPage();
                }
              }}
              placeholder="Tìm tên hoặc code..."
              className="pl-9 pr-8 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all w-52"
            />
            {searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                  setSearch("");
                  resetPage();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value as "createdAt" | "name" | "code");
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as "asc" | "desc");
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            <option value="desc">Mới nhất</option>
            <option value="asc">Cũ nhất</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-neutral-dark">{meta.total} thuộc tính</span>
        </div>

        {/* ── Selection bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} thuộc tính</span>
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
            <button onClick={fetchAttrs} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : attrs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có thuộc tính nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Thêm thuộc tính đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable columns={columns()} data={attrs} selectable selectedIds={selected} onToggleAll={toggleAll} />
        )}

        {/* ── Pagination ── */}
        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-neutral-dark">Hiển thị</span>
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
              <span className="text-[12px] text-neutral-dark">/ {meta.total} thuộc tính</span>
            </div>
            <AdminPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
              pageSize={meta.limit}
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

      {/* ── Slide-over: Create / Edit ── */}
      {formOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => !formSaving && setFormOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-full max-w-lg bg-neutral-light shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                  <Tag size={15} />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-primary">{editTarget ? "Chỉnh sửa thuộc tính" : "Thêm thuộc tính mới"}</h2>
                  {editTarget && <p className="text-[11px] text-neutral-dark font-mono">{editTarget.code}</p>}
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
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <AttributeForm
                initialData={editTarget ? attrToForm(editTarget) : DEFAULT_FORM}
                isEdit={!!editTarget}
                attribute={editTarget ?? undefined}
                onSubmit={handleFormSubmit}
                onAddOption={editTarget ? handleAddOption : undefined}
                onUpdateOption={editTarget ? handleUpdateOption : undefined}
                saving={formSaving}
                error={formError}
                submitLabel={editTarget ? "Lưu thay đổi" : "Tạo thuộc tính"}
                onCancel={() => !formSaving && setFormOpen(false)}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
