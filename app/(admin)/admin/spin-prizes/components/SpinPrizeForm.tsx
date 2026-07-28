"use client";

import { useEffect, useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { SingleSelectDropdown, type EntityOption } from "@/components/admin/shared/EntitySelect";
import { getAllVouchers } from "../../vouchers/_lib/vouchers";
import type { VoucherCard } from "../../vouchers/voucher.types";
import type { SpinPrize } from "../spin-prize.types";

export interface SpinPrizeFormData {
  label: string;
  colorHex: string;
  voucherOption: EntityOption | null;
  weight: number;
  unlimitedBudget: boolean;
  totalBudget: number;
  order: number;
  isActive: boolean;
}

export const DEFAULT_FORM: SpinPrizeFormData = {
  label: "",
  colorHex: "#F97316",
  voucherOption: null,
  weight: 1,
  unlimitedBudget: true,
  totalBudget: 10,
  order: 0,
  isActive: true,
};

export function prizeToForm(p: SpinPrize): SpinPrizeFormData {
  return {
    label: p.label,
    colorHex: p.colorHex ?? "#F97316",
    voucherOption: p.voucher ? { id: p.voucher.id, name: p.voucher.code } : null,
    weight: p.weight,
    unlimitedBudget: p.totalBudget === null,
    totalBudget: p.totalBudget ?? 10,
    order: p.order,
    isActive: p.isActive,
  };
}

export function formToCreatePayload(form: SpinPrizeFormData) {
  return {
    label: form.label.trim(),
    colorHex: form.colorHex || undefined,
    voucherId: form.voucherOption?.id,
    weight: form.weight,
    totalBudget: form.unlimitedBudget ? undefined : form.totalBudget,
    order: form.order,
    isActive: form.isActive,
  };
}

export function formToUpdatePayload(form: SpinPrizeFormData) {
  return {
    label: form.label.trim(),
    colorHex: form.colorHex,
    voucherId: form.voucherOption?.id ?? null,
    weight: form.weight,
    totalBudget: form.unlimitedBudget ? null : form.totalBudget,
    order: form.order,
    isActive: form.isActive,
  };
}

const inputCls =
  "w-full px-3 py-2 text-[13px] border border-neutral rounded-xl text-primary bg-neutral-light focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

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

interface SpinPrizeFormProps {
  initialData: SpinPrizeFormData;
  onSubmit: (form: SpinPrizeFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel?: string;
  onCancel?: () => void;
}

export function SpinPrizeForm({ initialData, onSubmit, saving, error, submitLabel = "Lưu", onCancel }: SpinPrizeFormProps) {
  const [form, setForm] = useState<SpinPrizeFormData>(initialData);
  const [vouchers, setVouchers] = useState<EntityOption[]>([]);

  useEffect(() => {
    getAllVouchers({ limit: 100, isActive: true })
      .then((res) =>
        setVouchers(
          res.data
            .filter((v: VoucherCard) => v.isAvailable && !v.isExpired)
            .map((v: VoucherCard) => ({
              id: v.id,
              name: `${v.code} (${v.discountType === "DISCOUNT_PERCENT" ? v.discountValue + "%" : v.discountValue.toLocaleString("vi-VN") + "đ"})`,
            })),
        ),
      )
      .catch(() => {});
  }, []);

  const set = <K extends keyof SpinPrizeFormData>(key: K, value: SpinPrizeFormData[K]) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <FormRow label="Tên phần thưởng" required>
        <input value={form.label} onChange={(e) => set("label", e.target.value)} placeholder='Vd: "Voucher 50K", "Chúc may mắn lần sau"' className={inputCls} required />
      </FormRow>

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Màu ô trên vòng quay">
          <div className="flex items-center gap-2">
            <input type="color" value={form.colorHex} onChange={(e) => set("colorHex", e.target.value)} className="w-10 h-9 rounded-lg border border-neutral cursor-pointer bg-neutral-light" />
            <input value={form.colorHex} onChange={(e) => set("colorHex", e.target.value)} className={inputCls} />
          </div>
        </FormRow>

        <FormRow label="Trọng số xác suất" required hint="Số càng lớn, tỉ lệ trúng càng cao">
          <input type="number" min={1} value={form.weight} onChange={(e) => set("weight", Math.max(1, Number(e.target.value)))} className={inputCls} required />
        </FormRow>
      </div>

      <FormRow label="Voucher liên kết" hint="Chỉ hiện voucher đang hoạt động và còn hạn. Để trống = phần thưởng không có voucher (vd 'Chúc may mắn lần sau')">
        <SingleSelectDropdown value={form.voucherOption} onChange={(v) => set("voucherOption", v)} options={vouchers} placeholder="Không chọn voucher" />
      </FormRow>

      <div className="grid grid-cols-2 gap-4 items-end">
        <label className="flex items-center gap-2 px-3 py-2.5 border border-neutral rounded-xl cursor-pointer h-[42px]">
          <input type="checkbox" checked={form.unlimitedBudget} onChange={(e) => set("unlimitedBudget", e.target.checked)} className="w-4 h-4 accent-accent cursor-pointer" />
          <span className="text-[13px] text-primary">Không giới hạn số lượt trúng</span>
        </label>

        {!form.unlimitedBudget && (
          <FormRow label="Ngân sách (số lượt trúng tối đa)">
            <input type="number" min={1} value={form.totalBudget} onChange={(e) => set("totalBudget", Math.max(1, Number(e.target.value)))} className={inputCls} />
          </FormRow>
        )}
      </div>

      {form.unlimitedBudget && (
        <p className="text-[11px] text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
          ⚠️ Cần giữ lại ít nhất 1 phần thưởng "Không giới hạn" đang hoạt động — nếu tắt hết, hệ thống sẽ chặn thao tác này để tránh vòng quay bị trống.
        </p>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FormRow label="Thứ tự hiển thị">
          <input type="number" min={0} value={form.order} onChange={(e) => set("order", Math.max(0, Number(e.target.value)))} className={inputCls} />
        </FormRow>

        <label className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl cursor-pointer h-[42px]">
          <span className="text-[13px] text-primary">Hoạt động</span>
          <button type="button" onClick={() => set("isActive", !form.isActive)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${form.isActive ? "bg-accent" : "bg-neutral"}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form.isActive ? "left-5" : "left-0.5"}`} />
          </button>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-1">
        {onCancel && (
          <button type="button" onClick={onCancel} disabled={saving} className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] font-medium text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50">
            Huỷ
          </button>
        )}
        <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer">
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
