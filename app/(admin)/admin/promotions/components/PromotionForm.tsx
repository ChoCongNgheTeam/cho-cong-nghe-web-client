"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp, Info, Loader2, AlertCircle } from "lucide-react";
import type { Promotion, PromotionActionType, TargetType } from "../promotion.types";
import type { CreatePromotionPayload, UpdatePromotionPayload } from "../promotion.types";
import { ACTION_TYPE_LABELS, TARGET_TYPE_LABELS } from "../const";

// ── Toggle ─────────────────────────────────────────────────────────────────────
function Toggle({ value, onChange, color = "bg-accent" }: { value: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? color : "bg-neutral"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

// ── Label ──────────────────────────────────────────────────────────────────────
function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">{children}</label>;
}

// ── Input ──────────────────────────────────────────────────────────────────────
const inputCls =
  "w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all";

const selectCls =
  "w-full px-3 py-2 text-[13px] bg-neutral-light border border-neutral rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all cursor-pointer";

// ── Types ──────────────────────────────────────────────────────────────────────
export interface RuleForm {
  actionType: PromotionActionType;
  discountValue: string;
  buyQuantity: string;
  getQuantity: string;
  giftProductVariantId: string;
}

export interface TargetForm {
  targetType: TargetType;
  targetId: string;
}

export interface PromotionFormData {
  name: string;
  description: string;
  priority: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  minOrderValue: string;
  maxDiscountValue: string;
  usageLimit: string;
  rules: RuleForm[];
  targets: TargetForm[];
}

export const DEFAULT_FORM: PromotionFormData = {
  name: "",
  description: "",
  priority: "0",
  isActive: true,
  startDate: "",
  endDate: "",
  minOrderValue: "",
  maxDiscountValue: "",
  usageLimit: "",
  rules: [{ actionType: "DISCOUNT_PERCENT", discountValue: "", buyQuantity: "", getQuantity: "", giftProductVariantId: "" }],
  targets: [{ targetType: "ALL", targetId: "" }],
};

// Thay promotionToForm:
export function promotionToForm(p: Promotion): PromotionFormData {
  const toVNDatetimeLocal = (d?: string) => {
    if (!d) return "";
    // UTC → VN local (để hiển thị đúng trong datetime-local input)
    const vnDate = new Date(new Date(d).toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
    // Format YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${vnDate.getFullYear()}-${pad(vnDate.getMonth() + 1)}-${pad(vnDate.getDate())}T${pad(vnDate.getHours())}:${pad(vnDate.getMinutes())}`;
  };

  return {
    name: p.name,
    description: p.description ?? "",
    priority: String(p.priority),
    isActive: p.isActive,
    startDate: toVNDatetimeLocal(p.startDate),
    endDate: toVNDatetimeLocal(p.endDate),
    minOrderValue: p.minOrderValue !== undefined ? String(p.minOrderValue) : "",
    maxDiscountValue: p.maxDiscountValue !== undefined ? String(p.maxDiscountValue) : "",
    usageLimit: p.usageLimit !== undefined ? String(p.usageLimit) : "",
    rules: p.rules.map((r) => ({
      actionType: r.actionType,
      discountValue: r.discountValue !== undefined ? String(r.discountValue) : "",
      buyQuantity: r.buyQuantity !== undefined ? String(r.buyQuantity) : "",
      getQuantity: r.getQuantity !== undefined ? String(r.getQuantity) : "",
      giftProductVariantId: r.giftProductVariantId ?? "",
    })),
    targets: p.targets.map((t) => ({
      targetType: t.targetType,
      targetId: t.targetId ?? "",
    })),
  };
}

// Thay formToPayload:
export function formToPayload(form: PromotionFormData): CreatePromotionPayload {
  // VN local datetime-local string → UTC ISO string
  const fromVNLocal = (localStr: string): string | undefined => {
    if (!localStr) return undefined;
    // datetime-local = "2026-03-22T17:00" → treat as VN time
    return new Date(localStr + ":00+07:00").toISOString();
  };

  return {
    name: form.name.trim(),
    description: form.description.trim() || undefined,
    priority: Number(form.priority) || 0,
    isActive: form.isActive,
    startDate: fromVNLocal(form.startDate),
    endDate: fromVNLocal(form.endDate),
    minOrderValue: form.minOrderValue ? Number(form.minOrderValue) : undefined,
    maxDiscountValue: form.maxDiscountValue ? Number(form.maxDiscountValue) : undefined,
    usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
    rules: form.rules.map((r) => ({
      actionType: r.actionType,
      discountValue: r.discountValue ? Number(r.discountValue) : undefined,
      buyQuantity: r.buyQuantity ? Number(r.buyQuantity) : undefined,
      getQuantity: r.getQuantity ? Number(r.getQuantity) : undefined,
      giftProductVariantId: r.giftProductVariantId || undefined,
    })),
    targets: form.targets.map((t) => ({
      targetType: t.targetType,
      targetId: t.targetId || undefined,
    })),
  };
}

// ── Rule card ──────────────────────────────────────────────────────────────────
function RuleCard({
  rule,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  rule: RuleForm;
  index: number;
  onChange: (index: number, field: keyof RuleForm, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const showDiscount = rule.actionType === "DISCOUNT_PERCENT" || rule.actionType === "DISCOUNT_FIXED";
  const showBuyXGetY = rule.actionType === "BUY_X_GET_Y";
  const showGift = rule.actionType === "GIFT_PRODUCT";

  return (
    <div className="border border-neutral rounded-xl p-4 space-y-3 bg-neutral-light">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Rule #{index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Action type */}
      <div>
        <FieldLabel>Loại ưu đãi</FieldLabel>
        <select value={rule.actionType} onChange={(e) => onChange(index, "actionType", e.target.value)} className={selectCls}>
          {(Object.keys(ACTION_TYPE_LABELS) as PromotionActionType[]).map((k) => (
            <option key={k} value={k}>
              {ACTION_TYPE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {/* Discount value */}
      {showDiscount && (
        <div>
          <FieldLabel>Giá trị giảm{rule.actionType === "DISCOUNT_PERCENT" ? " (%)" : " (VNĐ)"}</FieldLabel>
          <input
            type="number"
            min={0}
            max={rule.actionType === "DISCOUNT_PERCENT" ? 100 : undefined}
            value={rule.discountValue}
            onChange={(e) => onChange(index, "discountValue", e.target.value)}
            placeholder={rule.actionType === "DISCOUNT_PERCENT" ? "VD: 20" : "VD: 50000"}
            className={inputCls}
          />
        </div>
      )}

      {/* Buy X Get Y */}
      {showBuyXGetY && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel>Mua số lượng (X)</FieldLabel>
            <input type="number" min={1} value={rule.buyQuantity} onChange={(e) => onChange(index, "buyQuantity", e.target.value)} placeholder="VD: 2" className={inputCls} />
          </div>
          <div>
            <FieldLabel>Tặng số lượng (Y)</FieldLabel>
            <input type="number" min={1} value={rule.getQuantity} onChange={(e) => onChange(index, "getQuantity", e.target.value)} placeholder="VD: 1" className={inputCls} />
          </div>
        </div>
      )}

      {/* Gift product */}
      {showGift && (
        <div>
          <FieldLabel>ID variant sản phẩm quà tặng</FieldLabel>
          <input type="text" value={rule.giftProductVariantId} onChange={(e) => onChange(index, "giftProductVariantId", e.target.value)} placeholder="UUID của product variant" className={inputCls} />
        </div>
      )}
    </div>
  );
}

// ── Target card ────────────────────────────────────────────────────────────────
function TargetCard({
  target,
  index,
  onChange,
  onRemove,
  canRemove,
}: {
  target: TargetForm;
  index: number;
  onChange: (index: number, field: keyof TargetForm, value: string) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}) {
  const needsId = target.targetType !== "ALL";

  const placeholders: Record<string, string> = {
    PRODUCT: "UUID của product",
    CATEGORY: "UUID của category",
    BRAND: "UUID của brand",
  };

  return (
    <div className="border border-neutral rounded-xl p-4 space-y-3 bg-neutral-light">
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">Target #{index + 1}</span>
        {canRemove && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-6 h-6 flex items-center justify-center rounded-lg text-neutral-dark hover:bg-promotion-light hover:text-promotion transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <div>
        <FieldLabel>Áp dụng cho</FieldLabel>
        <select value={target.targetType} onChange={(e) => onChange(index, "targetType", e.target.value)} className={selectCls}>
          {(Object.keys(TARGET_TYPE_LABELS) as TargetType[]).map((k) => (
            <option key={k} value={k}>
              {TARGET_TYPE_LABELS[k]}
            </option>
          ))}
        </select>
      </div>

      {needsId && (
        <div>
          <FieldLabel>ID đối tượng</FieldLabel>
          <input type="text" value={target.targetId} onChange={(e) => onChange(index, "targetId", e.target.value)} placeholder={placeholders[target.targetType] ?? "UUID"} className={inputCls} />
        </div>
      )}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, children, collapsible = false }: { title: string; children: React.ReactNode; collapsible?: boolean }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => collapsible && setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-neutral ${collapsible ? "cursor-pointer hover:bg-neutral-light-active" : "cursor-default"}`}
      >
        <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">{title}</span>
        {collapsible && (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  );
}

// ── Main form component ────────────────────────────────────────────────────────
interface PromotionFormProps {
  initialData?: PromotionFormData;
  onSubmit: (data: PromotionFormData) => Promise<void>;
  saving: boolean;
  error: string | null;
  submitLabel: string;
  onCancel?: () => void;
}

export function PromotionForm({ initialData = DEFAULT_FORM, onSubmit, saving, error, submitLabel, onCancel }: PromotionFormProps) {
  const [form, setForm] = useState<PromotionFormData>(initialData);

  const set = useCallback(<K extends keyof PromotionFormData>(field: K, value: PromotionFormData[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  // ── Rules handlers ─────────────────────────────────────────────────────────
  const addRule = () =>
    setForm((prev) => ({
      ...prev,
      rules: [...prev.rules, { actionType: "DISCOUNT_PERCENT", discountValue: "", buyQuantity: "", getQuantity: "", giftProductVariantId: "" }],
    }));

  const removeRule = (i: number) => setForm((prev) => ({ ...prev, rules: prev.rules.filter((_, idx) => idx !== i) }));

  const updateRule = (i: number, field: keyof RuleForm, value: string) =>
    setForm((prev) => {
      const rules = [...prev.rules];
      rules[i] = { ...rules[i], [field]: value };
      return { ...prev, rules };
    });

  // ── Targets handlers ───────────────────────────────────────────────────────
  const addTarget = () =>
    setForm((prev) => ({
      ...prev,
      targets: [...prev.targets, { targetType: "ALL", targetId: "" }],
    }));

  const removeTarget = (i: number) => setForm((prev) => ({ ...prev, targets: prev.targets.filter((_, idx) => idx !== i) }));

  const updateTarget = (i: number, field: keyof TargetForm, value: string) =>
    setForm((prev) => {
      const targets = [...prev.targets];
      targets[i] = { ...targets[i], [field]: value };
      return { ...prev, targets };
    });

  const handleSubmit = async () => {
    await onSubmit(form);
  };

  return (
    <div className="space-y-4">
      {/* ── Basic info ── */}
      <Section title="Thông tin cơ bản">
        <div className="space-y-4">
          {/* Name */}
          <div>
            <FieldLabel>Tên khuyến mãi *</FieldLabel>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="VD: Giảm 20% mùa hè" className={inputCls} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Mô tả</FieldLabel>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn về chương trình khuyến mãi"
              className={`${inputCls} resize-none`}
            />
          </div>

          {/* Priority + Active */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Độ ưu tiên</FieldLabel>
              <input type="number" value={form.priority} onChange={(e) => set("priority", e.target.value)} placeholder="0 = cao nhất" className={inputCls} />
              <p className="text-[11px] text-neutral-dark mt-1 flex items-center gap-1">
                <Info size={11} /> Số càng nhỏ, ưu tiên càng cao
              </p>
            </div>
            <div>
              <FieldLabel>Trạng thái</FieldLabel>
              <div className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl h-[42px]">
                <span className="text-[13px] text-primary">{form.isActive ? "Đang hoạt động" : "Tạm dừng"}</span>
                <Toggle value={form.isActive} onChange={(v) => set("isActive", v)} />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Time + Limits ── */}
      <Section title="Thời gian & Giới hạn" collapsible>
        <div className="space-y-4">
          {/* Date range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Ngày bắt đầu</FieldLabel>
              <input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className={inputCls} />
            </div>
            <div>
              <FieldLabel>Ngày kết thúc</FieldLabel>
              <input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Value limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Giá trị đơn hàng tối thiểu (VNĐ)</FieldLabel>
              <input type="number" min={0} value={form.minOrderValue} onChange={(e) => set("minOrderValue", e.target.value)} placeholder="Để trống = không giới hạn" className={inputCls} />
            </div>
            <div>
              <FieldLabel>Giảm tối đa (VNĐ)</FieldLabel>
              <input type="number" min={0} value={form.maxDiscountValue} onChange={(e) => set("maxDiscountValue", e.target.value)} placeholder="Để trống = không giới hạn" className={inputCls} />
            </div>
          </div>

          {/* Usage limit */}
          <div>
            <FieldLabel>Giới hạn lượt sử dụng</FieldLabel>
            <input type="number" min={1} value={form.usageLimit} onChange={(e) => set("usageLimit", e.target.value)} placeholder="Để trống = không giới hạn" className={inputCls} />
          </div>
        </div>
      </Section>

      {/* ── Rules ── */}
      <Section title={`Quy tắc ưu đãi (${form.rules.length})`}>
        <div className="space-y-3">
          {form.rules.map((rule, i) => (
            <RuleCard key={i} rule={rule} index={i} onChange={updateRule} onRemove={removeRule} canRemove={form.rules.length > 1} />
          ))}
          <button
            type="button"
            onClick={addRule}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-accent/40 rounded-xl text-[12px] text-accent hover:bg-accent/5 hover:border-accent transition-colors cursor-pointer"
          >
            <Plus size={14} /> Thêm rule
          </button>
        </div>
      </Section>

      {/* ── Targets ── */}
      <Section title={`Đối tượng áp dụng (${form.targets.length})`}>
        <div className="space-y-3">
          {form.targets.map((target, i) => (
            <TargetCard key={i} target={target} index={i} onChange={updateTarget} onRemove={removeTarget} canRemove={form.targets.length > 1} />
          ))}
          <button
            type="button"
            onClick={addTarget}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-dashed border-accent/40 rounded-xl text-[12px] text-accent hover:bg-accent/5 hover:border-accent transition-colors cursor-pointer"
          >
            <Plus size={14} /> Thêm target
          </button>
        </div>
      </Section>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} className="shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex items-center justify-end gap-2 pt-1">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
          >
            Huỷ
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          {saving ? "Đang lưu..." : submitLabel}
        </button>
      </div>
    </div>
  );
}
