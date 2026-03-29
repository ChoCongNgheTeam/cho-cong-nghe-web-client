"use client";

import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Info } from "lucide-react";
import type { Campaign, CreateCampaignPayload, UpdateCampaignPayload, CampaignType } from "../campaign.types";
import { CAMPAIGN_TYPE_LABELS } from "../const";
import { utcToVNLocal, vnLocalToUtc } from "@/helpers/timezoneHelpers";

export interface CampaignFormData {
  name: string;
  type: CampaignType | "";
  description: string;
  startDate: string;
  endDate: string; // "YYYY-MM-DDTHH:mm" giờ VN
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
    startDate: utcToVNLocal(c.startDate), // UTC → VN (+7h)
    endDate: utcToVNLocal(c.endDate),
  };
}

export function formToCreatePayload(form: CampaignFormData): CreateCampaignPayload {
  return {
    name: form.name.trim(),
    type: form.type as CampaignType,
    description: form.description.trim() || undefined,
    isActive: form.isActive,
    startDate: vnLocalToUtc(form.startDate), // VN → UTC (-7h)
    endDate: vnLocalToUtc(form.endDate),
  };
}

export function formToUpdatePayload(form: CampaignFormData): UpdateCampaignPayload {
  return {
    name: form.name.trim(),
    type: form.type as CampaignType,
    description: form.description.trim() || undefined,
    isActive: form.isActive,
    startDate: vnLocalToUtc(form.startDate),
    endDate: vnLocalToUtc(form.endDate),
  };
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all placeholder:text-neutral-dark/50";

function FormRow({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
        {label} {required && <span className="text-promotion normal-case font-normal">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-neutral-dark/70">{hint}</p>}
    </div>
  );
}

interface CampaignFormProps {
  initialData: CampaignFormData;
  onSubmit: (form: CampaignFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function CampaignForm({ initialData, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: CampaignFormProps) {
  const [form, setForm] = useState<CampaignFormData>(initialData);
  useEffect(() => {
    setForm(initialData);
  }, [initialData]);

  const set = (key: keyof CampaignFormData, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form);
      }}
      className="space-y-5"
    >
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Thông tin cơ bản */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thông tin cơ bản</p>
        <FormRow label="Tên chiến dịch" required>
          <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Flash Sale 12.12" className={inputCls} required />
        </FormRow>
        <FormRow label="Loại chiến dịch" required>
          <select value={form.type} onChange={(e) => set("type", e.target.value)} className={`${inputCls} cursor-pointer`} required>
            <option value="">-- Chọn loại --</option>
            {Object.entries(CAMPAIGN_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Mô tả">
          <textarea value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Mô tả ngắn về chiến dịch..." rows={3} className={`${inputCls} resize-none`} />
        </FormRow>
      </div>

      {/* Thời gian */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5 space-y-4">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Thời gian</p>
        <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
          <Info size={13} className="text-accent shrink-0" />
          <p className="text-[11px] text-accent">
            Thời gian nhập theo <strong>giờ Việt Nam (GMT+7)</strong>. Hệ thống tự chuyển đổi khi lưu.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormRow label="Ngày bắt đầu (giờ VN)" hint="Để trống = không giới hạn">
            <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
          </FormRow>
          <FormRow label="Ngày kết thúc (giờ VN)" hint="Để trống = không giới hạn">
            <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
          </FormRow>
        </div>
      </div>

      {/* Cài đặt */}
      <div className="bg-neutral-light border border-neutral rounded-2xl p-5">
        <label className="flex items-start gap-3 cursor-pointer w-fit">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="mt-0.5 w-4 h-4 rounded accent-accent cursor-pointer" />
          <div>
            <p className="text-[13px] font-medium text-primary">Đang hoạt động</p>
            <p className="text-[11px] text-neutral-dark">Chiến dịch được hiển thị và áp dụng</p>
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
          disabled={saving || !form.name.trim() || !form.type}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
