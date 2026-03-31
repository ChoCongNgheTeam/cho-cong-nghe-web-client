"use client";

import { useState, useCallback, useEffect } from "react";
import {
   Plus,
   Trash2,
   ChevronDown,
   ChevronUp,
   Info,
   Loader2,
   AlertCircle,
} from "lucide-react";
import type {
   Promotion,
   PromotionActionType,
   TargetType,
} from "../promotion.types";
import type { CreatePromotionPayload } from "../promotion.types";
import { ACTION_TYPE_LABELS, TARGET_TYPE_LABELS } from "../const";
import {
   ProductSearch,
   MultiSelectDropdown,
   type EntityOption,
} from "./MultiSelectDropdown";
import { utcToVNLocal, vnLocalToUtc } from "@/helpers/timezoneHelpers";
import { useToasty } from "@/components/Toast";

export interface TargetSearchAPIs {
   searchProducts: (term: string) => Promise<EntityOption[]>;
   loadCategories: () => Promise<EntityOption[]>;
   loadBrands: () => Promise<EntityOption[]>;
}

function Toggle({
   value,
   onChange,
}: {
   value: boolean;
   onChange: (v: boolean) => void;
}) {
   return (
      <button
         type="button"
         onClick={() => onChange(!value)}
         className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? "bg-accent" : "bg-neutral"}`}
      >
         <span
            className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`}
         />
      </button>
   );
}

function FieldLabel({
   children,
   required,
}: {
   children: React.ReactNode;
   required?: boolean;
}) {
   return (
      <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
         {children}
         {required && <span className="text-promotion ml-0.5">*</span>}
      </label>
   );
}

function FieldError({ message }: { message?: string }) {
   if (!message) return null;
   return (
      <p className="flex items-center gap-1 text-[11px] text-promotion mt-1">
         <AlertCircle size={10} className="shrink-0" />
         {message}
      </p>
   );
}

const inputCls = (hasError?: boolean) =>
   `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 transition-all ${
      hasError
         ? "border-promotion/60 focus:ring-promotion/20 focus:border-promotion"
         : "border-neutral focus:ring-accent/30 focus:border-accent"
   }`;

const selectCls = (hasError?: boolean) =>
   `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary focus:outline-none focus:ring-2 transition-all cursor-pointer ${
      hasError
         ? "border-promotion/60 focus:ring-promotion/20 focus:border-promotion"
         : "border-neutral focus:ring-accent/30 focus:border-accent"
   }`;

export interface RuleForm {
   actionType: PromotionActionType;
   discountValue: string;
   buyQuantity: string;
   getQuantity: string;
   giftProductVariantId: string;
}

export interface TargetForm {
   targetType: TargetType;
   entities: EntityOption[];
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

// ── Validation types ───────────────────────────────────────────────────────────
export interface FormErrors {
   name?: string;
   startDate?: string;
   endDate?: string;
   dateRange?: string;
   minOrderValue?: string;
   maxDiscountValue?: string;
   usageLimit?: string;
   priority?: string;
   rules?: Record<number, Partial<Record<keyof RuleForm, string>>>;
   targets?: Record<number, string>;
}

// ── Validation logic ───────────────────────────────────────────────────────────
function validateForm(form: PromotionFormData): FormErrors {
   const errors: FormErrors = {};
   const now = new Date();

   // Name
   if (!form.name.trim()) {
      errors.name = "Tên khuyến mãi không được để trống";
   } else if (form.name.trim().length < 3) {
      errors.name = "Tên khuyến mãi phải có ít nhất 3 ký tự";
   } else if (form.name.trim().length > 200) {
      errors.name = "Tên khuyến mãi không được vượt quá 200 ký tự";
   }

   // Priority
   const priority = Number(form.priority);
   if (form.priority !== "" && (isNaN(priority) || priority < 0)) {
      errors.priority = "Độ ưu tiên phải là số không âm";
   }

   // Dates
   const startDate = form.startDate ? new Date(form.startDate) : null;
   const endDate = form.endDate ? new Date(form.endDate) : null;

   if (endDate && endDate <= now) {
      errors.endDate = "Ngày kết thúc phải ở tương lai";
   }

   if (startDate && endDate) {
      if (endDate <= startDate) {
         errors.dateRange = "Ngày kết thúc phải sau ngày bắt đầu";
      } else {
         const diffMs = endDate.getTime() - startDate.getTime();
         const diffMinutes = diffMs / 1000 / 60;
         if (diffMinutes < 5) {
            errors.dateRange =
               "Khoảng thời gian khuyến mãi phải ít nhất 5 phút";
         }
      }
   }

   // minOrderValue
   if (form.minOrderValue !== "") {
      const val = Number(form.minOrderValue);
      if (isNaN(val) || val < 0) {
         errors.minOrderValue = "Giá trị đơn tối thiểu phải là số không âm";
      } else if (val > 100_000_000) {
         errors.minOrderValue =
            "Giá trị đơn tối thiểu không được vượt quá 100,000,000đ";
      }
   }

   // maxDiscountValue
   if (form.maxDiscountValue !== "") {
      const val = Number(form.maxDiscountValue);
      if (isNaN(val) || val < 0) {
         errors.maxDiscountValue = "Giảm tối đa phải là số không âm";
      } else if (val > 100_000_000) {
         errors.maxDiscountValue =
            "Giảm tối đa không được vượt quá 100,000,000đ";
      }
   }

   // usageLimit
   if (form.usageLimit !== "") {
      const val = Number(form.usageLimit);
      if (isNaN(val) || !Number.isInteger(val) || val < 1) {
         errors.usageLimit = "Giới hạn lượt sử dụng phải là số nguyên dương";
      }
   }

   // Rules
   const ruleErrors: Record<
      number,
      Partial<Record<keyof RuleForm, string>>
   > = {};
   form.rules.forEach((rule, i) => {
      const re: Partial<Record<keyof RuleForm, string>> = {};

      if (rule.actionType === "DISCOUNT_PERCENT") {
         if (!rule.discountValue) {
            re.discountValue = "Vui lòng nhập % giảm";
         } else {
            const v = Number(rule.discountValue);
            if (isNaN(v) || v <= 0) re.discountValue = "% giảm phải lớn hơn 0";
            else if (v > 100)
               re.discountValue = "% giảm không được vượt quá 100%";
         }
      }

      if (rule.actionType === "DISCOUNT_FIXED") {
         if (!rule.discountValue) {
            re.discountValue = "Vui lòng nhập số tiền giảm";
         } else {
            const v = Number(rule.discountValue);
            if (isNaN(v) || v <= 0)
               re.discountValue = "Số tiền giảm phải lớn hơn 0";
            else if (v > 100_000_000)
               re.discountValue =
                  "Số tiền giảm không được vượt quá 100,000,000đ";
         }
      }

      if (rule.actionType === "BUY_X_GET_Y") {
         if (!rule.buyQuantity || Number(rule.buyQuantity) < 1) {
            re.buyQuantity = "Số lượng mua phải ít nhất là 1";
         }
         if (!rule.getQuantity || Number(rule.getQuantity) < 1) {
            re.getQuantity = "Số lượng tặng phải ít nhất là 1";
         }
      }

      if (rule.actionType === "GIFT_PRODUCT") {
         if (!rule.giftProductVariantId.trim()) {
            re.giftProductVariantId = "Vui lòng nhập ID variant quà tặng";
         }
      }

      if (Object.keys(re).length > 0) ruleErrors[i] = re;
   });
   if (Object.keys(ruleErrors).length > 0) errors.rules = ruleErrors;

   // Targets
   const targetErrors: Record<number, string> = {};
   form.targets.forEach((t, i) => {
      if (t.targetType !== "ALL" && t.entities.length === 0) {
         const label = TARGET_TYPE_LABELS[t.targetType] ?? t.targetType;
         targetErrors[i] = `Vui lòng chọn ít nhất 1 ${label.toLowerCase()}`;
      }
   });
   if (Object.keys(targetErrors).length > 0) errors.targets = targetErrors;

   return errors;
}

function hasErrors(errors: FormErrors): boolean {
   return Object.keys(errors).length > 0;
}

// ── Toast summary ──────────────────────────────────────────────────────────────
function buildToastMessages(errors: FormErrors): string[] {
   const msgs: string[] = [];
   if (errors.name) msgs.push(errors.name);
   if (errors.priority) msgs.push(errors.priority);
   if (errors.endDate) msgs.push(errors.endDate);
   if (errors.dateRange) msgs.push(errors.dateRange);
   if (errors.minOrderValue) msgs.push(errors.minOrderValue);
   if (errors.maxDiscountValue) msgs.push(errors.maxDiscountValue);
   if (errors.usageLimit) msgs.push(errors.usageLimit);
   if (errors.rules) {
      Object.entries(errors.rules).forEach(([i, re]) => {
         Object.values(re).forEach((msg) =>
            msgs.push(`Rule #${Number(i) + 1}: ${msg}`),
         );
      });
   }
   if (errors.targets) {
      Object.entries(errors.targets).forEach(([i, msg]) =>
         msgs.push(`Target #${Number(i) + 1}: ${msg}`),
      );
   }
   return msgs;
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
   rules: [
      {
         actionType: "DISCOUNT_PERCENT",
         discountValue: "",
         buyQuantity: "",
         getQuantity: "",
         giftProductVariantId: "",
      },
   ],
   targets: [{ targetType: "ALL", entities: [] }],
};

export function promotionToForm(p: Promotion): PromotionFormData {
   const grouped: Record<string, TargetForm> = {};
   for (const t of p.targets) {
      const key = t.targetType;
      if (!grouped[key])
         grouped[key] = {
            targetType: t.targetType as TargetType,
            entities: [],
         };
      if (t.targetType !== "ALL" && t.targetId)
         grouped[key].entities.push({
            id: t.targetId,
            name: t.targetName ?? t.targetId,
         });
   }
   return {
      name: p.name,
      description: p.description ?? "",
      priority: String(p.priority),
      isActive: p.isActive,
      startDate: utcToVNLocal(p.startDate),
      endDate: utcToVNLocal(p.endDate),
      minOrderValue:
         p.minOrderValue !== undefined ? String(p.minOrderValue) : "",
      maxDiscountValue:
         p.maxDiscountValue !== undefined ? String(p.maxDiscountValue) : "",
      usageLimit: p.usageLimit !== undefined ? String(p.usageLimit) : "",
      rules: p.rules.map((r) => ({
         actionType: r.actionType,
         discountValue:
            r.discountValue !== undefined ? String(r.discountValue) : "",
         buyQuantity: r.buyQuantity !== undefined ? String(r.buyQuantity) : "",
         getQuantity: r.getQuantity !== undefined ? String(r.getQuantity) : "",
         giftProductVariantId: r.giftProductVariantId ?? "",
      })),
      targets:
         Object.values(grouped).length > 0
            ? Object.values(grouped)
            : DEFAULT_FORM.targets,
   };
}

export function formToPayload(form: PromotionFormData): CreatePromotionPayload {
   const flatTargets: { targetType: string; targetId?: string }[] = [];
   for (const t of form.targets) {
      if (t.targetType === "ALL") flatTargets.push({ targetType: "ALL" });
      else
         for (const e of t.entities)
            flatTargets.push({ targetType: t.targetType, targetId: e.id });
   }
   return {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      priority: Number(form.priority) || 0,
      isActive: form.isActive,
      startDate: vnLocalToUtc(form.startDate),
      endDate: vnLocalToUtc(form.endDate),
      minOrderValue: form.minOrderValue
         ? Number(form.minOrderValue)
         : undefined,
      maxDiscountValue: form.maxDiscountValue
         ? Number(form.maxDiscountValue)
         : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      rules: form.rules.map((r) => ({
         actionType: r.actionType,
         discountValue: r.discountValue ? Number(r.discountValue) : undefined,
         buyQuantity: r.buyQuantity ? Number(r.buyQuantity) : undefined,
         getQuantity: r.getQuantity ? Number(r.getQuantity) : undefined,
         giftProductVariantId: r.giftProductVariantId || undefined,
      })),
      targets: flatTargets as any,
   };
}

// ── RuleCard ───────────────────────────────────────────────────────────────────
function RuleCard({
   rule,
   index,
   onChange,
   onRemove,
   canRemove,
   errors,
}: {
   rule: RuleForm;
   index: number;
   onChange: (i: number, field: keyof RuleForm, value: string) => void;
   onRemove: (i: number) => void;
   canRemove: boolean;
   errors?: Partial<Record<keyof RuleForm, string>>;
}) {
   const showDiscount =
      rule.actionType === "DISCOUNT_PERCENT" ||
      rule.actionType === "DISCOUNT_FIXED";
   const showBuyXGetY = rule.actionType === "BUY_X_GET_Y";
   const showGift = rule.actionType === "GIFT_PRODUCT";
   const hasRuleError = errors && Object.keys(errors).length > 0;

   return (
      <div
         className={`border rounded-xl p-4 space-y-3 bg-neutral-light transition-colors ${hasRuleError ? "border-promotion/40" : "border-neutral"}`}
      >
         <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
               Rule #{index + 1}
            </span>
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
            <FieldLabel>Loại ưu đãi</FieldLabel>
            <select
               value={rule.actionType}
               onChange={(e) => onChange(index, "actionType", e.target.value)}
               className={selectCls()}
            >
               {(Object.keys(ACTION_TYPE_LABELS) as PromotionActionType[]).map(
                  (k) => (
                     <option key={k} value={k}>
                        {ACTION_TYPE_LABELS[k]}
                     </option>
                  ),
               )}
            </select>
         </div>

         {showDiscount && (
            <div>
               <FieldLabel required>
                  Giá trị giảm
                  {rule.actionType === "DISCOUNT_PERCENT" ? " (%)" : " (VNĐ)"}
               </FieldLabel>
               <input
                  type="number"
                  min={0}
                  max={rule.actionType === "DISCOUNT_PERCENT" ? 100 : undefined}
                  value={rule.discountValue}
                  onChange={(e) =>
                     onChange(index, "discountValue", e.target.value)
                  }
                  placeholder={
                     rule.actionType === "DISCOUNT_PERCENT"
                        ? "VD: 20"
                        : "VD: 50000"
                  }
                  className={inputCls(!!errors?.discountValue)}
               />
               <FieldError message={errors?.discountValue} />
            </div>
         )}

         {showBuyXGetY && (
            <div className="grid grid-cols-2 gap-3">
               <div>
                  <FieldLabel required>Mua (X)</FieldLabel>
                  <input
                     type="number"
                     min={1}
                     value={rule.buyQuantity}
                     onChange={(e) =>
                        onChange(index, "buyQuantity", e.target.value)
                     }
                     placeholder="VD: 2"
                     className={inputCls(!!errors?.buyQuantity)}
                  />
                  <FieldError message={errors?.buyQuantity} />
               </div>
               <div>
                  <FieldLabel required>Tặng (Y)</FieldLabel>
                  <input
                     type="number"
                     min={1}
                     value={rule.getQuantity}
                     onChange={(e) =>
                        onChange(index, "getQuantity", e.target.value)
                     }
                     placeholder="VD: 1"
                     className={inputCls(!!errors?.getQuantity)}
                  />
                  <FieldError message={errors?.getQuantity} />
               </div>
            </div>
         )}

         {showGift && (
            <div>
               <FieldLabel required>ID variant quà tặng</FieldLabel>
               <input
                  type="text"
                  value={rule.giftProductVariantId}
                  onChange={(e) =>
                     onChange(index, "giftProductVariantId", e.target.value)
                  }
                  placeholder="UUID của product variant"
                  className={inputCls(!!errors?.giftProductVariantId)}
               />
               <FieldError message={errors?.giftProductVariantId} />
            </div>
         )}
      </div>
   );
}

// ── TargetCard ─────────────────────────────────────────────────────────────────
function TargetCard({
   target,
   index,
   onChangeType,
   onChangeEntities,
   onRemove,
   canRemove,
   apis,
   categoryOptions,
   brandOptions,
   loadingCategories,
   loadingBrands,
   error,
}: {
   target: TargetForm;
   index: number;
   onChangeType: (i: number, type: TargetType) => void;
   onChangeEntities: (i: number, entities: EntityOption[]) => void;
   onRemove: (i: number) => void;
   canRemove: boolean;
   apis: TargetSearchAPIs;
   categoryOptions: EntityOption[];
   brandOptions: EntityOption[];
   loadingCategories: boolean;
   loadingBrands: boolean;
   error?: string;
}) {
   return (
      <div
         className={`border rounded-xl p-4 space-y-3 bg-neutral-light transition-colors ${error ? "border-promotion/40" : "border-neutral"}`}
      >
         <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider">
               Target #{index + 1}
            </span>
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
            <select
               value={target.targetType}
               onChange={(e) =>
                  onChangeType(index, e.target.value as TargetType)
               }
               className={selectCls()}
            >
               {(Object.keys(TARGET_TYPE_LABELS) as TargetType[]).map((k) => (
                  <option key={k} value={k}>
                     {TARGET_TYPE_LABELS[k]}
                  </option>
               ))}
            </select>
         </div>

         {target.targetType === "PRODUCT" && (
            <div>
               <FieldLabel required>Chọn sản phẩm</FieldLabel>
               <ProductSearch
                  selected={target.entities}
                  onChange={(items) => onChangeEntities(index, items)}
                  onSearch={apis.searchProducts}
                  placeholder="Tìm tên sản phẩm..."
               />
               <FieldError message={error} />
            </div>
         )}
         {target.targetType === "CATEGORY" && (
            <div>
               <FieldLabel required>Chọn danh mục</FieldLabel>
               <MultiSelectDropdown
                  selected={target.entities}
                  onChange={(items) => onChangeEntities(index, items)}
                  options={categoryOptions}
                  loading={loadingCategories}
                  placeholder="Chọn danh mục..."
               />
               <FieldError message={error} />
            </div>
         )}
         {target.targetType === "BRAND" && (
            <div>
               <FieldLabel required>Chọn thương hiệu</FieldLabel>
               <MultiSelectDropdown
                  selected={target.entities}
                  onChange={(items) => onChangeEntities(index, items)}
                  options={brandOptions}
                  loading={loadingBrands}
                  placeholder="Chọn thương hiệu..."
               />
               <FieldError message={error} />
            </div>
         )}
         {target.targetType === "ALL" && (
            <p className="text-[12px] text-neutral-dark bg-neutral/30 px-3 py-2 rounded-lg">
               Khuyến mãi sẽ áp dụng cho tất cả sản phẩm
            </p>
         )}
      </div>
   );
}

// ── Section ────────────────────────────────────────────────────────────────────
function Section({
   title,
   children,
   collapsible = false,
   hasError = false,
}: {
   title: string;
   children: React.ReactNode;
   collapsible?: boolean;
   hasError?: boolean;
}) {
   const [open, setOpen] = useState(true);
   return (
      <div
         className={`bg-neutral-light border rounded-xl overflow-hidden transition-colors ${hasError ? "border-promotion/40" : "border-neutral"}`}
      >
         <button
            type="button"
            onClick={() => collapsible && setOpen((v) => !v)}
            className={`w-full flex items-center justify-between px-5 py-3.5 border-b ${hasError ? "border-promotion/30" : "border-neutral"} ${collapsible ? "cursor-pointer hover:bg-neutral-light-active" : "cursor-default"}`}
         >
            <span className="text-[12px] font-semibold text-neutral-dark uppercase tracking-wider flex items-center gap-2">
               {title}
               {hasError && (
                  <AlertCircle size={12} className="text-promotion" />
               )}
            </span>
            {collapsible &&
               (open ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
         </button>
         {open && <div className="p-5">{children}</div>}
      </div>
   );
}

// ── Main PromotionForm ─────────────────────────────────────────────────────────
interface PromotionFormProps {
   initialData?: PromotionFormData;
   onSubmit: (data: PromotionFormData) => Promise<void>;
   saving: boolean;
   error: string | null;
   submitLabel: string;
   onCancel?: () => void;
   searchAPIs: TargetSearchAPIs;
}

export function PromotionForm({
   initialData = DEFAULT_FORM,
   onSubmit,
   saving,
   error,
   submitLabel,
   onCancel,
   searchAPIs,
}: PromotionFormProps) {
   const { error: toastError } = useToasty();

   const [form, setForm] = useState<PromotionFormData>(initialData);
   const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
   const [submitted, setSubmitted] = useState(false); // track nếu đã submit 1 lần → validate realtime

   useEffect(() => {
      setForm(initialData);
      setFieldErrors({});
      setSubmitted(false);
   }, [initialData]);

   const [categoryOptions, setCategoryOptions] = useState<EntityOption[]>([]);
   const [brandOptions, setBrandOptions] = useState<EntityOption[]>([]);
   const [loadingCategories, setLoadingCategories] = useState(false);
   const [loadingBrands, setLoadingBrands] = useState(false);

   useEffect(() => {
      setLoadingCategories(true);
      searchAPIs
         .loadCategories()
         .then(setCategoryOptions)
         .finally(() => setLoadingCategories(false));
      setLoadingBrands(true);
      searchAPIs
         .loadBrands()
         .then(setBrandOptions)
         .finally(() => setLoadingBrands(false));
   }, []);

   const set = useCallback(
      <K extends keyof PromotionFormData>(
         field: K,
         value: PromotionFormData[K],
      ) => {
         setForm((p) => {
            const next = { ...p, [field]: value };
            if (submitted) setFieldErrors(validateForm(next)); // realtime sau lần submit đầu
            return next;
         });
      },
      [submitted],
   );

   const addRule = () =>
      setForm((p) => ({
         ...p,
         rules: [
            ...p.rules,
            {
               actionType: "DISCOUNT_PERCENT",
               discountValue: "",
               buyQuantity: "",
               getQuantity: "",
               giftProductVariantId: "",
            },
         ],
      }));
   const removeRule = (i: number) =>
      setForm((p) => ({ ...p, rules: p.rules.filter((_, idx) => idx !== i) }));
   const updateRule = (i: number, f: keyof RuleForm, v: string) =>
      setForm((p) => {
         const r = [...p.rules];
         r[i] = { ...r[i], [f]: v };
         const next = { ...p, rules: r };
         if (submitted) setFieldErrors(validateForm(next));
         return next;
      });

   const addTarget = () =>
      setForm((p) => ({
         ...p,
         targets: [...p.targets, { targetType: "ALL", entities: [] }],
      }));
   const removeTarget = (i: number) =>
      setForm((p) => ({
         ...p,
         targets: p.targets.filter((_, idx) => idx !== i),
      }));
   const updateTargetType = (i: number, type: TargetType) =>
      setForm((p) => {
         const t = [...p.targets];
         t[i] = { targetType: type, entities: [] };
         const next = { ...p, targets: t };
         if (submitted) setFieldErrors(validateForm(next));
         return next;
      });
   const updateTargetEntities = (i: number, entities: EntityOption[]) =>
      setForm((p) => {
         const t = [...p.targets];
         t[i] = { ...t[i], entities };
         const next = { ...p, targets: t };
         if (submitted) setFieldErrors(validateForm(next));
         return next;
      });

   const handleSubmit = useCallback(async () => {
      setSubmitted(true);
      const errors = validateForm(form);
      setFieldErrors(errors);

      if (hasErrors(errors)) {
         const msgs = buildToastMessages(errors);
         // Toast lỗi đầu tiên + tổng số lỗi
         const first = msgs[0];
         const extra = msgs.length > 1 ? ` (+${msgs.length - 1} lỗi khác)` : "";
         toastError(`${first}${extra}`, {
            title: "Dữ liệu không hợp lệ",
            duration: 5000,
         });
         return;
      }

      await onSubmit(form);
   }, [form, onSubmit, toastError]);

   // Derived error flags for Section highlight
   const hasTimeErrors = !!(
      fieldErrors.startDate ||
      fieldErrors.endDate ||
      fieldErrors.dateRange ||
      fieldErrors.minOrderValue ||
      fieldErrors.maxDiscountValue ||
      fieldErrors.usageLimit
   );
   const hasRuleErrors = !!(
      fieldErrors.rules && Object.keys(fieldErrors.rules).length > 0
   );
   const hasTargetErrors = !!(
      fieldErrors.targets && Object.keys(fieldErrors.targets).length > 0
   );

   return (
      <div className="space-y-4">
         {/* ── Thông tin cơ bản ── */}
         <Section
            title="Thông tin cơ bản"
            hasError={!!(fieldErrors.name || fieldErrors.priority)}
         >
            <div className="space-y-4">
               <div>
                  <FieldLabel required>Tên khuyến mãi</FieldLabel>
                  <input
                     value={form.name}
                     onChange={(e) => set("name", e.target.value)}
                     placeholder="VD: Giảm 20% mùa hè"
                     className={inputCls(!!fieldErrors.name)}
                  />
                  <FieldError message={fieldErrors.name} />
               </div>

               <div>
                  <FieldLabel>Mô tả</FieldLabel>
                  <textarea
                     value={form.description}
                     onChange={(e) => set("description", e.target.value)}
                     rows={3}
                     placeholder="Mô tả ngắn về chương trình khuyến mãi"
                     className={`${inputCls()} resize-none`}
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <FieldLabel>Độ ưu tiên</FieldLabel>
                     <input
                        type="number"
                        value={form.priority}
                        onChange={(e) => set("priority", e.target.value)}
                        placeholder="0 = cao nhất"
                        className={inputCls(!!fieldErrors.priority)}
                     />
                     <FieldError message={fieldErrors.priority} />
                     {!fieldErrors.priority && (
                        <p className="text-[11px] text-neutral-dark mt-1 flex items-center gap-1">
                           <Info size={11} /> Số càng nhỏ, ưu tiên càng cao
                        </p>
                     )}
                  </div>
                  <div>
                     <FieldLabel>Trạng thái</FieldLabel>
                     <div className="flex items-center justify-between px-3 py-2.5 border border-neutral rounded-xl h-[42px]">
                        <span className="text-[13px] text-primary">
                           {form.isActive ? "Đang hoạt động" : "Tạm dừng"}
                        </span>
                        <Toggle
                           value={form.isActive}
                           onChange={(v) => set("isActive", v)}
                        />
                     </div>
                  </div>
               </div>
            </div>
         </Section>

         {/* ── Thời gian & Giới hạn ── */}
         <Section
            title="Thời gian & Giới hạn"
            collapsible
            hasError={hasTimeErrors}
         >
            <div className="space-y-4">
               <div className="flex items-center gap-2 px-3 py-2 bg-accent/5 border border-accent/20 rounded-lg">
                  <Info size={13} className="text-accent shrink-0" />
                  <p className="text-[11px] text-accent">
                     Thời gian nhập theo <strong>giờ Việt Nam (GMT+7)</strong>.
                     Hệ thống tự chuyển đổi khi lưu.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <FieldLabel>Ngày bắt đầu (giờ VN)</FieldLabel>
                     <input
                        type="datetime-local"
                        value={form.startDate}
                        onChange={(e) => set("startDate", e.target.value)}
                        className={inputCls(!!fieldErrors.startDate)}
                     />
                     <FieldError message={fieldErrors.startDate} />
                  </div>
                  <div>
                     <FieldLabel>Ngày kết thúc (giờ VN)</FieldLabel>
                     <input
                        type="datetime-local"
                        value={form.endDate}
                        onChange={(e) => set("endDate", e.target.value)}
                        className={inputCls(!!fieldErrors.endDate)}
                     />
                     <FieldError message={fieldErrors.endDate} />
                  </div>
               </div>

               {/* Date range error spans both columns */}
               {fieldErrors.dateRange && (
                  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                     <AlertCircle size={12} className="shrink-0" />
                     {fieldErrors.dateRange}
                  </div>
               )}

               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <FieldLabel>Giá trị đơn tối thiểu (VNĐ)</FieldLabel>
                     <input
                        type="number"
                        min={0}
                        value={form.minOrderValue}
                        onChange={(e) => set("minOrderValue", e.target.value)}
                        placeholder="Để trống = không giới hạn"
                        className={inputCls(!!fieldErrors.minOrderValue)}
                     />
                     <FieldError message={fieldErrors.minOrderValue} />
                  </div>
                  <div>
                     <FieldLabel>Giảm tối đa (VNĐ)</FieldLabel>
                     <input
                        type="number"
                        min={0}
                        value={form.maxDiscountValue}
                        onChange={(e) =>
                           set("maxDiscountValue", e.target.value)
                        }
                        placeholder="Để trống = không giới hạn"
                        className={inputCls(!!fieldErrors.maxDiscountValue)}
                     />
                     <FieldError message={fieldErrors.maxDiscountValue} />
                  </div>
               </div>

               <div>
                  <FieldLabel>Giới hạn lượt sử dụng</FieldLabel>
                  <input
                     type="number"
                     min={1}
                     value={form.usageLimit}
                     onChange={(e) => set("usageLimit", e.target.value)}
                     placeholder="Để trống = không giới hạn"
                     className={inputCls(!!fieldErrors.usageLimit)}
                  />
                  <FieldError message={fieldErrors.usageLimit} />
               </div>
            </div>
         </Section>

         {/* ── Rules ── */}
         <Section
            title={`Quy tắc ưu đãi (${form.rules.length})`}
            hasError={hasRuleErrors}
         >
            <div className="space-y-3">
               {form.rules.map((rule, i) => (
                  <RuleCard
                     key={i}
                     rule={rule}
                     index={i}
                     onChange={updateRule}
                     onRemove={removeRule}
                     canRemove={form.rules.length > 1}
                     errors={fieldErrors.rules?.[i]}
                  />
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
         <Section
            title={`Đối tượng áp dụng (${form.targets.length})`}
            hasError={hasTargetErrors}
         >
            <div className="space-y-3">
               {form.targets.map((target, i) => (
                  <TargetCard
                     key={i}
                     target={target}
                     index={i}
                     onChangeType={updateTargetType}
                     onChangeEntities={updateTargetEntities}
                     onRemove={removeTarget}
                     canRemove={form.targets.length > 1}
                     apis={searchAPIs}
                     categoryOptions={categoryOptions}
                     brandOptions={brandOptions}
                     loadingCategories={loadingCategories}
                     loadingBrands={loadingBrands}
                     error={fieldErrors.targets?.[i]}
                  />
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

         {/* API error */}
         {error && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
               <AlertCircle size={15} className="shrink-0 mt-0.5" />
               {error}
            </div>
         )}

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
               disabled={saving}
               className="flex items-center gap-1.5 px-5 py-2 bg-accent hover:bg-accent-hover disabled:opacity-60 text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer"
            >
               {saving && <Loader2 size={13} className="animate-spin" />}
               {saving ? "Đang lưu..." : submitLabel}
            </button>
         </div>
      </div>
   );
}
