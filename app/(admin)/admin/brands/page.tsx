"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Filter, CalendarDays, Plus, Trash2, Upload, X, ChevronDown } from "lucide-react";

import { Brand, GetBrandsParams } from "./brand.types";
import { createBrand, deleteBrand, getAllBrands, updateBrand } from "./_libs/brands";
import AdminPagination from "@/components/admin/PaginationAdmin";
import AdminTable from "@/components/admin/AdminTables";
import { getBrandColumns } from "./components/TableBrands";
import { usePopzy } from "@/components/Modal/usePopzy";
import { Popzy } from "@/components/Modal";
import Image from "next/image";

type SortBy = "name" | "createdAt" | "productCount";
type SortOrder = "asc" | "desc";

// ── Date filter popover ────────────────────────────────────────────────────────
function DateFilterPopover({ dateFrom, dateTo, onApply, onClear }: { dateFrom: string; dateTo: string; onApply: (from: string, to: string) => void; onClear: () => void }) {
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(dateFrom);
  const [to, setTo] = useState(dateTo);
  const ref = useRef<HTMLDivElement>(null);

  // sync khi parent clear
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
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[13px] transition-colors cursor-pointer ${
          hasFilter ? "border-accent bg-accent-light text-accent font-medium" : "border-neutral bg-neutral-light text-primary hover:bg-neutral-light-active"
        }`}
      >
        <CalendarDays size={13} />
        Lọc theo ngày
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
              className="flex-1 px-3 py-1.5 text-[12px] bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors cursor-pointer font-medium"
            >
              Áp dụng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Filter popover (isActive / isFeatured / sortBy) ────────────────────────────
function FilterPopover({
  isActive,
  isFeatured,
  sortBy,
  sortOrder,
  onChange,
}: {
  isActive: boolean | undefined;
  isFeatured: boolean | undefined;
  sortBy: SortBy;
  sortOrder: SortOrder;
  onChange: (v: { isActive?: boolean; isFeatured?: boolean; sortBy: SortBy; sortOrder: SortOrder }) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const hasFilter = isActive !== undefined || isFeatured !== undefined;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-[13px] transition-colors cursor-pointer ${
          hasFilter ? "border-accent bg-accent-light text-accent font-medium" : "border-neutral bg-neutral-light text-primary hover:bg-neutral-light-active"
        }`}
      >
        <Filter size={13} />
        Bộ lọc
        {hasFilter && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
        <ChevronDown size={11} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 z-30 bg-neutral-light border border-neutral rounded-xl shadow-lg p-4 w-64 space-y-4">
          <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Bộ lọc</p>

          {/* Trạng thái */}
          <div>
            <p className="text-[11px] text-neutral-dark mb-1.5">Trạng thái</p>
            <div className="flex gap-1.5">
              {[
                { label: "Tất cả", value: undefined },
                { label: "Hoạt động", value: true },
                { label: "Ẩn", value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => onChange({ isActive: opt.value, isFeatured, sortBy, sortOrder })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    isActive === opt.value ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Nổi bật */}
          <div>
            <p className="text-[11px] text-neutral-dark mb-1.5">Nổi bật</p>
            <div className="flex gap-1.5">
              {[
                { label: "Tất cả", value: undefined },
                { label: "Nổi bật", value: true },
                { label: "Bình thường", value: false },
              ].map((opt) => (
                <button
                  key={String(opt.value)}
                  onClick={() => onChange({ isActive, isFeatured: opt.value, sortBy, sortOrder })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    isFeatured === opt.value ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sắp xếp */}
          <div>
            <p className="text-[11px] text-neutral-dark mb-1.5">Sắp xếp theo</p>
            <div className="flex gap-1.5 flex-wrap">
              {(["name", "createdAt", "productCount"] as SortBy[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onChange({ isActive, isFeatured, sortBy: s, sortOrder })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    sortBy === s ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {s === "name" ? "Tên" : s === "createdAt" ? "Ngày tạo" : "Sản phẩm"}
                </button>
              ))}
            </div>
            <div className="flex gap-1.5 mt-1.5">
              {(["asc", "desc"] as SortOrder[]).map((o) => (
                <button
                  key={o}
                  onClick={() => onChange({ isActive, isFeatured, sortBy, sortOrder: o })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer ${
                    sortOrder === o ? "bg-accent text-white" : "border border-neutral text-primary hover:bg-neutral-light-active"
                  }`}
                >
                  {o === "asc" ? "A → Z" : "Z → A"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => onChange({ isActive: undefined, isFeatured: undefined, sortBy: "name", sortOrder: "asc" })}
            className="w-full text-[11px] text-neutral-dark hover:text-promotion transition-colors cursor-pointer pt-1"
          >
            Xoá tất cả bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [isActive, setIsActive] = useState<boolean | undefined>(undefined);
  const [isFeatured, setIsFeatured] = useState<boolean | undefined>(undefined);
  const [sortBy, setSortBy] = useState<SortBy>("name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

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

  // ── Fetch (server-side pagination) ──────────────────────────────────────────
  const fetchBrands = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: GetBrandsParams = {
        page,
        limit: pageSize,
        ...(search ? { search } : {}),
        ...(isActive !== undefined ? { isActive } : {}),
        ...(isFeatured !== undefined ? { isFeatured } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        sortBy,
        sortOrder,
      };
      const res = await getAllBrands(params);
      setBrands(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (err: any) {
      setError(err?.message || "Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, isActive, isFeatured, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    fetchBrands();
    setSelected(new Set());
  }, [fetchBrands]);

  // Reset page khi filter thay đổi (trừ page/pageSize)
  const applyFilter = (updates: Partial<{ isActive: boolean | undefined; isFeatured: boolean | undefined; sortBy: SortBy; sortOrder: SortOrder }>) => {
    if (updates.isActive !== undefined || "isActive" in updates) setIsActive(updates.isActive);
    if (updates.isFeatured !== undefined || "isFeatured" in updates) setIsFeatured(updates.isFeatured);
    if (updates.sortBy) setSortBy(updates.sortBy);
    if (updates.sortOrder) setSortOrder(updates.sortOrder);
    setPage(1);
  };

  // ── Checkbox ────────────────────────────────────────────────────────────────
  const allChecked = brands.length > 0 && brands.every((b) => selected.has(b.id));

  const toggleAll = () => {
    const next = new Set(selected);
    if (allChecked) brands.forEach((b) => next.delete(b.id));
    else brands.forEach((b) => next.add(b.id));
    setSelected(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  // ── Actions ─────────────────────────────────────────────────────────────────
  const handleToggleActive = async (brand: Brand) => {
    try {
      const res = await updateBrand(brand.id, { isActive: !brand.isActive });
      setBrands((prev) => prev.map((b) => (b.id === brand.id ? res.data : b)));
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
      setBrands((prev) => prev.filter((b) => b.id !== deletingBrand.id));
      setTotal((prev) => prev - 1);
      deleteModal.close();
      setDeletingBrand(null);
    } catch (err: any) {
      setDeleteError(err?.message || "Không thể xoá thương hiệu");
    } finally {
      setDeleting(false);
    }
  };

  // ── Create ───────────────────────────────────────────────────────────────────
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
      // Refetch trang 1 để thấy brand mới
      setPage(1);
      if (page === 1) fetchBrands();
      createModal.close();
      if (newPreviewUrl) URL.revokeObjectURL(newPreviewUrl);
    } catch (err: any) {
      setCreateError(err?.message || "Không thể tạo thương hiệu");
    } finally {
      setCreating(false);
    }
  };

  // ── Columns ──────────────────────────────────────────────────────────────────
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

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="flex items-center justify-end px-6 pt-5 pb-3">
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-accent hover:bg-accent-hover active:bg-accent-active text-white text-[13px] font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm cursor-pointer"
        >
          <Plus size={15} strokeWidth={2.5} />
          Thêm thương hiệu
        </button>
      </div>

      {/* Toolbar */}
      <div className="px-6 flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-light-active text-[13px] font-semibold text-primary transition-colors cursor-pointer">
            Tất cả nhãn hiệu
            <span className="text-accent font-bold text-[12px]">({total})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSearch(searchInput);
              setPage(1);
            }}
            className="relative"
          >
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search"
              className="pl-8 pr-3 py-1.5 text-[13px] bg-neutral-light border border-neutral rounded-lg text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/40 w-52 transition-all"
            />
          </form>

          <FilterPopover
            isActive={isActive}
            isFeatured={isFeatured}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onChange={({ isActive: a, isFeatured: f, sortBy: s, sortOrder: o }) => {
              setIsActive(a);
              setIsFeatured(f);
              setSortBy(s);
              setSortOrder(o);
              setPage(1);
            }}
          />

          <DateFilterPopover
            dateFrom={dateFrom}
            dateTo={dateTo}
            onApply={(from, to) => {
              setDateFrom(from);
              setDateTo(to);
              setPage(1);
            }}
            onClear={() => {
              setDateFrom("");
              setDateTo("");
              setPage(1);
            }}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mx-6 mb-3 flex items-center gap-3 px-4 py-2.5 rounded-lg border border-accent-light bg-accent-light text-[13px] text-primary">
          <input type="checkbox" checked={allChecked} onChange={toggleAll} className="w-3.5 h-3.5 rounded accent-accent cursor-pointer" />
          <span className="font-medium">
            Đã chọn <span className="text-accent font-semibold">{selected.size}</span> mục
          </span>
          <button className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-medium text-promotion hover:bg-promotion-light transition-colors cursor-pointer">
            <Trash2 size={13} /> Xoá đã chọn
          </button>
        </div>
      )}

      {error && <div className="mx-6 mb-3 border border-promotion/30 bg-promotion-light text-promotion text-[13px] px-4 py-2.5 rounded-lg">{error}</div>}

      <AdminTable<Brand> columns={columns} data={brands} rowKey="id" loading={loading} className="mx-6" rowClassName={(brand) => (selected.has(brand.id) ? "bg-accent-light/30" : "")} />

      <div className="px-6 py-4">
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

      {openStatusId && <div className="fixed inset-0 z-10" onClick={() => setOpenStatusId(null)} />}

      {/* Delete modal */}
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

      {/* Create modal */}
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
                className="flex-1 px-4 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
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
