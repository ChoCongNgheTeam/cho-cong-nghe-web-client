"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Ticket, Pencil, Loader2, XCircle, Trash2, Check, X, Clock, Target, BarChart2 } from "lucide-react";
import { Popzy } from "@/components/Modal";
import { getVoucher, updateVoucher, deleteVoucher } from "../_libs/vouchers";
import { VoucherForm, voucherToForm, formToUpdatePayload, type VoucherFormData } from "../components/VoucherForm";
import { VoucherStatusBadge } from "../components/VoucherStatusBadge";
import { DISCOUNT_TYPE_LABELS, DISCOUNT_TYPE_COLORS, TARGET_TYPE_LABELS } from "../const";
import type { VoucherDetail } from "../voucher.types";
import { formatDate, formatVND } from "@/helpers";

export default function VoucherDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const params = useParams();
  const id = params.id as string;

  const [voucher, setVoucher] = useState<VoucherDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchVoucher = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getVoucher(id);
      setVoucher(res.data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể tải voucher");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchVoucher();
  }, [fetchVoucher]);

  const handleSave = async (form: VoucherFormData) => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const payload = formToUpdatePayload(form);
      const res = await updateVoucher(id, payload);
      setVoucher(res.data);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (e: any) {
      setSaveError(e?.message ?? "Không thể cập nhật voucher");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteVoucher(id);
      router.push("/admin/vouchers");
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá voucher");
    } finally {
      setDeleting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-light flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );

  if (error || !voucher)
    return (
      <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center gap-3">
        <XCircle size={36} className="text-promotion opacity-50" />
        <p className="text-[13px] text-neutral-dark">{error ?? "Không tìm thấy voucher"}</p>
        <Link href="/admin/vouchers" className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]">
          Quay lại
        </Link>
      </div>
    );

  const usagePercent = voucher.maxUses ? Math.min(100, (voucher.usesCount / voucher.maxUses) * 100) : 0;

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/vouchers" className="text-[13px] text-neutral-dark hover:text-accent">
          Voucher
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-bold font-mono">{voucher.code}</span>
      </div>

      <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* ── Left ── */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info card */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                <Ticket size={18} />
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/vouchers/${voucher.id}?edit=true`}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
                  title="Chỉnh sửa"
                >
                  <Pencil size={14} />
                </Link>
                <button
                  onClick={() => setDeleteOpen(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
                  title="Xoá"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-[18px] font-bold text-primary font-mono tracking-wider">{voucher.code}</h2>
              {voucher.description && <p className="text-[12px] text-neutral-dark mt-1">{voucher.description}</p>}
            </div>

            <div className="flex flex-wrap gap-2">
              <VoucherStatusBadge voucher={voucher} />
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[voucher.discountType]}`}>
                {DISCOUNT_TYPE_LABELS[voucher.discountType]} {voucher.discountType === "DISCOUNT_PERCENT" ? `${voucher.discountValue}%` : formatVND(voucher.discountValue)}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest flex items-center gap-1.5">
              <BarChart2 size={12} /> Thống kê sử dụng
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark">Đã dùng</span>
                <span className="text-[13px] font-bold text-primary">
                  {voucher.usesCount}
                  {voucher.maxUses && <span className="text-[11px] text-neutral-dark font-normal"> / {voucher.maxUses}</span>}
                </span>
              </div>
              {voucher.maxUses && (
                <div className="w-full h-1.5 bg-neutral-light-active rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${usagePercent}%` }} />
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark">Đơn tối thiểu</span>
                <span className="text-[12px] font-medium text-primary">{formatVND(voucher.minOrderValue)}</span>
              </div>
              {voucher.maxDiscountValue && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark">Giảm tối đa</span>
                  <span className="text-[12px] font-medium text-primary">{formatVND(voucher.maxDiscountValue)}</span>
                </div>
              )}
              {voucher.maxUsesPerUser && (
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark">Lượt/người</span>
                  <span className="text-[12px] font-medium text-primary">{voucher.maxUsesPerUser}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1">
                  <Clock size={11} /> Bắt đầu
                </span>
                <span className="text-[12px] text-primary">{voucher.startDate ? formatDate(voucher.startDate) : <span className="italic opacity-60">Ngay lập tức</span>}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-neutral-dark flex items-center gap-1">
                  <Clock size={11} /> Kết thúc
                </span>
                <span className="text-[12px] text-primary">{voucher.endDate ? formatDate(voucher.endDate) : <span className="italic opacity-60">Không hết hạn</span>}</span>
              </div>
            </div>
          </div>

          {/* Targets */}
          {voucher.targets.length > 0 && (
            <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
              <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest flex items-center gap-1.5">
                <Target size={12} /> Phạm vi áp dụng
              </p>
              <div className="flex flex-wrap gap-1.5">
                {voucher.targets.map((t) => (
                  <span key={t.id} className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-light-active text-neutral-dark font-medium">
                    {TARGET_TYPE_LABELS[t.targetType] ?? t.targetType}
                    {t.targetId && <span className="ml-1 font-mono opacity-60 text-[10px]">({t.targetId.slice(0, 8)}…)</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Form ── */}
        <div className="lg:col-span-2">
          <div className="bg-neutral-light border border-neutral rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[15px] font-bold text-primary">{isEditMode ? "Chỉnh sửa voucher" : "Thông tin voucher"}</h3>
              {saveSuccess && (
                <span className="flex items-center gap-1.5 text-[12px] text-emerald-600 font-medium">
                  <Check size={14} /> Đã lưu
                </span>
              )}
              {!isEditMode && (
                <Link
                  href={`/admin/vouchers/${voucher.id}?edit=true`}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active"
                >
                  <Pencil size={13} /> Chỉnh sửa
                </Link>
              )}
            </div>

            {isEditMode ? (
              <VoucherForm
                initialData={voucherToForm(voucher)}
                isEdit
                onSubmit={handleSave}
                saving={saving}
                error={saveError}
                submitLabel="Lưu thay đổi"
                onCancel={() => router.push(`/admin/vouchers/${voucher.id}`)}
              />
            ) : (
              <div className="space-y-4 text-[13px]">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">Mã voucher</p>
                    <p className="font-bold font-mono text-primary">{voucher.code}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">Ưu tiên</p>
                    <p className="text-primary">{voucher.priority}</p>
                  </div>
                </div>
                {voucher.description && (
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">Mô tả</p>
                    <p className="text-primary">{voucher.description}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">Loại giảm</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${DISCOUNT_TYPE_COLORS[voucher.discountType]}`}>
                      {DISCOUNT_TYPE_LABELS[voucher.discountType]} {voucher.discountType === "DISCOUNT_PERCENT" ? `${voucher.discountValue}%` : formatVND(voucher.discountValue)}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-1">Trạng thái</p>
                    <VoucherStatusBadge voucher={voucher} />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark">Ngày tạo</span>
                  <span className="text-[12px] text-primary">{formatDate(voucher.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-neutral-dark">Cập nhật lần cuối</span>
                  <span className="text-[12px] text-primary">{formatDate(voucher.updatedAt)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteOpen && (
        <Popzy
          isOpen={deleteOpen}
          onClose={() => !deleting && setDeleteOpen(false)}
          footer={false}
          closeMethods={deleting ? [] : ["button", "overlay", "escape"]}
          content={
            <div className="py-2">
              <div className="w-12 h-12 rounded-2xl bg-promotion-light flex items-center justify-center text-promotion mx-auto mb-4">
                <Trash2 size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá voucher?</h3>
              <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
              <p className="text-[15px] font-bold text-primary text-center font-mono mb-5">"{voucher.code}"</p>
              <p className="text-[12px] text-promotion text-center mb-6">Voucher sẽ được chuyển vào thùng rác.</p>
              {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteOpen(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                >
                  Huỷ
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {deleting && <Loader2 size={13} className="animate-spin" />}
                  {deleting ? "Đang xoá..." : "Xoá voucher"}
                </button>
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
