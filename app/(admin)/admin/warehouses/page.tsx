"use client";

import { useCallback, useMemo, useState } from "react";
import { Plus, RefreshCw, Warehouse as WarehouseIcon, Loader2, XCircle, X } from "lucide-react";
import AdminPagination from "@/components/admin/AdminPagination";
import AdminTable from "@/components/admin/AdminTables";
import { SearchBox } from "@/components/admin/shared/SearchBox";
import { SortDropdown } from "@/components/admin/shared/SortDropdown";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { Popzy } from "@/components/modal";
import { usePopzy } from "@/hooks/usePopzy";
import { useAdminListPage } from "@/hooks/admin/useAdminListPage";
import { useToasty } from "@/components/toast";
import { Warehouse, WarehousesResponse } from "./warehouse.types";
import { getAllWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, setDefaultWarehouse } from "./_lib/warehouses";
import { STATUS_TABS, SORT_OPTIONS } from "./_lib/constants";
import { getWarehouseColumns } from "./components/TableWarehouses";
import { WarehouseForm, DEFAULT_FORM, warehouseToForm, formToCreatePayload, formToUpdatePayload, type WarehouseFormData } from "./components/WarehouseForm";

type SortBy = "name" | "createdAt";
type ActiveTab = "ALL" | "ACTIVE" | "INACTIVE";

interface WarehouseExtraParams {
  isActive?: boolean;
}

export default function WarehousesPage() {
  const { success, error: toastError } = useToasty();

  const [activeTab, setActiveTab] = useState<ActiveTab>("ALL");

  const extraParams = useMemo<WarehouseExtraParams>(
    () => ({
      ...(activeTab === "ACTIVE" ? { isActive: true } : activeTab === "INACTIVE" ? { isActive: false } : {}),
    }),
    [activeTab],
  );

  const {
    data: warehouses,
    setData: setWarehouses,
    meta,
    loading,
    error,
    refetch: fetchWarehouses,
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
  } = useAdminListPage<Warehouse, SortBy, WarehouseExtraParams, WarehousesResponse["meta"]>({
    fetchFn: getAllWarehouses,
    defaultSortBy: "name",
    defaultMeta: { page: 1, limit: 20, total: 0, totalPages: 1 },
    extraParams,
    getId: (w) => w.id,
  });

  const [openStatusId, setOpenStatusId] = useState<string | null>(null);

  // Form modal (create + edit dùng chung)
  const formModal = usePopzy();
  const [editTarget, setEditTarget] = useState<Warehouse | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal
  const deleteModal = usePopzy();
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);
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
    async (warehouse: Warehouse) => {
      try {
        await updateWarehouse(warehouse.id, { isActive: !warehouse.isActive });
        fetchWarehouses();
      } catch (err: unknown) {
        toastError((err as Error)?.message || "Không thể cập nhật trạng thái");
      }
    },
    [fetchWarehouses, toastError],
  );

  const handleSetDefault = useCallback(
    async (warehouse: Warehouse) => {
      try {
        await setDefaultWarehouse(warehouse.id);
        success(`Đã đặt "${warehouse.name}" làm kho mặc định`);
        fetchWarehouses();
      } catch (err: unknown) {
        toastError((err as Error)?.message || "Không thể đặt kho mặc định");
      }
    },
    [fetchWarehouses, success, toastError],
  );

  // Create/Edit
  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormError(null);
    formModal.open();
  };

  const handleEditClick = (warehouse: Warehouse) => {
    setEditTarget(warehouse);
    setFormError(null);
    formModal.open();
  };

  const handleFormSubmit = async (form: WarehouseFormData) => {
    setFormSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        const payload = formToUpdatePayload(form);
        const res = await updateWarehouse(editTarget.id, payload);
        setWarehouses((prev) => prev.map((w) => (w.id === editTarget.id ? res.data : w)));
        formModal.close();
        success("Cập nhật kho hàng thành công!");
        fetchWarehouses();
      } else {
        const payload = formToCreatePayload(form);
        await createWarehouse(payload);
        formModal.close();
        success("Thêm kho hàng thành công!");
        fetchWarehouses();
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Có lỗi xảy ra khi lưu kho hàng";
      setFormError(message);
      toastError(message);
    } finally {
      setFormSaving(false);
    }
  };

  // Delete
  const handleDeleteClick = (warehouse: Warehouse) => {
    setDeletingWarehouse(warehouse);
    setDeleteError(null);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingWarehouse) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteWarehouse(deletingWarehouse.id);
      deleteModal.close();
      setDeletingWarehouse(null);
      success("Xoá kho hàng thành công!");
      fetchWarehouses();
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || "Không thể xoá kho hàng");
    } finally {
      setDeleting(false);
    }
  };

  const columns = getWarehouseColumns({
    page,
    pageSize,
    selected,
    openStatusId,
    toggleOne,
    setOpenStatusId,
    onToggleActive: handleToggleActive,
    onEditClick: handleEditClick,
    onDeleteClick: handleDeleteClick,
    onSetDefaultClick: handleSetDefault,
  });

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <WarehouseIcon size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Danh sách kho</h1>
            <p className="text-[12px] text-primary">Quản lý các kho hàng của cửa hàng</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchWarehouses}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm kho hàng
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {/* Toolbar */}
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
            placeholder="Tìm tên kho, mã kho..."
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

          <span className="ml-auto text-[12px] text-primary">{meta.total} kho hàng</span>
        </div>

        {/* Table */}
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchWarehouses} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <WarehouseIcon size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">{hasActiveFilters ? "Không có kết quả phù hợp" : "Chưa có kho hàng nào"}</p>
            {hasActiveFilters ? (
              <button onClick={handleClearAllFilters} className="px-4 py-2 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
                Xoá bộ lọc
              </button>
            ) : (
              <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
                Thêm kho hàng đầu tiên
              </button>
            )}
          </div>
        ) : (
          <AdminTable<Warehouse> columns={columns} data={warehouses} rowKey="id" className="mx-0" rowClassName={(w) => (selected.has(w.id) ? "bg-accent/5" : "")} />
        )}

        {/* Pagination */}
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

      {/* Create/Edit modal */}
      <Popzy
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        footer={false}
        closeMethods={formSaving ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-1">
            <h3 className="text-[16px] font-bold text-primary mb-5">{editTarget ? "Chỉnh sửa kho hàng" : "Thêm kho hàng mới"}</h3>
            <WarehouseForm
              key={editTarget?.id ?? "create"}
              initialData={editTarget ? warehouseToForm(editTarget) : DEFAULT_FORM}
              isEdit={!!editTarget}
              onSubmit={handleFormSubmit}
              saving={formSaving}
              error={formError}
              submitLabel={editTarget ? "Lưu thay đổi" : "Tạo kho hàng"}
              onCancel={formModal.close}
            />
          </div>
        }
      />

      {/* Delete modal */}
      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={deleteModal.close}
        title="Xoá kho hàng?"
        itemName={deletingWarehouse?.name}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        error={deleteError}
        confirmLabel="Xoá kho hàng"
      />
    </div>
  );
}
