"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, RefreshCw, Sparkles, Loader2, XCircle, Trophy, Users, RotateCcw } from "lucide-react";
import AdminTable from "@/components/admin/AdminTables";
import { StatsCard } from "@/components/admin/StatsCard";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { Popzy } from "@/components/modal";
import { usePopzy } from "@/hooks/usePopzy";
import { useToasty } from "@/components/toast";
import { SpinPrize, SpinStats } from "./spin-prize.types";
import { getAllSpinPrizes, createSpinPrize, updateSpinPrize, deleteSpinPrize, getSpinStats, resetSpinData } from "./_lib/spin-prizes";
import { getSpinPrizeColumns } from "./components/TableSpinPrizes";
import { SpinPrizeForm, DEFAULT_FORM, prizeToForm, formToCreatePayload, formToUpdatePayload, type SpinPrizeFormData } from "./components/SpinPrizeForm";

export default function SpinPrizesPage() {
  const { success, error: toastError } = useToasty();

  const [prizes, setPrizes] = useState<SpinPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState<SpinStats | null>(null);

  const fetchPrizes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllSpinPrizes();
      setPrizes(res.data);
    } catch (err: unknown) {
      setError((err as Error)?.message || "Không thể tải danh sách phần thưởng");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await getSpinStats();
      setStats(res.data);
    } catch {
      // thống kê là phụ, lỗi ở đây không cần chặn cả trang
    }
  }, []);

  useEffect(() => {
    fetchPrizes();
    fetchStats();
  }, [fetchPrizes, fetchStats]);

  const formModal = usePopzy();
  const [editTarget, setEditTarget] = useState<SpinPrize | null>(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const deleteModal = usePopzy();
  const [deletingPrize, setDeletingPrize] = useState<SpinPrize | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const resetModal = usePopzy();
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  const handleResetConfirm = async () => {
    setResetting(true);
    setResetError(null);
    try {
      await resetSpinData();
      resetModal.close();
      success("Đã xoá toàn bộ lịch sử quay — sẵn sàng cho buổi demo/thi thật!");
      fetchPrizes();
      fetchStats();
    } catch (err: unknown) {
      setResetError((err as Error)?.message || "Không thể reset dữ liệu");
    } finally {
      setResetting(false);
    }
  };

  const handleOpenCreate = () => {
    setEditTarget(null);
    setFormError(null);
    formModal.open();
  };

  const handleEditClick = (prize: SpinPrize) => {
    setEditTarget(prize);
    setFormError(null);
    formModal.open();
  };

  const handleFormSubmit = async (form: SpinPrizeFormData) => {
    setFormSaving(true);
    setFormError(null);
    try {
      if (editTarget) {
        await updateSpinPrize(editTarget.id, formToUpdatePayload(form));
        formModal.close();
        success("Cập nhật phần thưởng thành công!");
      } else {
        await createSpinPrize(formToCreatePayload(form));
        formModal.close();
        success("Thêm phần thưởng thành công!");
      }
      fetchPrizes();
    } catch (err: unknown) {
      const message = (err as Error)?.message || "Có lỗi xảy ra khi lưu phần thưởng";
      setFormError(message);
      toastError(message);
    } finally {
      setFormSaving(false);
    }
  };

  const handleDeleteClick = (prize: SpinPrize) => {
    setDeletingPrize(prize);
    setDeleteError(null);
    deleteModal.open();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPrize) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteSpinPrize(deletingPrize.id);
      deleteModal.close();
      setDeletingPrize(null);
      success("Xoá phần thưởng thành công!");
      fetchPrizes();
    } catch (err: unknown) {
      setDeleteError((err as Error)?.message || "Không thể xoá phần thưởng");
    } finally {
      setDeleting(false);
    }
  };

  const columns = getSpinPrizeColumns({ onEditClick: handleEditClick, onDeleteClick: handleDeleteClick });
  const unlimitedActiveCount = prizes.filter((p) => p.isActive && p.totalBudget === null).length;

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
            <Sparkles size={18} />
          </div>
          <div>
            <h1 className="text-[20px] font-bold text-primary">Vòng quay may mắn — Phần thưởng</h1>
            <p className="text-[12px] text-primary">Cấu hình phần thưởng hiển thị trên vòng quay ở trang chủ</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPrizes} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={resetModal.open}
            className="flex items-center gap-1.5 px-3 py-2 border border-promotion/30 text-promotion rounded-xl text-[13px] font-medium hover:bg-promotion-light transition-all cursor-pointer"
            title="Xoá toàn bộ lịch sử quay test trước khi thi thật"
          >
            <RotateCcw size={14} />
            Reset dữ liệu quay
          </button>
          <button onClick={handleOpenCreate} className="flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-[13px] font-semibold rounded-xl transition-all cursor-pointer">
            <Plus size={15} />
            Thêm phần thưởng
          </button>
        </div>
      </div>

      {/* Thống kê */}
      {stats && (
        <div className="mx-6 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatsCard label="Tổng lượt quay" value={stats.totalSpins} sub="Tổng số user đã quay" icon={<Users size={16} />} />
          {stats.byPrize
            .filter((p) => p._count.entries > 0)
            .slice(0, 3)
            .map((p) => (
              <StatsCard key={p.id} label={p.label} value={p._count.entries} sub={p.totalBudget !== null ? `Ngân sách: ${p.awardedCount}/${p.totalBudget}` : "Không giới hạn"} icon={<Trophy size={16} />} />
            ))}
        </div>
      )}
      {!loading && prizes.length > 0 && unlimitedActiveCount === 0 && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          ⚠️ Chưa có phần thưởng "Không giới hạn" nào đang hoạt động — vòng quay có thể bị trống nếu các phần thưởng khác hết ngân sách. Hãy thêm/kích hoạt ít nhất 1 phần thưởng không giới hạn.
        </div>
      )}
      {!loading && prizes.length === 0 && !error && (
        <div className="mx-6 mb-4 px-4 py-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-[13px]">
          Chưa có phần thưởng nào — nút vòng quay sẽ tự ẩn ở trang chủ cho tới khi bạn thêm ít nhất 1 phần thưởng.
        </div>
      )}

      <div className="mx-6 bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm mb-8">
        {error ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-primary">{error}</p>
            <button onClick={fetchPrizes} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thử lại
            </button>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-accent" />
          </div>
        ) : prizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <Sparkles size={36} className="text-primary opacity-30" />
            <p className="text-[13px] text-primary">Chưa có phần thưởng nào</p>
            <button onClick={handleOpenCreate} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
              Thêm phần thưởng đầu tiên
            </button>
          </div>
        ) : (
          <AdminTable<SpinPrize> columns={columns} data={prizes} rowKey="id" className="mx-0" />
        )}
      </div>

      <Popzy
        isOpen={formModal.isOpen}
        onClose={formModal.close}
        footer={false}
        closeMethods={formSaving ? [] : ["button", "overlay", "escape"]}
        content={
          <div className="py-1">
            <h3 className="text-[16px] font-bold text-primary mb-5">{editTarget ? "Chỉnh sửa phần thưởng" : "Thêm phần thưởng mới"}</h3>
            <SpinPrizeForm
              key={editTarget?.id ?? "create"}
              initialData={editTarget ? prizeToForm(editTarget) : DEFAULT_FORM}
              onSubmit={handleFormSubmit}
              saving={formSaving}
              error={formError}
              submitLabel={editTarget ? "Lưu thay đổi" : "Tạo phần thưởng"}
              onCancel={formModal.close}
            />
          </div>
        }
      />

      <ConfirmDeleteModal isOpen={deleteModal.isOpen} onClose={deleteModal.close} title="Xoá phần thưởng?" itemName={deletingPrize?.label} onConfirm={handleDeleteConfirm} loading={deleting} error={deleteError} confirmLabel="Xoá phần thưởng" />

      <ConfirmDeleteModal
        isOpen={resetModal.isOpen}
        onClose={resetModal.close}
        title="Reset toàn bộ dữ liệu quay?"
        description="Thao tác này sẽ xoá TOÀN BỘ lịch sử ai đã quay, cho phép mọi tài khoản quay lại từ đầu, và đưa ngân sách các phần thưởng có giới hạn về 0."
        warningText="Chỉ dùng để dọn dữ liệu test trước buổi demo/thi thật — không thể hoàn tác. Cấu hình phần thưởng vẫn được giữ nguyên."
        onConfirm={handleResetConfirm}
        loading={resetting}
        error={resetError}
        confirmLabel="Tôi hiểu, reset ngay"
      />
    </div>
  );
}
