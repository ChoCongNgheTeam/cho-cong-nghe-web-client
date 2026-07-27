"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, RefreshCw, Truck, Loader2, XCircle, X } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { SortDropdown } from "@/components/admin/shared/SortDropdown";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { Popzy } from "@/components/modal";
import { usePopzy } from "@/hooks/usePopzy";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { useToasty } from "@/components/toast";
import { Supplier, SuppliersResponse } from "./supplier.types";
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from "./_lib/suppliers";
import { STATUS_TABS, SORT_OPTIONS } from "./_lib/constants";
import { getSupplierColumns } from "./components/TableSuppliers";
import { SupplierForm, DEFAULT_FORM, supplierToForm, formToCreatePayload, formToUpdatePayload, type SupplierFormData } from "./components/SupplierForm";

type SortBy = "name" | "createdAt";
type ActiveTab = "ALL" | "ACTIVE" | "INACTIVE";

interface SupplierExtraParams {
  isActive?: boolean;
}

export default function SuppliersPage() {
  const { success, error: toastError } = useToasty();

  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL");

  const extraParams = useMemo<SupplierExtraParams>(
    () => ({
      ...(activeTab === "ACTIVE" ? { isActive: true } : activeTab === "INACTIVE" ? { isActive: false } : {}),
    }),
    [activeTab],
  );

  const {
    data: suppliers,
    setData: setSuppliers,
    meta,
    loading,
    error,
    refetch: fetchSuppliers,
    page,
    setPage,
    pageSize,
    setPageSize,
    resetPage,
    search,
    setSearch,
    searchInput,
    setSearchInput,
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,
    selected,
    toggleOne,
  } = useAdminListPage<Supplier, SortBy, SupplierExtraParams, SuppliersResponse["meta"]>({
    fetchFn: getAllSuppliers,
    defaultSortBy: "name",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (s) => s.id,
  });

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  const formModal = usePopzy();
  const [editTarget, setEditTarget] = useState<Supplier | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const deleteModal = usePopzy();
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const hasActiveFilters = search || activeTab !== "ALL";

  const handleClearAllFilters = useCallback(() => {
    setSearch("");
    setSearchInput("");
    setActiveTab("ALL");
    setPage(1);
  }, [setSearch, setSearchInput, setPage]);

  const handleToggleActive = useCallback(
    async (supplier: Supplier) => {
      try {
        await updateSupplier(supplier.id, { isActive: !supplier.isActive });
        fetchSuppliers();
      } catch (err: unknown) {
        toastError((err as Error)?.message || "Không thể cập nhật trạng thái");
      }
    },
    [fetchSuppliers, toastError],
  );

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormError(null);
    formModal.open();
  };

  const handleEditClick = (supplier: Supplier) => {
    setEditTarget(supplier);
    setFormError(null);
    formModal.open();
  };

  const handleFormSubmit = async (form: SupplierFormData) => {
    setFormSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        const payload = formToUpdatePayload(form);
        const res = await updateSupplier(editTarget.id, payload);
        setSuppliers((prev) => prev.map((s) => (s.id === editTarget.id ? res.data : s)));
        formModal.close();
        success("Cập nhật nhà cung cấp thành công!");
        fetchSuppliers();
      } else {
        const payload = formToCreatePayload(form);
        await createSupplier(payload);
        formModal.close();
        success("Thêm nhà cung cấp thành công!");
        fetchSuppliers();
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Có lỗi xảy ra khi lưu nhà cung cấp";
      setFormError(message);
      toastError(message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setDeleteError(null);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSupplier(deletingSupplier.id);
      deleteModal.close();
      setDeletingSupplier(null);
      success("Xoá nhà cung cấp thành công!");
      fetchSuppliers();
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || "Không thể xoá nhà cung cấp");
    } finally {
      setDeleting(false);
    }
  };

  const columns = getSupplierColumns({
    page,
    pageSize,
    selected,
    openStatusId,
    toggleOne,
    setOpenStatusId,
    onToggleActive: handleToggleActive,
    onEditClick: handleEditClick,
    onDeleteClick: handleDeleteClick,
  });

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Truck size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Nhà cung cấp</h1>
            <p className="text-[12px] text-primary">Quản lý danh sách nhà cung cấp hàng hóa</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSuppliers}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm nhà cung cấp
          </button>
        </div>
      </div>

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="px-5 py-3 border-b border-neutral flex items-center gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => {
                setActiveTab(tab.value);
                resetPage();
              }}
              className={`px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${
                activeTab === tab.value ? "bg-accent text-white" : "text-primary hover:bg-neutral-light-active"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <div className="w-px h-5 bg-neutral mx-1" />

          <SearchBox
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={(v) => {
              setSearch(v);
              resetPage();
            }}
            onClear={() => {
              setSearchInput("");
              setSearch("");
              resetPage();
            }}
            placeholder="Tìm tên, mã, SĐT, email..."
          />

          <SortDropdown
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(v) => {
              setSortBy(v as SortBy);
              resetPage();
            }}
            onSortOrderChange={(v) => {
              setSortOrder(v);
              resetPage();
            }}
            options={SORT_OPTIONS}
          />

          {hasActiveFilters && (
            <button
              onClick={handleClearAllFilters}
              className="flex items-center gap-1 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
            >
              <X size={13} /> Xoá lọc
            </button>
          )}

          <span className="ml-auto text-[12px] text-primary">{meta.total} nhà cung cấp</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchSuppliers} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Truck size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có nhà cung cấp nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Thêm nhà cung cấp đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable<Supplier> columns={columns} data={suppliers} rowKey="id" className="mx-0" rowClassName={(s) => (selected.has(s.id) ? "bg-accent/5" : "")} />
        )}

        {!loading && !error && meta.total > 0 && (
          <div className="px-5 py-4 border-t border-neutral">
            <AdminPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              total={meta.total}
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

      {openStatusId && <div className="fixed inset-0 z-10" onClick={() => setOpenStatusId(null)} />}

      <Popzy
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        footer={false}
        closeMethods={formSaving ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-1">
            <h3 className="text-[16px] font-bold text-primary mb-5">{editTarget ? "Chỉnh sửa nhà cung cấp" : "Thêm nhà cung cấp mới"}</h3>
            <SupplierForm
              key={editTarget?.id ?? "create"}
              initialData={editTarget ? supplierToForm(editTarget) : DEFAULT_FORM}
              isEdit={!!editTarget}
              onSubmit={handleFormSubmit}
              saving={formSaving}
              error={formError}
              submitLabel={editTarget ? "Lưu thay đổi" : "Tạo nhà cung cấp"}
              onCancel={formModal.close}
            />
          </div>
        }
      />

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xoá nhà cung cấp?"
        itemName={deletingSupplier?.name}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError}
        confirmLabel="Xoá nhà cung cấp"
      />
    </div>
  );
}
