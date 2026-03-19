"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Plus, RefreshCw, Tag, Trash2, Upload, X, XCircle, Loader2, CalendarDays, ChevronDown, Star } from "lucide-react";
import { Brand, GetBrandsParams } from "./brand.types";
import { createBrand, deleteBrand, getAllBrands, updateBrand } from "./_libs/brands";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { getBrandColumns } from "./components/TableBrands";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";
import { StatsCard } from "@/components/admin/StatsCard";
import Image from "next/image";

type SortBy = "name" | "createdAt" | "productCount";
type SortOrder = "asc" | "desc";

interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  activeCounts: { ALL: number; ACTIVE: number; INACTIVE: number; FEATURED: number };
}

// ── Date filter popover ────────────────────────────────────────────────────────
function DateFilterPopover({ dateFrom, dateTo, onApply, onClear }: { dateFrom: string; dateTo: string; onApply: (from: string, to: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFrom(dateFrom);
    setTo(dateTo);
  }, [dateFrom, dateTo]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasFilter = !!dateFrom || !!dateTo;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-2 border rounded-xl text-[13px] transition-colors cursor-pointer ${
          hasFilter ? "border-accent bg-accent/5 text-accent font-medium" : "border-neutral bg-neutral-light text-primary hover:bg-neutral-light-active"
        }`}
      >
        <CalendarDays size={14} />
        Ngày tạo
        {hasFilter && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onClear();
              setOpen(false);
            }}
            className="ml-1 hover:text-promotion cursor-pointer"
          >
            <X size={11} />
          </span>
        )}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-neutral-light border border-neutral rounded-xl shadow-lg p-4 w-72 space-y-3">
          <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Lọc theo ngày tạo</p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-neutral-dark block mb-1">Từ ngày</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
            <div>
              <label className="text-[11px] text-neutral-dark block mb-1">Đến ngày</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-2 py-1.5 text-[12px] border border-neutral rounded-lg bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onClear();
                setFrom("");
                setTo("");
                setOpen(false);
              }}
              className="flex-1 px-3 py-1.5 text-[12px] border border-neutral rounded-lg text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
            >
              Xoá lọc
            </button>
            <button
              onClick={() => {
                onApply(from, to);
                setOpen(false);
              }}
              className="flex-1 px-3 py-1.5 text-[12px] bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors cursor-pointer font-medium"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminBrandsPage() {
  // ── Data ──────────────────────────────────────────────────────────────────────
  const [brands, setBrands] = useState<Brand[]>([]);
  const [meta, setMeta] = useState<Meta>({ page: 1, limit: 20, total: 0, totalPages: 1, activeCounts: { ALL: 0, ACTIVE: 0, INACTIVE: 0, FEATURED: 0 } });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Filters ───────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // ── Modals ────────────────────────────────────────────────────────────────────
  const deleteModal = usePopzy();
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const createModal = usePopzy();
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIsActive, setNewIsActive] = useState(true);
  const [newIsFeatured, setNewIsFeatured] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newPreviewUrl, setNewPreviewUrl] = useState<string | null>(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────────
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetBrandsParams = {
        page,
        limit: pageSize,
        ...(search ? { search } : {}),
        ...(activeTab === "ACTIVE" ? { isActive: true } : activeTab === "INACTIVE" ? { isActive: false } : {}),
        ...(activeTab === "FEATURED" ? { isFeatured: true } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        sortBy,
        sortOrder,
      };
      const res = await getAllBrands(params);
      setBrands(res.data);
      setMeta(res.meta as Meta);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, activeTab, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchBrands();
    setSelected(new Set());
  }, [fetchBrands]);

  const resetPage = useCallback(() => setPage(1), []);

  const hasActiveFilters = search || activeTab !== "ALL" || dateFrom || dateTo;

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  }, []);

  // ── Selection ─────────────────────────────────────────────────────────────────
  const toggleAll = () => {
    const next = new Set(selected);
    const allChecked = brands.length > 0 && brands.every((b) => selected.has(b.id));
    if (allChecked) brands.forEach((b) => next.delete(b.id));
    else brands.forEach((b) => next.add(b.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // ── Actions ───────────────────────────────────────────────────────────────────
  const handleToggleActive = async (brand: Brand) => {
    try {
      const res = await updateBrand(brand.id, { isActive: !brand.isActive });
      setBrands((prev) => prev.map((b) => (b.id === brand.id ? res.data : b)));
      fetchBrands();
    } catch (err: any) {
      setError(err?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleDeleteClick = (brand: Brand) => {
    setDeletingBrand(brand);
    setDeleteError(null);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBrand) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteBrand(deletingBrand.id);
      deleteModal.close();
      setDeletingBrand(null);
      fetchBrands();
    } catch (err: any) {
      setDeleteError(err?.message || "Không thể xoá thương hiệu");
    } finally {
      setDeleting(false);
    }
  };

  // ── Create ────────────────────────────────────────────────────────────────────
  const openCreateModal = () => {
    setNewName("");
    setNewDescription("");
    setNewIsActive(true);
    setNewIsFeatured(false);
    setNewImageFile(null);
    if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    setNewPreviewUrl(null);
    setCreateError(null);
    createModal.open();
  };

  const handleCreateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    setNewImageFile(file);
    setNewPreviewUrl(URL.createObjectURL(file));
  };

  const handleCreateConfirm = async () => {
    if (!newName.trim()) {
      setCreateError("Tên thương hiệu không được để trống");
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      await createBrand({
        name: newName.trim(),
        description: newDescription.trim() || undefined,
        isActive: newIsActive,
        isFeatured: newIsFeatured,
        ...(newImageFile ? { imageUrl: newImageFile } : {}),
      });
      createModal.close();
      if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
      fetchBrands();
    } catch (err: any) {
      setCreateError(err?.message || "Không thể tạo thương hiệu");
    } finally {
      setCreating(false);
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────────
  const columns = getBrandColumns({
    page,
    pageSize,
    selected,
    openStatusId,
    toggleOne,
    setOpenStatusId,
    onToggleActive: handleToggleActive,
    onDeleteClick: handleDeleteClick,
  });

  const TABS = [
    { label: "Tất cả", value: "ALL", count: meta.activeCounts.ALL },
    { label: "Hoạt động", value: "ACTIVE", count: meta.activeCounts.ACTIVE },
    { label: "Không hoạt động", value: "INACTIVE", count: meta.activeCounts.INACTIVE },
    { label: "Nổi bật", value: "FEATURED", count: meta.activeCounts.FEATURED },
  ];

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
            <h1 className="text-[20px] font-bold text-primary">Thương hiệu</h1>
            <p className="text-[12px] text-neutral-dark">Quản lý thương hiệu sản phẩm</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchBrands}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={openCreateModal} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm thương hiệu
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="px-6 pb-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard label="Tổng thương hiệu" value={meta.activeCounts.ALL} sub="Tất cả thương hiệu" icon={<Tag size={16} />} />
        <StatsCard label="Đang hoạt động" value={meta.activeCounts.ACTIVE} sub="Khách hàng có thể xem" icon={<Tag size={16} />} valueClassName="text-emerald-600" iconClassName="text-emerald-600" />
        <StatsCard label="Không hoạt động" value={meta.activeCounts.INACTIVE} sub="Đang bị ẩn" icon={<XCircle size={16} />} valueClassName="text-neutral-dark" iconClassName="text-neutral-dark" />
        <StatsCard label="Nổi bật" value={meta.activeCounts.FEATURED} sub="Hiển thị trang chủ" icon={<Star size={16} />} valueClassName="text-amber-500" iconClassName="text-amber-500" />
      </div>

      {/* ── Main card ── */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* ── Toolbar: 1 row ── */}
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {/* Tabs */}
          {TABS.map((tab) => (
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
                {tab.count}
              </span>
            </button>
          ))}

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
              placeholder="Tìm thương hiệu..."
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
              setSortBy(e.target.value as SortBy);
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            <option value="name">Tên</option>
            <option value="createdAt">Ngày tạo</option>
            <option value="productCount">Sản phẩm</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => {
              setSortOrder(e.target.value as SortOrder);
              resetPage();
            }}
            className="px-3 py-2 text-[12px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer"
          >
            <option value="asc">A → Z</option>
            <option value="desc">Z → A</option>
          </select>

          {/* Date filter */}
          <DateFilterPopover
            dateFrom={dateFrom}
            dateTo={dateTo}
            onApply={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
              resetPage();
            }}
            onClear={() => {
              setDateFrom("");
              setDateTo("");
              resetPage();
            }}
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-neutral-dark">{meta.total} thương hiệu</span>
        </div>

        {/* ── Selection bar ── */}
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-2.5 bg-accent/5 border-b border-accent/20">
            <span className="text-[12px] text-accent font-medium">Đã chọn {selected.size} thương hiệu</span>
            <button onClick={() => setSelected(new Set())} className="text-[12px] text-neutral-dark hover:text-primary cursor-pointer">
              Bỏ chọn
            </button>
            <button className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium text-promotion hover:bg-promotion-light transition-colors cursor-pointer">
              <Trash2 size={13} /> Xoá đã chọn
            </button>
          </div>
        )}

        {/* ── Table ── */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">{error}</p>
            <button onClick={fetchBrands} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Tag size={36} className="text-neutral-dark opacity-30" />
            <p className="text-[13px] text-neutral-dark">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có thương hiệu nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={openCreateModal} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Thêm thương hiệu đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable<Brand> columns={columns} data={brands} rowKey="id" className="mx-0" rowClassName={(brand) => (selected.has(brand.id) ? "bg-accent/5" : "")} />
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
              <span className="text-[12px] text-neutral-dark">/ {meta.total} thương hiệu</span>
            </div>
            {/* <AdminPagination page={meta.page} totalPages={meta.totalPages} onPageChange={setPage} /> */}
          </div>
        )}
      </div>

      {openStatusId && <div className="fixed inset-0 z-10" onClick={() => setOpenStatusId(null)} />}

      {/* ── Delete modal ── */}
      <Popzy
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        footer={false}
        closeMethods={["button", "overlay", "escape"]}
        content={
          <div className="py-2">
            <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
              <Trash2 size={22} strokeWidth={1.5} />
            </div>
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá thương hiệu?</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{deletingBrand?.name}"</p>
            <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
            {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
            <div className="flex gap-2">
              <button
                onClick={deleteModal.close}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {deleting ? "Đang xoá..." : "Xoá thương hiệu"}
              </button>
            </div>
          </div>
        }
      />

      {/* ── Create modal ── */}
      <Popzy
        isOpen={createModal.isOpen}
        onClose={createModal.close}
        footer={false}
        closeMethods={["button", "overlay", "escape"]}
        content={
          <div className="py-1">
            <h3 className="text-[16px] font-bold text-primary mb-5">Thêm thương hiệu mới</h3>
            <div className="space-y-4">
              {/* Ảnh */}
              <div>
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1.5">Ảnh thương hiệu</label>
                <label className="flex items-center gap-2 w-full px-3 py-2.5 border border-dashed border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer">
                  <Upload size={13} />
                  {newImageFile ? newImageFile.name : "Chọn ảnh (tùy chọn)"}
                  <input type="file" accept="image/*" className="hidden" onChange={handleCreateImageChange} />
                </label>
                {newPreviewUrl && (
                  <div className="relative mt-2 w-full h-32 rounded-xl overflow-hidden border border-neutral bg-neutral-light-active">
                    <Image src={newPreviewUrl} alt="preview" fill className="object-contain p-2" unoptimized />
                    <button
                      onClick={() => {
                        URL.revokeObjectURL(newPreviewUrl);
                        setNewPreviewUrl(null);
                        setNewImageFile(null);
                      }}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors cursor-pointer"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}
              </div>
              {/* Tên */}
              <div>
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1.5">
                  Tên thương hiệu <span className="text-promotion">*</span>
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Nhập tên thương hiệu"
                  className="w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all"
                />
              </div>
              {/* Mô tả */}
              <div>
                <label className="text-[10px] font-semibold text-primary uppercase tracking-wider block mb-1.5">Mô tả</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={3}
                  placeholder="Nhập mô tả thương hiệu"
                  className="w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-primary/40 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
                />
              </div>
              {/* Toggles */}
              <div className="flex gap-4">
                <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
                  <span className="text-[13px] text-primary">Hiển thị</span>
                  <button onClick={() => setNewIsActive((v) => !v)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${newIsActive ? "bg-accent" : "bg-neutral"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${newIsActive ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
                  <span className="text-[13px] text-primary">Nổi bật</span>
                  <button onClick={() => setNewIsFeatured((v) => !v)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${newIsFeatured ? "bg-amber-400" : "bg-neutral"}`}>
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${newIsFeatured ? "left-5" : "left-0.5"}`} />
                  </button>
                </div>
              </div>
            </div>
            {createError && <div className="mt-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">{createError}</div>}
            <div className="flex gap-2 mt-5">
              <button
                onClick={createModal.close}
                disabled={creating}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleCreateConfirm}
                disabled={creating}
                className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {creating ? "Đang tạo..." : "Tạo thương hiệu"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
