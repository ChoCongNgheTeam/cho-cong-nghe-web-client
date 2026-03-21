"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Pencil, Trash2, Tag, Loader2, CheckCircle2, EyeOff, Clock, XCircle, CalendarDays, Zap, Target, BarChart3 } from "lucide-react";
import { getPromotion, updatePromotion, deletePromotion } from "../_libs/promotions";
import { Popzy } from "@/components/Modal";
import type { Promotion } from "../promotion.types";
import { formatDate, formatVND } from "@/helpers";
import { ACTION_TYPE_LABELS, ACTION_TYPE_COLORS, TARGET_TYPE_LABELS } from "../const";
import { PromotionStatusBadge, getPromotionStatus } from "../components/PromotionStatusBadge";
import { PromotionForm, promotionToForm, formToPayload, type PromotionFormData } from "../components/PromotionForm";

// ── Info row ───────────────────────────────────────────────────────────────────
function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-neutral last:border-0">
      <span className="text-[12px] text-neutral-dark shrink-0 w-40">{label}</span>
      <span className="text-[13px] text-primary font-medium text-right">{children}</span>
    </div>
  );
}

export default function PromotionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = params?.id as string;

  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(searchParams.get("edit") === "true");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<PromotionFormData | null>(null);

  // Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getPromotion(id)
      .then((res) => {
        setPromotion(res.data);
        setEditForm(promotionToForm(res.data));
      })
      .catch((e) => setError(e?.message ?? "Không thể tải khuyến mãi"))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Save ──────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(
    async (form: PromotionFormData) => {
      if (!promotion) return;
      setSaving(true);
      setSaveError(null);
      try {
        const payload = formToPayload(form);
        const res = await updatePromotion(promotion.id, payload);
        setPromotion(res.data);
        setEditForm(promotionToForm(res.data));
        setEditMode(false);
      } catch (e: any) {
        setSaveError(e?.message ?? "Không thể cập nhật khuyến mãi");
        throw e; // re-throw để PromotionForm nhận error
      } finally {
        setSaving(false);
      }
    },
    [promotion],
  );

  const handleCancelEdit = useCallback(() => {
    if (promotion) setEditForm(promotionToForm(promotion));
    setEditMode(false);
    setSaveError(null);
  }, [promotion]);

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(async () => {
    if (!promotion) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deletePromotion(promotion.id);
      router.push("/admin/promotions");
    } catch (e: any) {
      setDeleteError(e?.message ?? "Không thể xoá khuyến mãi");
    } finally {
      setDeleting(false);
    }
  }, [promotion, router]);

  // ── Render states ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error || !promotion) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <Tag size={40} className="text-neutral-dark opacity-40" />
        <p className="text-sm text-neutral-dark">{error ?? "Không tìm thấy khuyến mãi"}</p>
        <button onClick={() => router.back()} className="px-4 py-2 rounded-lg bg-accent text-white text-[13px] cursor-pointer">
          Quay lại
        </button>
      </div>
    );
  }

  const status = getPromotionStatus(promotion);

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark text-[13px]">/</span>
        <Link href="/admin/promotions" className="text-[13px] text-neutral-dark hover:text-accent transition-colors">
          Khuyến mãi
        </Link>
        <span className="text-neutral-dark text-[13px]">/</span>
        <span className="text-[13px] text-primary font-medium truncate max-w-xs">{promotion.name}</span>
      </div>

      {/* Main */}
      <div className="px-6 py-4 flex justify-center">
        <div className="w-full max-w-5xl flex gap-6 items-start">
          {/* ── Left: meta sidebar ── */}
          <div className="w-64 shrink-0 space-y-4">
            {/* Status card */}
            <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-3">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Trạng thái</p>
              <PromotionStatusBadge promotion={promotion} />

              <div className="space-y-0 divide-y divide-neutral text-[12px]">
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-dark">Ưu tiên</span>
                  <span className="font-semibold text-primary">#{promotion.priority}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-dark">Lượt dùng</span>
                  <span className="font-semibold text-primary">
                    {promotion.usedCount}
                    {promotion.usageLimit ? ` / ${promotion.usageLimit}` : ""}
                  </span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-dark">Rules</span>
                  <span className="font-semibold text-primary">{promotion.rules.length}</span>
                </div>
                <div className="py-2 flex items-center justify-between">
                  <span className="text-neutral-dark">Targets</span>
                  <span className="font-semibold text-primary">{promotion.targets.length}</span>
                </div>
              </div>
            </div>

            {/* Time card */}
            <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-2">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays size={12} /> Thời gian
              </p>
              <div className="text-[12px] space-y-1.5">
                <div>
                  <span className="text-neutral-dark block">Bắt đầu</span>
                  <span className="text-primary font-medium">{promotion.startDate ? formatDate(promotion.startDate) : "Không giới hạn"}</span>
                </div>
                <div>
                  <span className="text-neutral-dark block">Kết thúc</span>
                  <span className={`font-medium ${status.value === "expired" ? "text-promotion" : "text-primary"}`}>{promotion.endDate ? formatDate(promotion.endDate) : "Không giới hạn"}</span>
                </div>
                <div>
                  <span className="text-neutral-dark block">Ngày tạo</span>
                  <span className="text-primary">{formatDate(promotion.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Limits card */}
            {(promotion.minOrderValue || promotion.maxDiscountValue) && (
              <div className="bg-neutral-light border border-neutral rounded-xl p-4 space-y-2">
                <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-1.5">
                  <BarChart3 size={12} /> Giới hạn
                </p>
                <div className="text-[12px] space-y-1.5">
                  {promotion.minOrderValue && (
                    <div>
                      <span className="text-neutral-dark block">Đơn tối thiểu</span>
                      <span className="text-primary font-medium">{formatVND(promotion.minOrderValue)}</span>
                    </div>
                  )}
                  {promotion.maxDiscountValue && (
                    <div>
                      <span className="text-neutral-dark block">Giảm tối đa</span>
                      <span className="text-primary font-medium">{formatVND(promotion.maxDiscountValue)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── Right: main content ── */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Header card */}
            <div className="bg-neutral-light border border-neutral rounded-xl px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-[20px] font-bold text-primary truncate">{promotion.name}</h1>
                {promotion.description && <p className="text-[13px] text-neutral-dark mt-1">{promotion.description}</p>}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <PromotionStatusBadge promotion={promotion} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {!editMode && (
                  <>
                    <button
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer"
                    >
                      <Pencil size={13} /> Chỉnh sửa
                    </button>
                    <button
                      onClick={() => {
                        setDeleteError(null);
                        setDeleteOpen(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-promotion/30 rounded-lg text-[13px] text-promotion hover:bg-promotion-light transition-colors cursor-pointer"
                    >
                      <Trash2 size={13} /> Xoá
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Edit mode */}
            {editMode && editForm ? (
              <PromotionForm initialData={editForm} onSubmit={handleSave} saving={saving} error={saveError} submitLabel="Lưu thay đổi" onCancel={handleCancelEdit} />
            ) : (
              <>
                {/* Rules */}
                <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral">
                    <Zap size={14} className="text-accent" />
                    <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Quy tắc ưu đãi ({promotion.rules.length})</span>
                  </div>
                  <div className="p-5 space-y-3">
                    {promotion.rules.length === 0 ? (
                      <p className="text-[13px] text-neutral-dark italic">Chưa có rule nào</p>
                    ) : (
                      promotion.rules.map((rule) => (
                        <div key={rule.id} className="flex items-start gap-3 p-3 rounded-xl border border-neutral">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold shrink-0 ${ACTION_TYPE_COLORS[rule.actionType] ?? "text-neutral-dark bg-neutral-light-active"}`}
                          >
                            {ACTION_TYPE_LABELS[rule.actionType] ?? rule.actionType}
                          </span>
                          <div className="text-[12px] text-primary space-y-0.5">
                            {rule.discountValue !== undefined && (
                              <p>
                                Giảm: <strong>{rule.actionType === "DISCOUNT_PERCENT" ? `${rule.discountValue}%` : formatVND(rule.discountValue)}</strong>
                              </p>
                            )}
                            {rule.buyQuantity !== undefined && (
                              <p>
                                Mua <strong>{rule.buyQuantity}</strong> tặng <strong>{rule.getQuantity}</strong>
                              </p>
                            )}
                            {rule.giftProductVariantId && <p className="font-mono text-[11px] text-neutral-dark">Gift: {rule.giftProductVariantId}</p>}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Targets */}
                <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
                  <div className="flex items-center gap-2 px-5 py-3.5 border-b border-neutral">
                    <Target size={14} className="text-accent" />
                    <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Đối tượng áp dụng ({promotion.targets.length})</span>
                  </div>
                  <div className="p-5 space-y-2">
                    {promotion.targets.length === 0 ? (
                      <p className="text-[13px] text-neutral-dark italic">Chưa có target nào</p>
                    ) : (
                      promotion.targets.map((target) => (
                        <div key={target.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral">
                          <span className="text-[12px] px-2.5 py-1 rounded-lg bg-neutral-light-active text-neutral-dark font-medium shrink-0">
                            {TARGET_TYPE_LABELS[target.targetType] ?? target.targetType}
                          </span>
                          {target.targetId && <span className="font-mono text-[11px] text-neutral-dark truncate">{target.targetId}</span>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Delete modal */}
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
            <h3 className="text-[16px] font-bold text-primary text-center mb-1">Xoá khuyến mãi?</h3>
            <p className="text-[13px] text-primary/60 text-center mb-1">Bạn có chắc chắn muốn xoá</p>
            <p className="text-[14px] font-semibold text-primary text-center mb-5">"{promotion.name}"</p>
            <p className="text-[12px] text-promotion text-center mb-6">Hành động này không thể hoàn tác.</p>
            {deleteError && <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">{deleteError}</div>}
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteOpen(false)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {deleting && <Loader2 size={13} className="animate-spin" />}
                {deleting ? "Đang xoá..." : "Xoá khuyến mãi"}
              </button>
            </div>
          </div>
        }
      />
    </div>
  );
}
