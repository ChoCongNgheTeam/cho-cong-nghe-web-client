"use client";

/**
 * DIFF so với file gốc:
 * 1. Import thêm `CampaignCategoryManager` thay cho `CategoryImageEditor`
 * 2. Thêm state `allCategories` + fetch danh sách tất cả category từ BE
 * 3. Thay khối render "Danh mục trong chiến dịch" bằng <CampaignCategoryManager>
 *
 * Các phần khác giữ nguyên 100%.
 */

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Link from "next/link";
import {
   ArrowLeft,
   Megaphone,
   Pencil,
   Loader2,
   XCircle,
   Trash2,
   CheckCircle2,
   Clock,
   Tag,
   X,
} from "lucide-react";
import { Popzy } from "@/components/Modal";
import {
   getCampaign,
   updateCampaign,
   deleteCampaign,
} from "../_libs/campaigns";
import {
   CampaignForm,
   campaignToForm,
   formToUpdatePayload,
   type CampaignFormData,
} from "../components/CampaignForm";
import {
   CampaignStatusBadge,
   getCampaignStatus,
} from "../components/CampaignStatusBadge";
import { CAMPAIGN_TYPE_LABELS, CAMPAIGN_TYPE_COLORS } from "../const";
import type { Campaign } from "../campaign.types";
import { formatDate } from "@/helpers";
import { useToasty } from "@/components/Toast";

// 👇 THAY CategoryImageEditor bằng CampaignCategoryManager
import { CampaignCategoryManager } from "../components/CampaignCategoryManager";
import { getAllCategories } from "../../categories/_libs/categories";

export default function CampaignDetailPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const isEditMode = searchParams.get("edit") === "true";
   const params = useParams();
   const id = params.id as string;

   const { success, error: toastError } = useToasty();

   const [campaign, setCampaign] = useState<Campaign | null>(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   // 👇 Danh sách tất cả categories để chọn thêm vào campaign
   const [allCategories, setAllCategories] = useState<
      Array<{ id: string; name: string; slug: string; imageUrl?: string }>
   >([]);

   const [saving, setSaving] = useState(false);
   const [saveError, setSaveError] = useState<string | null>(null);

   const [deleteOpen, setDeleteOpen] = useState(false);
   const [deleting, setDeleting] = useState(false);
   const [deleteError, setDeleteError] = useState<string | null>(null);

   const fetchCampaign = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const res = await getCampaign(id);
         setCampaign(res.data);
      } catch (e: any) {
         setError(e?.message ?? "Không thể tải chiến dịch");
      } finally {
         setLoading(false);
      }
   }, [id]);

   // 👇 Fetch tất cả categories để hiển thị trong panel "Thêm danh mục"
   const fetchAllCategories = useCallback(async () => {
      try {
         const res = await getAllCategories();
         setAllCategories(
            (res.data ?? []).map((c) => ({
               id: c.id,
               name: c.name,
               slug: c.slug,
               imageUrl: c.imageUrl ?? undefined, // null → undefined
            })),
         );
      } catch {
         // silent — không block UI nếu fail
      }
   }, []);

   useEffect(() => {
      fetchCampaign();
      fetchAllCategories();
   }, [fetchCampaign, fetchAllCategories]);

   const handleSave = async (form: CampaignFormData) => {
      setSaving(true);
      setSaveError(null);
      try {
         const payload = formToUpdatePayload(form);
         const res = await updateCampaign(id, payload);
         setCampaign(res.data);
         success("Cập nhật chiến dịch thành công!");
         router.push(`/admin/campaigns/${id}`);
      } catch (e: any) {
         const msg = e?.message ?? "Không thể cập nhật chiến dịch";
         setSaveError(msg);
         toastError(msg);
      } finally {
         setSaving(false);
      }
   };

   const handleDelete = async () => {
      setDeleting(true);
      setDeleteError(null);
      try {
         await deleteCampaign(id);
         success("Đã xoá chiến dịch thành công!");
         router.push("/admin/campaigns");
      } catch (e: any) {
         const msg = e?.message ?? "Không thể xoá chiến dịch";
         setDeleteError(msg);
         toastError(msg);
      } finally {
         setDeleting(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-neutral-light flex items-center justify-center">
            <Loader2 size={28} className="animate-spin text-accent" />
         </div>
      );
   }

   if (error || !campaign) {
      return (
         <div className="min-h-screen bg-neutral-light flex flex-col items-center justify-center gap-3">
            <XCircle size={36} className="text-promotion opacity-50" />
            <p className="text-[13px] text-neutral-dark">
               {error ?? "Không tìm thấy chiến dịch"}
            </p>
            <Link
               href="/admin/campaigns"
               className="px-4 py-2 rounded-lg bg-accent text-white text-[13px]"
            >
               Quay lại danh sách
            </Link>
         </div>
      );
   }
   const status = getCampaignStatus(campaign); // đã có sẵn ở dưới
   const canDelete = !campaign.isActive || status.value === "expired";

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
            <Link
               href="/admin/campaigns"
               className="text-[13px] text-neutral-dark hover:text-accent"
            >
               Chiến dịch
            </Link>
            <span className="text-neutral-dark text-[13px]">/</span>
            <span className="text-[13px] text-primary font-medium line-clamp-1 max-w-xs">
               {campaign.name}
            </span>
         </div>

         <div className="px-6 py-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ── Left: Info card ── */}
            <div className="lg:col-span-1 space-y-4">
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                     <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                        <Megaphone size={18} />
                     </div>
                     <div className="flex gap-2">
                        <Link
                           href={`/admin/campaigns/${campaign.id}?edit=true`}
                           className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-accent-light hover:text-accent transition-colors"
                           title="Chỉnh sửa"
                        >
                           <Pencil size={14} />
                        </Link>
                       <button
                        onClick={() => canDelete && setDeleteOpen(true)}
                        disabled={!canDelete}
                        title={canDelete ? "Xoá" : "Tắt chiến dịch trước khi xóa"}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                           canDelete
                              ? "text-neutral-dark hover:bg-promotion-light hover:text-promotion cursor-pointer"
                              : "text-neutral-dark/25 cursor-not-allowed"
                        }`}
                        >
                        <Trash2 size={14} />
                        </button>
                     </div>
                  </div>

                  <div>
                     <h2 className="text-[16px] font-bold text-primary mb-1">
                        {campaign.name}
                     </h2>
                     <p className="text-[11px] text-neutral-dark font-mono">
                        {campaign.slug}
                     </p>
                  </div>

                  {campaign.description && (
                     <p className="text-[13px] text-neutral-dark leading-relaxed">
                        {campaign.description}
                     </p>
                  )}

                  <div className="flex flex-wrap gap-2">
                     <CampaignStatusBadge campaign={campaign} />
                     <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${CAMPAIGN_TYPE_COLORS[campaign.type]}`}
                     >
                        {CAMPAIGN_TYPE_LABELS[campaign.type]}
                     </span>
                  </div>
               </div>

               <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-3">
                  <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">
                     Chi tiết
                  </p>
                  <div className="space-y-2.5">
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                           <Clock size={12} /> Bắt đầu
                        </span>
                        <span className="text-[12px] text-primary font-medium">
                           {campaign.startDate ? (
                              formatDate(campaign.startDate)
                           ) : (
                              <span className="italic text-neutral-dark/50">
                                 Không giới hạn
                              </span>
                           )}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                           <Clock size={12} /> Kết thúc
                        </span>
                        <span className="text-[12px] text-primary font-medium">
                           {campaign.endDate ? (
                              formatDate(campaign.endDate)
                           ) : (
                              <span className="italic text-neutral-dark/50">
                                 Không giới hạn
                              </span>
                           )}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-dark flex items-center gap-1.5">
                           <Tag size={12} /> Danh mục
                        </span>
                        <span className="text-[12px] text-primary font-medium">
                           {campaign.categories.length}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-dark">
                           Ngày tạo
                        </span>
                        <span className="text-[12px] text-primary">
                           {formatDate(campaign.createdAt)}
                        </span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-[12px] text-neutral-dark">
                           Cập nhật
                        </span>
                        <span className="text-[12px] text-primary">
                           {formatDate(campaign.updatedAt)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* ── 👇 THAY CategoryImageEditor bằng CampaignCategoryManager ── */}
               <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
                  <CampaignCategoryManager
                     campaignId={campaign.id}
                     categories={campaign.categories}
                     availableCategories={allCategories}
                     onChanged={(updated) =>
                        setCampaign((prev) =>
                           prev ? { ...prev, categories: updated } : prev,
                        )
                     }
                  />
               </div>
            </div>

            {/* ── Right: Edit form (giữ nguyên) ── */}
            <div className="lg:col-span-2">
               <div className="bg-neutral-light border border-neutral rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                     <h3 className="text-[15px] font-bold text-primary">
                        {isEditMode
                           ? "Chỉnh sửa thông tin"
                           : "Thông tin chiến dịch"}
                     </h3>
                     {!isEditMode && (
                        <Link
                           href={`/admin/campaigns/${campaign.id}?edit=true`}
                           className="flex items-center gap-1.5 px-3 py-1.5 border border-neutral rounded-lg text-[12px] text-primary hover:bg-neutral-light-active transition-colors"
                        >
                           <Pencil size={13} /> Chỉnh sửa
                        </Link>
                     )}
                  </div>

                  {isEditMode ? (
                     <CampaignForm
                        initialData={campaignToForm(campaign)}
                        onSubmit={handleSave}
                        saving={saving}
                        error={saveError}
                        submitLabel="Lưu thay đổi"
                        onCancel={() =>
                           router.push(`/admin/campaigns/${campaign.id}`)
                        }
                     />
                  ) : (
                     <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                                 Tên chiến dịch
                              </p>
                              <p className="text-[13px] text-primary">
                                 {campaign.name}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                                 Loại
                              </p>
                              <span
                                 className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-semibold ${CAMPAIGN_TYPE_COLORS[campaign.type]}`}
                              >
                                 {CAMPAIGN_TYPE_LABELS[campaign.type]}
                              </span>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                              Mô tả
                           </p>
                           <p className="text-[13px] text-primary">
                              {campaign.description || (
                                 <span className="italic text-neutral-dark/50">
                                    Không có mô tả
                                 </span>
                              )}
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                                 Ngày bắt đầu
                              </p>
                              <p className="text-[13px] text-primary">
                                 {campaign.startDate ? (
                                    formatDate(campaign.startDate)
                                 ) : (
                                    <span className="italic text-neutral-dark/50">
                                       Không giới hạn
                                    </span>
                                 )}
                              </p>
                           </div>
                           <div className="space-y-1">
                              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                                 Ngày kết thúc
                              </p>
                              <p className="text-[13px] text-primary">
                                 {campaign.endDate ? (
                                    formatDate(campaign.endDate)
                                 ) : (
                                    <span className="italic text-neutral-dark/50">
                                       Không giới hạn
                                    </span>
                                 )}
                              </p>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
                              Trạng thái
                           </p>
                           <div className="flex items-center gap-2">
                              <CampaignStatusBadge campaign={campaign} />
                              {campaign.isActive ? (
                                 <span className="flex items-center gap-1 text-[12px] text-emerald-600">
                                    <CheckCircle2 size={12} /> Đang bật
                                 </span>
                              ) : (
                                 <span className="flex items-center gap-1 text-[12px] text-orange-500">
                                    <X size={12} /> Đang tắt
                                 </span>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>
            </div>
         </div>

         {/* ── Delete Modal (giữ nguyên) ── */}
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
                  <h3 className="text-[16px] font-bold text-primary text-center mb-1">
                     Xoá chiến dịch?
                  </h3>
                  <p className="text-[13px] text-primary/60 text-center mb-1">
                     Bạn có chắc chắn muốn xoá
                  </p>
                  <p className="text-[14px] font-semibold text-primary text-center mb-5">
                     "{campaign.name}"
                  </p>
                  <p className="text-[12px] text-promotion text-center mb-6">
                     Chiến dịch sẽ được chuyển vào thùng rác.
                  </p>
                  {deleteError && (
                     <div className="mb-4 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px] text-center">
                        {deleteError}
                     </div>
                  )}
                  <div className="flex gap-2">
                     <button
                        onClick={() => setDeleteOpen(false)}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
                     >
                        Huỷ
                     </button>
                     <button
                        onClick={handleDelete}
                        disabled={deleting}
                        className="flex-1 px-4 py-2.5 bg-promotion hover:bg-promotion/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl cursor-pointer flex items-center justify-center gap-1.5"
                     >
                        {deleting && (
                           <Loader2 size={13} className="animate-spin" />
                        )}
                        {deleting ? "Đang xoá..." : "Xoá chiến dịch"}
                     </button>
                  </div>
               </div>
            }
         />
      </div>
   );
}
