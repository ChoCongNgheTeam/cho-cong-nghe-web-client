"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle, Info } from "lucide-react";
import type {
   Campaign,
   CreateCampaignPayload,
   UpdateCampaignPayload,
   CampaignType,
} from "../campaign.types";
import { CAMPAIGN_TYPE_LABELS } from "../const";
import { utcToVNLocal, vnLocalToUtc } from "@/helpers/timezoneHelpers";
import { useToasty } from "@/components/Toast";

export interface CampaignFormData {
   name: string;
   type: CampaignType | "";
   description: string;
   startDate: string;
   endDate: string;
   isActive: boolean;
}

export const DEFAULT_FORM: CampaignFormData = {
   name: "",
   type: "",
   description: "",
   startDate: "",
   endDate: "",
   isActive: true,
};

export function campaignToForm(c: Campaign): CampaignFormData {
   return {
      name: c.name,
      type: c.type,
      description: c.description ?? "",
      isActive: c.isActive,
      startDate: utcToVNLocal(c.startDate),
      endDate: utcToVNLocal(c.endDate),
   };
}

export function formToCreatePayload(
   form: CampaignFormData,
): CreateCampaignPayload {
   return {
      name: form.name.trim(),
      type: form.type as CampaignType,
      description: form.description.trim() || undefined,
      isActive: form.isActive,
      startDate: vnLocalToUtc(form.startDate),
      endDate: vnLocalToUtc(form.endDate),
   };
}

export function formToUpdatePayload(
   form: CampaignFormData,
): UpdateCampaignPayload {
   return {
      name: form.name.trim(),
      type: form.type as CampaignType,
      description: form.description.trim() || undefined,
      isActive: form.isActive,
      startDate: vnLocalToUtc(form.startDate),
      endDate: vnLocalToUtc(form.endDate),
   };
}

// ── Validation ─────────────────────────────────────────────────────────────────
export interface CampaignFormErrors {
   name?: string;
   type?: string;
   endDate?: string;
   dateRange?: string;
}

function validateCampaignForm(form: CampaignFormData): CampaignFormErrors {
   const errors: CampaignFormErrors = {};
   const now = new Date();

   if (!form.name.trim()) {
      errors.name = "Tên chiến dịch không được để trống";
   } else if (form.name.trim().length < 3) {
      errors.name = "Tên chiến dịch phải có ít nhất 3 ký tự";
   } else if (form.name.trim().length > 200) {
      errors.name = "Tên chiến dịch không được vượt quá 200 ký tự";
   }

   if (!form.type) {
      errors.type = "Vui lòng chọn loại chiến dịch";
   }

   const startDate = form.startDate ? new Date(form.startDate) : null;
   const endDate = form.endDate ? new Date(form.endDate) : null;

   if (endDate && endDate <= now) {
      errors.endDate = "Ngày kết thúc phải ở tương lai";
   }

   if (startDate && endDate) {
      if (endDate <= startDate) {
         errors.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
      } else {
         const diffMinutes =
            (endDate.getTime() - startDate.getTime()) / 1000 / 60;
         if (diffMinutes < 5) {
            errors.dateRange =
               "Khoảng thời gian chiến dịch phải ít nhất 5 phút";
         }
      }
   }

   return errors;
}

function hasErrors(errors: CampaignFormErrors): boolean {
   return Object.keys(errors).length > 0;
}

// ── UI helpers ─────────────────────────────────────────────────────────────────
const inputCls = (hasError?: boolean) =>
   `w-full px-3 py-2 text-[13px] border rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 transition-all placeholder:text-neutral-dark/50 ${
      hasError
         ? "border-promotion/60 focus:ring-promotion/20 focus:border-promotion"
         : "border-neutral focus:ring-accent/30 focus:border-accent"
   }`;

function FieldError({ message }: { message?: string }) {
   if (!message) return null;
   return (
      <p className="flex items-center gap-1 text-[11px] text-promotion mt-1">
         <AlertCircle size={10} className="shrink-0" />
         {message}
      </p>
   );
}

function FormRow({
   label,
   required,
   children,
   hint,
}: {
   label: string;
   required?: boolean;
   children: React.ReactNode;
   hint?: string;
}) {
   return (
      <div className="space-y-1.5">
         <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
            {label}
            {required && (
               <span className="text-promotion normal-case font-normal ml-0.5">
                  *
               </span>
            )}
         </label>
         {children}
         {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
      </div>
   );
}

// ── Component ──────────────────────────────────────────────────────────────────
interface CampaignFormProps {
   initialData: CampaignFormData;
   onSubmit: (form: CampaignFormData) => Promise<void>;
   saving: boolean;
   error: string | null;
   submitLabel?: string;
   onCancel?: () => void;
}

export function CampaignForm({
   initialData,
   onSubmit,
   saving,
   error,
   submitLabel = "Lưu",
   onCancel,
}: CampaignFormProps) {
   const { error: toastError } = useToasty();

   const [form, setForm] = useState<CampaignFormData>(initialData);
   const [fieldErrors, setFieldErrors] = useState<CampaignFormErrors>({});
   const [submitted, setSubmitted] = useState(false);

   useEffect(() => {
      setForm(initialData);
      setFieldErrors({});
      setSubmitted(false);
   }, [initialData]);

   const set = useCallback(
      (key: keyof CampaignFormData, value: any) => {
         setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (submitted) setFieldErrors(validateCampaignForm(next));
            return next;
         });
      },
      [submitted],
   );

   const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
         e.preventDefault();
         setSubmitted(true);

         const errors = validateCampaignForm(form);
         setFieldErrors(errors);

         if (hasErrors(errors)) {
            const msgs = Object.values(errors).filter(Boolean) as string[];
            const first = msgs[0];
            const extra =
               msgs.length > 1 ? ` (+${msgs.length - 1} lỗi khác)` : "";
            toastError(`${first}${extra}`, {
               title: "Dữ liệu không hợp lệ",
               duration: 5000,
            });
            return;
         }

         await onSubmit(form);
      },
      [form, onSubmit, toastError],
   );

   const hasTimeErrors = !!(fieldErrors.endDate || fieldErrors.dateRange);

   return (
      <form onSubmit={handleSubmit} className="space-y-5">
         {/* API error */}
         {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
               <AlertCircle size={15} className="mt-0.5 shrink-0" />
               {error}
            </div>
         )}

         {/* Thông tin cơ bản */}
         <div
            className={`bg-neutral-light border rounded-2xl p-5 space-y-4 transition-colors ${fieldErrors.name || fieldErrors.type ? "border-promotion/40" : "border-neutral"}`}
         >
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest flex items-center gap-2">
               Thông tin cơ bản
               {(fieldErrors.name || fieldErrors.type) && (
                  <AlertCircle size={12} className="text-promotion" />
               )}
            </p>

            <FormRow label="Tên chiến dịch" required>
               <input
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Flash Sale 12.12"
                  className={inputCls(!!fieldErrors.name)}
               />
               <FieldError message={fieldErrors.name} />
            </FormRow>

            <FormRow label="Loại chiến dịch" required>
               <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className={`${inputCls(!!fieldErrors.type)} cursor-pointer`}
               >
                  <option value="">-- Chọn loại --</option>
                  {Object.entries(CAMPAIGN_TYPE_LABELS).map(
                     ([value, label]) => (
                        <option key={value} value={value}>
                           {label}
                        </option>
                     ),
                  )}
               </select>
               <FieldError message={fieldErrors.type} />
            </FormRow>

            <FormRow label="Mô tả">
               <textarea
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Mô tả ngắn về chiến dịch..."
                  rows={3}
                  className={`${inputCls()} resize-none`}
               />
            </FormRow>
         </div>

         {/* Thời gian */}
         <div
            className={`bg-neutral-light border rounded-2xl p-5 space-y-4 transition-colors ${hasTimeErrors ? "border-promotion/40" : "border-neutral"}`}
         >
            <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest flex items-center gap-2">
               Thời gian
               {hasTimeErrors && (
                  <AlertCircle size={12} className="text-promotion" />
               )}
            </p>

            <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
               <Info size={13} className="text-accent shrink-0" />
               <p className="text-[11px] text-accent">
                  Thời gian nhập theo <strong>giờ Việt Nam (GMT+7)</strong>. Hệ
                  thống tự chuyển đổi khi lưu.
               </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <FormRow
                  label="Ngày bắt đầu (giờ VN)"
                  hint="Để trống = không giới hạn"
               >
                  <input
                     type="datetime-local"
                     value={form.startDate}
                     onChange={(e) => set("startDate", e.target.value)}
                     className={inputCls()}
                  />
               </FormRow>
               <FormRow
                  label="Ngày kết thúc (giờ VN)"
                  hint="Để trống = không giới hạn"
               >
                  <input
                     type="datetime-local"
                     value={form.endDate}
                     onChange={(e) => set("endDate", e.target.value)}
                     className={inputCls(!!fieldErrors.endDate)}
                  />
                  <FieldError message={fieldErrors.endDate} />
               </FormRow>
            </div>

            {fieldErrors.dateRange && (
               <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                  <AlertCircle size={12} className="shrink-0" />
                  {fieldErrors.dateRange}
               </div>
            )}
         </div>

         {/* Cài đặt */}
         <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
            <label className="flex items-start gap-3 cursor-pointer w-fit">
               <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer"
               />
               <div>
                  <p className="text-[13px] font-medium text-primary">
                     Đang hoạt động
                  </p>
                  <p className="text-[11px] text-neutral-dark">
                     Chiến dịch được hiển thị và áp dụng
                  </p>
               </div>
            </label>
         </div>

         {/* Actions */}
         <div className="flex items-center gap-3 pt-1">
            {onCancel && (
               <button
                  type="button"
                  onClick={onCancel}
                  disabled={saving}
                  className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
               >
                  Huỷ
               </button>
            )}
            <button
               type="submit"
               disabled={saving}
               className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
               {saving && <Loader2 size={14} className="animate-spin" />}
               {saving ? "Đang lưu..." : submitLabel}
            </button>
         </div>
      </form>
   );
}
