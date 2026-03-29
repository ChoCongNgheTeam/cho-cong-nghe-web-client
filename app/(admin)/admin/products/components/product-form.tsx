"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
   Loader2,
   X,
   Star,
   AlertCircle,
   Info,
   ChevronDown,
   ChevronRight,
   ImagePlus,
   Trash2,
   Plus,
   Package,
   Palette,
   Layers,
   FileText,
   Sparkles,
   Check,
   BadgeDollarSign,
} from "lucide-react";
import apiRequest from "@/lib/api";
import Select from "react-select";
import { createProduct, updateProduct } from "../_libs/products";
import type { ProductDetail } from "../product.types";
import { CKEditorWrapper } from "@/(admin)/admin/blogs/components/CKEditorWrapper";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BrandOption {
   id: string;
   name: string;
   slug: string;
}

interface CategoryOption {
   id: string;
   name: string;
   slug: string;
   parentId?: string | null;
}

interface CategoryNode extends CategoryOption {
   children: CategoryNode[];
   depth: number;
}

interface AttrOption {
   id: string;
   value: string;
   label: string;
   /** Giá cộng thêm so với basePrice (có thể âm để giảm giá) */
   priceAdjustment: number;
}

interface TemplateAttribute {
   id: string;
   code: string;
   name: string;
   isRequired: boolean;
   options: AttrOption[];
}

interface TemplateSpecItem {
   id: string;
   key: string;
   name: string;
   groupName: string;
   unit?: string | null;
   isRequired: boolean;
   isFilterable: boolean;
   sortOrder: number;
}

interface TemplateSpecGroup {
   groupName: string;
   items: TemplateSpecItem[];
}

interface CategoryTemplate {
   attributes: TemplateAttribute[];
   specifications: TemplateSpecGroup[];
}

interface VariantForm {
   _key: string;
   id?: string;
   code: string;
   /** Computed: basePrice + sum(priceAdjustment) — NOT edited directly */
   computedPrice: number;
   quantity: string;
   isDefault: boolean;
   isActive: boolean;
   attributes: Record<string, string>;
}

interface ExistingImage {
   id: string;
   url: string;
   toDelete: boolean;
}

interface ColorImageForm {
   _key: string;
   color: string;
   altText: string;
   files: File[];
   previews: string[];
   existingImages?: ExistingImage[];
}

interface SpecForm {
   specificationId: string;
   value: string;
   isHighlight: boolean;
   enabled: boolean;
}

interface SelectOption {
   value: string;
   label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

function normalizeStr(s: string) {
   return s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-");
}

function generateSKU(productName: string, attrLabels: string[]): string {
   const base = [normalizeStr(productName), ...attrLabels.map(normalizeStr)]
      .filter(Boolean)
      .join("-");
   const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
   return `${base}-${suffix}`;
}

function cartesian(
   attrs: TemplateAttribute[],
   checked: Record<string, Set<string>>,
): Array<Record<string, string>> {
   const active = attrs.filter((a) => (checked[a.id]?.size ?? 0) > 0);
   if (!active.length) return [];
   const pools = active.map((a) =>
      sortedOptIds(a, checked[a.id] ?? new Set()).map((optId) => ({
         attrId: a.id,
         optId,
      })),
   );
   return pools.reduce<Array<Record<string, string>>>(
      (acc, pool) =>
         acc.flatMap((row) =>
            pool.map(({ attrId, optId }) => ({ ...row, [attrId]: optId })),
         ),
      [{}],
   );
}

function parseSizeBytes(label: string): number {
   const m = label.match(/([\d.]+)\s*(TB|GB|MB|KB)?/i);
   if (!m) return 0;
   const n = parseFloat(m[1]);
   const unit = (m[2] ?? "").toUpperCase();
   if (unit === "TB") return n * 1024 ** 4;
   if (unit === "GB") return n * 1024 ** 3;
   if (unit === "MB") return n * 1024 ** 2;
   if (unit === "KB") return n * 1024;
   return n;
}

function sortedOptIds(attr: TemplateAttribute, ids: Set<string>): string[] {
   return [...ids].sort((a, b) => {
      const optA = attr.options.find((o) => o.id === a);
      const optB = attr.options.find((o) => o.id === b);
      const labelA = optA?.label ?? "";
      const labelB = optB?.label ?? "";

      const isSize =
         /storage|memory|ram|ssd|hdd|bộ nhớ/i.test(attr.name + attr.code) ||
         /\d+\s*(TB|GB|MB|KB)/i.test(labelA + labelB);

      if (isSize) return parseSizeBytes(labelA) - parseSizeBytes(labelB);

      // Fallback: sort theo template order
      const orderMap = new Map(attr.options.map((o, i) => [o.id, i]));
      return (orderMap.get(a) ?? 999) - (orderMap.get(b) ?? 999);
   });
}

function buildFormData(
   payload: Record<string, any>,
   colorImages: ColorImageForm[],
): FormData {
   const fd = new FormData();
   fd.append("data", JSON.stringify(payload));
   for (const ci of colorImages) {
      for (let i = 0; i < ci.files.length; i++) {
         fd.append(`color_${ci.color}_${i}`, ci.files[i]);
      }
   }
   return fd;
}

function buildCategoryTree(flat: CategoryOption[]): CategoryNode[] {
   const map = new Map<string, CategoryNode>();
   flat.forEach((c) => map.set(c.id, { ...c, children: [], depth: 0 }));
   const roots: CategoryNode[] = [];
   map.forEach((node) => {
      if (node.parentId && map.has(node.parentId)) {
         map.get(node.parentId)!.children.push(node);
      } else {
         roots.push(node);
      }
   });
   function setDepth(nodes: CategoryNode[], d: number) {
      nodes.forEach((n) => {
         n.depth = d;
         setDepth(n.children, d + 1);
      });
   }
   setDepth(roots, 0);
   return roots;
}

function getCategoryPath(
   id: string | null,
   flat: CategoryOption[],
): CategoryOption[] {
   if (!id) return [];
   const map = new Map(flat.map((c) => [c.id, c]));
   const path: CategoryOption[] = [];
   let cur = map.get(id);
   while (cur) {
      path.unshift(cur);
      cur = cur.parentId ? map.get(cur.parentId) : undefined;
   }
   return path;
}

/** Tính giá cuối cho 1 variant: basePrice + tổng priceAdjustment */
function computeVariantPrice(
   basePrice: number,
   attrMap: Record<string, string>,
   template: CategoryTemplate | null,
): number {
   if (!template) return basePrice;
   const adj = template.attributes.reduce((sum, attr) => {
      const optId = attrMap[attr.id];
      if (!optId) return sum;
      const opt = attr.options.find((o) => o.id === optId);
      return sum + (opt?.priceAdjustment ?? 0);
   }, 0);
   return basePrice + adj;
}

/** Format gọn: 20000000 → "20tr", 2500000 → "2,5tr", 500000 → "500k" */
function fmtVND(n: number): string {
   if (Math.abs(n) >= 1_000_000) {
      const m = n / 1_000_000;
      return (Number.isInteger(m) ? m : m.toFixed(1)) + "tr";
   }
   if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "k";
   return n.toLocaleString("vi-VN");
}

function fmtFull(n: number): string {
   return n.toLocaleString("vi-VN") + "đ";
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const inp = (err?: boolean) =>
   `w-full px-3 py-2 text-[13px] bg-gray-50 border rounded-lg text-gray-900 placeholder:text-gray-400
   focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition-all
   ${err ? "border-red-400 bg-red-50/30" : "border-gray-200"}`;

const rsStyles = (err?: boolean) => ({
   control: (b: any, s: any) => ({
      ...b,
      borderRadius: "0.5rem",
      borderColor: err ? "#f87171" : s.isFocused ? "#111827" : "#e5e7eb",
      boxShadow: s.isFocused ? "0 0 0 4px rgba(17,24,39,0.05)" : "none",
      background: s.isFocused ? "#fff" : "#f9fafb",
      "&:hover": { borderColor: "#d1d5db" },
      minHeight: "38px",
      transition: "all 0.15s",
   }),
   valueContainer: (b: any) => ({ ...b, padding: "0.25rem 0.75rem" }),
   input: (b: any) => ({ ...b, margin: 0, padding: 0, fontSize: "13px" }),
   menu: (b: any) => ({
      ...b,
      borderRadius: "0.5rem",
      marginTop: 4,
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      zIndex: 9999,
      border: "1px solid #e5e7eb",
   }),
   menuList: (b: any) => ({ ...b, padding: "4px" }),
   option: (b: any, s: any) => ({
      ...b,
      borderRadius: "6px",
      margin: "1px 0",
      background: s.isSelected
         ? "#111827"
         : s.isFocused
           ? "#f3f4f6"
           : "transparent",
      color: s.isSelected ? "white" : "#374151",
      fontSize: "13px",
      padding: "7px 10px",
   }),
   singleValue: (b: any) => ({ ...b, fontSize: "13px", color: "#111827" }),
   placeholder: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
   dropdownIndicator: (b: any) => ({
      ...b,
      padding: "0 8px",
      color: "#9ca3af",
   }),
   clearIndicator: (b: any) => ({ ...b, padding: "0 8px", color: "#9ca3af" }),
});

// ─────────────────────────────────────────────────────────────────────────────
// TOGGLE
// ─────────────────────────────────────────────────────────────────────────────

function Toggle({
   value,
   onChange,
   size = "md",
}: {
   value: boolean;
   onChange: (v: boolean) => void;
   size?: "sm" | "md";
}) {
   const sm = size === "sm";
   return (
      <button
         type="button"
         onClick={() => onChange(!value)}
         className={`relative rounded-full transition-all cursor-pointer flex-shrink-0
        ${sm ? "w-8 h-[17px]" : "w-10 h-[22px]"}
        ${value ? "bg-gray-900" : "bg-gray-200"}`}
      >
         <span
            className={`absolute top-[2px] rounded-full bg-white shadow-sm transition-all
        ${sm ? "w-[13px] h-[13px]" : "w-[18px] h-[18px]"}
        ${value ? (sm ? "left-[17px]" : "left-[20px]") : "left-[2px]"}`}
         />
      </button>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION
// ─────────────────────────────────────────────────────────────────────────────

function Section({
   icon,
   title,
   badge,
   children,
   defaultOpen = true,
}: {
   icon: React.ReactNode;
   title: string;
   badge?: React.ReactNode;
   children: React.ReactNode;
   defaultOpen?: boolean;
}) {
   const [open, setOpen] = useState(defaultOpen);
   return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
         <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/60 transition-colors group"
         >
            <div className="flex items-center gap-2.5">
               <span className="w-6 h-6 rounded-md bg-gray-100 group-hover:bg-gray-900 group-hover:text-white flex items-center justify-center text-gray-500 transition-all">
                  {icon}
               </span>
               <span className="text-[13px] font-semibold text-gray-900">
                  {title}
               </span>
               {badge !== undefined && badge !== null && badge !== "" && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-500">
                     {badge}
                  </span>
               )}
            </div>
            <ChevronDown
               size={14}
               className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
            />
         </button>
         {open && (
            <div className="border-t border-gray-100 px-5 py-4 space-y-4">
               {children}
            </div>
         )}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY TREE
// ─────────────────────────────────────────────────────────────────────────────

function CategoryTree({
   nodes,
   selectedId,
   onSelect,
}: {
   nodes: CategoryNode[];
   selectedId: string | null;
   onSelect: (id: string) => void;
}) {
   const [expanded, setExpanded] = useState<Set<string>>(() => {
      const s = new Set<string>();
      nodes.forEach((n) => s.add(n.id));
      return s;
   });

   const toggle = (id: string) =>
      setExpanded((prev) => {
         const n = new Set(prev);
         n.has(id) ? n.delete(id) : n.add(id);
         return n;
      });

   function renderNodes(list: CategoryNode[]) {
      return list.map((node) => {
         const isLeaf = node.children.length === 0;
         const isOpen = expanded.has(node.id);
         const isSel = node.id === selectedId;
         return (
            <div key={node.id}>
               <div
                  onClick={() => (isLeaf ? onSelect(node.id) : toggle(node.id))}
                  className={`flex items-center gap-2 px-3 py-[7px] rounded-lg cursor-pointer transition-colors select-none
                     ${isLeaf && isSel ? "bg-gray-900 text-white" : isLeaf ? "hover:bg-gray-100 text-gray-700" : "hover:bg-gray-50 text-gray-600 font-medium"}`}
               >
                  {!isLeaf && (
                     <ChevronRight
                        size={12}
                        className={`flex-shrink-0 text-gray-400 transition-transform duration-150 ${isOpen ? "rotate-90" : ""}`}
                     />
                  )}
                  {isLeaf && <span className="w-3 flex-shrink-0" />}
                  <span className="text-[13px] flex-1 leading-tight">
                     {node.name}
                  </span>
                  {isSel && isLeaf && (
                     <Check size={12} className="flex-shrink-0 text-white" />
                  )}
               </div>
               {!isLeaf && isOpen && (
                  <div className="ml-4 pl-3 border-l border-gray-100 mt-0.5 mb-0.5">
                     {renderNodes(node.children)}
                  </div>
               )}
            </div>
         );
      });
   }

   return <div className="space-y-0.5">{renderNodes(nodes)}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// CATEGORY CHANGE CONFIRM MODAL
// ─────────────────────────────────────────────────────────────────────────────

function CategoryChangeModal({
   onConfirm,
   onCancel,
}: {
   onConfirm: () => void;
   onCancel: () => void;
}) {
   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
         <div className="bg-white rounded-2xl border border-gray-200 shadow-xl w-full max-w-sm p-6">
            <div className="flex items-start gap-3 mb-4">
               <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <AlertCircle size={16} className="text-amber-500" />
               </div>
               <div>
                  <p className="text-[14px] font-semibold text-gray-900 mb-1">
                     Thay đổi danh mục
                  </p>
                  <p className="text-[13px] text-gray-500 leading-relaxed">
                     Danh mục mới có cấu hình thuộc tính khác. Toàn bộ biến thể
                     hiện tại sẽ bị xóa và tạo lại từ đầu.
                  </p>
               </div>
            </div>
            <div className="flex gap-2.5 mt-5">
               <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
               >
                  Hủy bỏ
               </button>
               <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-[13px] font-semibold text-white transition-colors cursor-pointer"
               >
                  Xác nhận
               </button>
            </div>
         </div>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// BASE PRICE INPUT
// ─────────────────────────────────────────────────────────────────────────────

function BasePriceInput({
   value,
   onChange,
   error,
}: {
   value: number;
   onChange: (v: number) => void;
   error?: string;
}) {
   const [raw, setRaw] = useState(value === 0 ? "" : String(value));

   useEffect(() => {
      setRaw(value === 0 ? "" : String(value));
   }, [value]);

   const commit = () => {
      const n = Number(raw.replace(/\D/g, "")) || 0;
      onChange(n);
      setRaw(n === 0 ? "" : String(n));
   };

   return (
      <div>
         <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Giá gốc (VNĐ) <span className="text-red-400">*</span>
         </p>
         <div className="relative">
            <input
               value={raw}
               onChange={(e) => setRaw(e.target.value.replace(/\D/g, ""))}
               onBlur={commit}
               onKeyDown={(e) => e.key === "Enter" && commit()}
               placeholder="20000000"
               className={`${inp(!!error)} pr-12 tabular-nums`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-gray-400 pointer-events-none">
               VNĐ
            </span>
         </div>
         {value > 0 && (
            <p className="text-[11px] text-gray-400 mt-1">
               ≈ {fmtVND(value)} · {fmtFull(value)}
            </p>
         )}
         {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRICE ADJUSTMENT INPUT (inline, compact)
// ─────────────────────────────────────────────────────────────────────────────

function PriceAdjInput({
   value,
   onChange,
}: {
   value: number;
   onChange: (v: number) => void;
}) {
   const [raw, setRaw] = useState(value === 0 ? "" : String(value));

   useEffect(() => {
      setRaw(value === 0 ? "" : String(value));
   }, [value]);

   const commit = () => {
      // Allow negative: keep leading "-" then parse digits
      const isNeg = raw.trim().startsWith("-");
      const digits = Number(raw.replace(/[^\d]/g, "")) || 0;
      const n = isNeg ? -digits : digits;
      onChange(n);
      setRaw(n === 0 ? "" : String(n));
   };

   const colorCls =
      value > 0
         ? "border-emerald-300 text-emerald-700 bg-emerald-50/40"
         : value < 0
           ? "border-red-300 text-red-600 bg-red-50/40"
           : "border-gray-200 text-gray-500 bg-white";

   return (
      <div className="flex items-center gap-1 mt-1.5">
         <span className="text-[10px] text-gray-400 whitespace-nowrap flex-shrink-0">
            ±giá
         </span>
         <div className="relative flex-1">
            <input
               value={raw}
               onChange={(e) => setRaw(e.target.value)}
               onBlur={commit}
               onKeyDown={(e) => e.key === "Enter" && commit()}
               placeholder="0"
               className={`w-full px-2 py-1 text-[11px] border rounded-md tabular-nums
                  focus:outline-none focus:border-gray-700 transition-all ${colorCls}`}
            />
            {value !== 0 && (
               <span
                  className={`absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] font-bold pointer-events-none
                  ${value > 0 ? "text-emerald-500" : "text-red-400"}`}
               >
                  {value > 0 ? "+" : ""}
                  {fmtVND(value)}
               </span>
            )}
         </div>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHIP ATTRIBUTE SELECTOR — priceAdjustment per selected option
// ─────────────────────────────────────────────────────────────────────────────

function ChipAttributeSelector({
   template,
   checked,
   basePrice,
   onToggle,
   onAddOption,
   onUpdatePriceAdjustment,
}: {
   template: CategoryTemplate;
   checked: Record<string, Set<string>>;
   basePrice: number;
   onToggle: (attrId: string, optId: string) => void;
   onAddOption: (attrId: string, label: string, value: string) => void;
   onUpdatePriceAdjustment: (
      attrId: string,
      optId: string,
      adj: number,
   ) => void;
}) {
   const [adding, setAdding] = useState<Record<string, boolean>>({});
   const [newLabel, setNewLabel] = useState<Record<string, string>>({});

   const submit = (attrId: string) => {
      const label = newLabel[attrId]?.trim();
      if (!label) return;
      const value =
         label
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/gi, "d")
            .replace(/[^a-z0-9]/g, "-")
            .replace(/-+/g, "-")
            .replace(/^-|-$/g, "") || label.toLowerCase();
      onAddOption(attrId, label, value);
      setNewLabel((p) => ({ ...p, [attrId]: "" }));
      setAdding((p) => ({ ...p, [attrId]: false }));
   };

   return (
      <div className="space-y-5">
         {template.attributes.map((attr) => {
            const isColor = attr.code === "color";
            const selCount = checked[attr.id]?.size ?? 0;

            return (
               <div key={attr.id}>
                  <div className="flex items-center gap-2 mb-2.5">
                     <span className="text-[12px] font-semibold text-gray-700">
                        {attr.name}
                        {attr.isRequired && (
                           <span className="text-red-400 ml-0.5">*</span>
                        )}
                     </span>
                     {selCount > 0 && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                           {selCount} đã chọn
                        </span>
                     )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-start">
                     {attr.options.map((opt) => {
                        const isOn = checked[attr.id]?.has(opt.id) ?? false;
                        const finalPrice = basePrice + opt.priceAdjustment;
                        return (
                           <div
                              key={opt.id}
                              className="flex flex-col min-w-[80px]"
                           >
                              <button
                                 type="button"
                                 onClick={() => onToggle(attr.id, opt.id)}
                                 className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium
                                    cursor-pointer transition-all select-none w-full
                                    ${
                                       isOn
                                          ? "bg-gray-900 border-gray-900 text-white"
                                          : "bg-white border-gray-200 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                                    }`}
                              >
                                 {isColor && (
                                    <span
                                       className={`w-3 h-3 rounded-full flex-shrink-0 ${isOn ? "ring-2 ring-white ring-offset-1 ring-offset-gray-900" : "ring-1 ring-gray-300"}`}
                                       style={{ background: opt.value }}
                                    />
                                 )}
                                 <span className="flex-1 text-left">
                                    {opt.label}
                                 </span>
                                 {isOn && opt.priceAdjustment !== 0 && (
                                    <span
                                       className={`text-[10px] font-semibold opacity-80 whitespace-nowrap
                                       ${opt.priceAdjustment > 0 ? "text-emerald-300" : "text-red-300"}`}
                                    >
                                       {opt.priceAdjustment > 0 ? "+" : ""}
                                       {fmtVND(opt.priceAdjustment)}
                                    </span>
                                 )}
                                 {isOn && (
                                    <Check
                                       size={11}
                                       className="flex-shrink-0 opacity-80"
                                    />
                                 )}
                              </button>
                              {/* Show price adjustment input + final price preview when selected */}
                              {isOn && (
                                 <div className="mt-1.5 px-1">
                                    <PriceAdjInput
                                       value={opt.priceAdjustment}
                                       onChange={(adj) =>
                                          onUpdatePriceAdjustment(
                                             attr.id,
                                             opt.id,
                                             adj,
                                          )
                                       }
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1 tabular-nums">
                                       → {fmtVND(finalPrice)}
                                    </p>
                                 </div>
                              )}
                           </div>
                        );
                     })}
                     {adding[attr.id] ? (
                        <div className="inline-flex items-center gap-1.5 border border-gray-300 bg-white rounded-lg px-2.5 py-1.5">
                           <input
                              autoFocus
                              value={newLabel[attr.id] ?? ""}
                              onChange={(e) =>
                                 setNewLabel((p) => ({
                                    ...p,
                                    [attr.id]: e.target.value,
                                 }))
                              }
                              onKeyDown={(e) => {
                                 if (e.key === "Enter") submit(attr.id);
                                 if (e.key === "Escape")
                                    setAdding((p) => ({
                                       ...p,
                                       [attr.id]: false,
                                    }));
                              }}
                              placeholder="Tên option..."
                              className="w-24 text-[12px] bg-transparent focus:outline-none text-gray-700 placeholder:text-gray-400"
                           />
                           <button
                              type="button"
                              onClick={() => submit(attr.id)}
                              className="text-[11px] font-semibold text-gray-900 cursor-pointer hover:opacity-70"
                           >
                              OK
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 setAdding((p) => ({ ...p, [attr.id]: false }))
                              }
                              className="text-gray-400 cursor-pointer hover:text-gray-600"
                           >
                              <X size={11} />
                           </button>
                        </div>
                     ) : (
                        <button
                           type="button"
                           onClick={() =>
                              setAdding((p) => ({ ...p, [attr.id]: true }))
                           }
                           className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-[11px] text-gray-400 hover:border-gray-500 hover:text-gray-600 hover:bg-gray-50 transition-all cursor-pointer"
                        >
                           <Plus size={10} /> Thêm
                        </button>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// VARIANT TABLE — price column is computed/read-only
// ─────────────────────────────────────────────────────────────────────────────

function VariantTable({
   variants,
   template,
   basePrice,
   selectedKeys,
   onToggleSelect,
   onToggleAll,
   onUpdate,
   onSetDefault,
   onRemove,
   errors,
   productName,
}: {
   variants: VariantForm[];
   template: CategoryTemplate | null;
   basePrice: number;
   selectedKeys: Set<string>;
   onToggleSelect: (key: string) => void;
   onToggleAll: (v: boolean) => void;
   onUpdate: (key: string, field: keyof VariantForm, value: any) => void;
   onSetDefault: (key: string) => void;
   onRemove: (key: string) => void;
   errors: Record<string, string>;
   productName: string;
}) {
   const [bulkQty, setBulkQty] = useState("");
   const allChecked =
      variants.length > 0 && selectedKeys.size === variants.length;
   const someChecked = selectedKeys.size > 0;
   const attrCols = template?.attributes ?? [];

   const autoSKU = useCallback(
      (v: VariantForm) => {
         if (!template || !productName.trim()) return;
         const labels = template.attributes
            .map(
               (a) =>
                  a.options.find((o) => o.id === v.attributes[a.id])?.label ??
                  "",
            )
            .filter(Boolean);
         const sku = generateSKU(productName, labels);
         if (sku) onUpdate(v._key, "code", sku);
      },
      [template, productName, onUpdate],
   );

   if (!variants.length) return null;

   const prices = variants.map((v) => v.computedPrice);
   const minP = Math.min(...prices);
   const maxP = Math.max(...prices);
   const priceRange =
      minP === maxP ? fmtFull(minP) : `${fmtVND(minP)} – ${fmtVND(maxP)}`;

   return (
      <div className="space-y-2">
         {/* Price range banner */}
         <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
               <BadgeDollarSign size={13} className="text-gray-400" />
               Khoảng giá:
               <span className="font-semibold text-gray-900">{priceRange}</span>
            </div>
            <span className="text-[11px] text-gray-400 italic">
               = giá gốc ({fmtVND(basePrice)}) + điều chỉnh option
            </span>
         </div>

         {/* Bulk toolbar */}
         {someChecked && (
            <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-900 rounded-lg flex-wrap">
               <span className="text-[12px] font-semibold text-white">
                  {selectedKeys.size} dòng
               </span>
               <div className="w-px h-4 bg-white/20" />
               <span className="text-[11px] text-white/50">Tồn kho</span>
               <input
                  value={bulkQty}
                  onChange={(e) => setBulkQty(e.target.value)}
                  type="number"
                  placeholder="0"
                  className="w-[70px] px-2.5 py-1 text-[12px] border border-white/15 rounded-md bg-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/40"
               />
               <button
                  type="button"
                  onClick={() => {
                     selectedKeys.forEach((k) =>
                        onUpdate(k, "quantity", bulkQty),
                     );
                     setBulkQty("");
                  }}
                  className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-white text-gray-900 hover:bg-gray-100 cursor-pointer transition-colors"
               >
                  Áp dụng
               </button>
               {template && productName.trim() && (
                  <>
                     <div className="w-px h-4 bg-white/20" />
                     <button
                        type="button"
                        onClick={() =>
                           variants
                              .filter((v) => selectedKeys.has(v._key))
                              .forEach((v) => autoSKU(v))
                        }
                        className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium rounded-md bg-white/15 hover:bg-white/25 text-white cursor-pointer transition-colors"
                     >
                        <Sparkles size={11} /> SKU tự động
                     </button>
                  </>
               )}
            </div>
         )}

         <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full border-collapse" style={{ minWidth: 560 }}>
               <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                     <th className="px-3 py-2.5 text-left w-9">
                        <input
                           type="checkbox"
                           checked={allChecked}
                           onChange={(e) => onToggleAll(e.target.checked)}
                           className="w-[13px] h-[13px] accent-gray-900 cursor-pointer"
                        />
                     </th>
                     <th className="px-2 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-7">
                        #
                     </th>
                     <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider min-w-[120px]">
                        SKU
                     </th>
                     {attrCols.map((a) => (
                        <th
                           key={a.id}
                           className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider"
                        >
                           {a.name}
                        </th>
                     ))}
                     <th className="px-3 py-2.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider min-w-[130px]">
                        Giá cuối
                     </th>
                     <th className="px-3 py-2.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[75px]">
                        Tồn kho
                     </th>
                     <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[72px]">
                        Default
                     </th>
                     <th className="px-3 py-2.5 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider w-[60px]">
                        Active
                     </th>
                     <th className="px-2 py-2.5 w-8" />
                  </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {variants.map((v, idx) => {
                     const isSel = selectedKeys.has(v._key);
                     const codeErr = errors[`variant_${v._key}_code`];
                     const adj = v.computedPrice - basePrice;

                     return (
                        <tr
                           key={v._key}
                           className={`transition-colors ${isSel ? "bg-gray-50" : "hover:bg-gray-50/40"}`}
                        >
                           <td className="px-3 py-2">
                              <input
                                 type="checkbox"
                                 checked={isSel}
                                 onChange={() => onToggleSelect(v._key)}
                                 className="w-[13px] h-[13px] accent-gray-900 cursor-pointer"
                              />
                           </td>
                           <td className="px-2 py-2 text-[11px] text-gray-400 tabular-nums">
                              {idx + 1}
                           </td>
                           <td className="px-3 py-2">
                              <div className="flex items-center gap-1">
                                 <input
                                    value={v.code}
                                    onChange={(e) =>
                                       onUpdate(
                                          v._key,
                                          "code",
                                          e.target.value.toUpperCase(),
                                       )
                                    }
                                    placeholder="PRO-P-WH-A3F"
                                    className={`w-full min-w-[100px] px-2 py-1.5 text-[11px] font-mono border rounded-md
                                       bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-900 transition-all
                                       ${codeErr ? "border-red-300 bg-red-50/30" : "border-gray-200"}`}
                                 />
                                 {template && productName.trim() && (
                                    <button
                                       type="button"
                                       onClick={() => autoSKU(v)}
                                       title="Tạo SKU tự động"
                                       className="p-1 text-gray-300 hover:text-gray-900 cursor-pointer flex-shrink-0 transition-colors"
                                    >
                                       <Sparkles size={12} />
                                    </button>
                                 )}
                              </div>
                              {codeErr && (
                                 <p className="text-[10px] text-red-500 mt-0.5">
                                    {codeErr}
                                 </p>
                              )}
                           </td>
                           {attrCols.map((attr) => {
                              const opt = attr.options.find(
                                 (o) => o.id === v.attributes[attr.id],
                              );
                              return (
                                 <td key={attr.id} className="px-3 py-2">
                                    <div className="flex items-center gap-1.5">
                                       {attr.code === "color" && opt && (
                                          <span
                                             className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-1 ring-gray-300"
                                             style={{ background: opt.value }}
                                          />
                                       )}
                                       <span className="text-[12px] text-gray-700">
                                          {opt?.label ?? (
                                             <span className="text-gray-300">
                                                —
                                             </span>
                                          )}
                                       </span>
                                    </div>
                                 </td>
                              );
                           })}
                           {/* Giá cuối — read-only computed */}
                           <td className="px-3 py-2 text-right">
                              <span className="text-[13px] font-semibold text-gray-900 tabular-nums">
                                 {fmtVND(v.computedPrice)}
                              </span>
                              {adj !== 0 && (
                                 <div
                                    className={`text-[10px] tabular-nums mt-0.5 ${adj > 0 ? "text-emerald-600" : "text-red-500"}`}
                                 >
                                    {adj > 0 ? "+" : ""}
                                    {fmtVND(adj)}
                                 </div>
                              )}
                           </td>
                           <td className="px-3 py-2">
                              <input
                                 type="number"
                                 value={v.quantity}
                                 min="0"
                                 placeholder="0"
                                 onChange={(e) =>
                                    onUpdate(v._key, "quantity", e.target.value)
                                 }
                                 className="w-full px-2 py-1.5 text-[12px] text-center border border-gray-200 rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:border-gray-900 transition-all"
                              />
                           </td>
                           <td className="px-3 py-2 text-center">
                              <button
                                 type="button"
                                 onClick={() => onSetDefault(v._key)}
                                 className={`inline-flex items-center justify-center w-[18px] h-[18px] rounded-full border-2 transition-all cursor-pointer mx-auto
                                    ${v.isDefault ? "border-gray-900 bg-gray-900" : "border-gray-300 hover:border-gray-600"}`}
                              >
                                 {v.isDefault && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                                 )}
                              </button>
                           </td>
                           <td className="px-3 py-2 text-center">
                              <div className="flex justify-center">
                                 <Toggle
                                    value={v.isActive}
                                    onChange={(val) =>
                                       onUpdate(v._key, "isActive", val)
                                    }
                                    size="sm"
                                 />
                              </div>
                           </td>
                           <td className="px-2 py-2">
                              {variants.length > 1 && (
                                 <button
                                    type="button"
                                    onClick={() => onRemove(v._key)}
                                    className="w-6 h-6 flex items-center justify-center rounded text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                                 >
                                    <X size={12} />
                                 </button>
                              )}
                           </td>
                        </tr>
                     );
                  })}
               </tbody>
            </table>
         </div>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// COLOR IMAGES
// ─────────────────────────────────────────────────────────────────────────────

function ColorImages({
   colorImages,
   colorOptions,
   isEdit,
   errors,
   onAddColor,
   onRemoveColor,
   onUpdateColor,
   onHandleFiles,
   onRemoveNewFile,
   onToggleDeleteImg,
}: {
   colorImages: ColorImageForm[];
   colorOptions: AttrOption[];
   isEdit: boolean;
   errors: Record<string, string>;
   onAddColor: () => void;
   onRemoveColor: (key: string) => void;
   onUpdateColor: (
      key: string,
      field: "color" | "altText",
      val: string,
   ) => void;
   onHandleFiles: (key: string, files: FileList | null) => void;
   onRemoveNewFile: (key: string, idx: number) => void;
   onToggleDeleteImg: (key: string, imgId: string) => void;
}) {
   return (
      <div className="space-y-3">
         {errors.colorImages && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px] font-medium">
               <AlertCircle size={13} /> {errors.colorImages}
            </div>
         )}
         <div className="grid grid-cols-2 gap-3">
            {colorImages.map((ci) => {
               const label = colorOptions.find(
                  (o) => o.value === ci.color,
               )?.label;
               const activeExisting =
                  ci.existingImages?.filter((i) => !i.toDelete) ?? [];
               const toDeleteCount =
                  ci.existingImages?.filter((i) => i.toDelete).length ?? 0;
               const newCount = ci.previews.length;
               const SLOTS = 5;
               return (
                  <div
                     key={ci._key}
                     className="border border-gray-200 rounded-lg overflow-hidden"
                  >
                     <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                           {ci.color ? (
                              <span
                                 className="w-3.5 h-3.5 rounded-full ring-1 ring-gray-300 flex-shrink-0"
                                 style={{ background: ci.color }}
                              />
                           ) : (
                              <span className="w-3.5 h-3.5 rounded-full bg-gray-200 flex-shrink-0" />
                           )}
                           <span className="text-[12px] font-semibold text-gray-800">
                              {(label ?? ci.color) || "Chưa chọn màu"}
                           </span>
                           {ci.color && label && (
                              <span className="text-[10px] text-gray-400 font-mono">
                                 {ci.color}
                              </span>
                           )}
                           {toDeleteCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 font-semibold">
                                 −{toDeleteCount}
                              </span>
                           )}
                           {newCount > 0 && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-900 text-white font-semibold">
                                 +{newCount}
                              </span>
                           )}
                        </div>
                        {colorImages.length > 1 && (
                           <button
                              type="button"
                              onClick={() => onRemoveColor(ci._key)}
                              className="w-5 h-5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                           >
                              <Trash2 size={11} />
                           </button>
                        )}
                     </div>
                     <div className="p-3 space-y-2.5">
                        {!ci.color && (
                           <div className="grid grid-cols-2 gap-2">
                              <div>
                                 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Màu sắc{" "}
                                    <span className="text-red-400">*</span>
                                 </p>
                                 {colorOptions.length > 0 ? (
                                    <select
                                       value={ci.color}
                                       onChange={(e) =>
                                          onUpdateColor(
                                             ci._key,
                                             "color",
                                             e.target.value,
                                          )
                                       }
                                       className={
                                          inp() + " cursor-pointer text-[12px]"
                                       }
                                    >
                                       <option value="">— Chọn màu —</option>
                                       {colorOptions.map((opt) => (
                                          <option
                                             key={opt.id}
                                             value={opt.value}
                                          >
                                             {opt.label}
                                          </option>
                                       ))}
                                    </select>
                                 ) : (
                                    <input
                                       value={ci.color}
                                       onChange={(e) =>
                                          onUpdateColor(
                                             ci._key,
                                             "color",
                                             e.target.value
                                                .toLowerCase()
                                                .replace(/\s+/g, "-"),
                                          )
                                       }
                                       placeholder="#ffffff"
                                       className={inp()}
                                    />
                                 )}
                              </div>
                              <div>
                                 <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                                    Alt text
                                 </p>
                                 <input
                                    value={ci.altText}
                                    onChange={(e) =>
                                       onUpdateColor(
                                          ci._key,
                                          "altText",
                                          e.target.value,
                                       )
                                    }
                                    placeholder="Mô tả ảnh"
                                    className={inp()}
                                 />
                              </div>
                           </div>
                        )}
                        {isEdit &&
                           ci.existingImages &&
                           ci.existingImages.length > 0 && (
                              <div>
                                 <p className="text-[10px] text-gray-400 mb-1.5">
                                    Ảnh hiện tại ({activeExisting.length}/
                                    {ci.existingImages.length})
                                    <span className="text-gray-300 ml-1">
                                       — click để xóa
                                    </span>
                                 </p>
                                 <div className="flex gap-1.5 flex-wrap">
                                    {ci.existingImages.map((img) => (
                                       <div
                                          key={img.id}
                                          onClick={() =>
                                             onToggleDeleteImg(ci._key, img.id)
                                          }
                                          className={`relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer transition-all group
                                          ${img.toDelete ? "opacity-40 ring-2 ring-red-400" : "ring-1 ring-gray-200 hover:ring-red-300"}`}
                                       >
                                          <Image
                                             src={img.url}
                                             alt=""
                                             width={48}
                                             height={48}
                                             className="object-contain w-full h-full"
                                             unoptimized
                                          />
                                          {img.toDelete && (
                                             <div className="absolute inset-0 bg-red-100/60 flex items-center justify-center">
                                                <X
                                                   size={12}
                                                   className="text-red-500"
                                                />
                                             </div>
                                          )}
                                       </div>
                                    ))}
                                 </div>
                              </div>
                           )}
                        <div className="grid grid-cols-6 gap-1.5">
                           {ci.previews.map((url, i) => (
                              <div
                                 key={i}
                                 className="aspect-square relative rounded-lg overflow-hidden ring-1 ring-gray-200 group bg-gray-50"
                              >
                                 <Image
                                    src={url}
                                    alt=""
                                    fill
                                    className="object-contain p-0.5"
                                    unoptimized
                                 />
                                 <button
                                    type="button"
                                    onClick={() => onRemoveNewFile(ci._key, i)}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-gray-900/80 text-white rounded-full items-center justify-center hidden group-hover:flex cursor-pointer"
                                 >
                                    <X size={9} />
                                 </button>
                                 <div className="absolute bottom-0 left-0 right-0 bg-black/20 py-0.5 text-center">
                                    <span className="text-[8px] text-white/90">
                                       Main
                                    </span>
                                 </div>
                              </div>
                           ))}
                           {Array.from({
                              length: Math.max(0, SLOTS - newCount),
                           }).map((_, i) => (
                              <label
                                 key={`s${i}`}
                                 className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all group"
                              >
                                 <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="hidden"
                                    onChange={(e) =>
                                       onHandleFiles(ci._key, e.target.files)
                                    }
                                 />
                                 <ImagePlus
                                    size={12}
                                    className="text-gray-300 group-hover:text-gray-500 mb-0.5 transition-colors"
                                 />
                                 <span className="text-[8px] text-gray-300 group-hover:text-gray-400 font-mono">
                                    #{String(newCount + i + 1).padStart(2, "0")}
                                 </span>
                              </label>
                           ))}
                           <label className="aspect-square flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50 cursor-pointer transition-all group">
                              <input
                                 type="file"
                                 accept="image/*"
                                 multiple
                                 className="hidden"
                                 onChange={(e) =>
                                    onHandleFiles(ci._key, e.target.files)
                                 }
                              />
                              <Plus
                                 size={14}
                                 className="text-gray-300 group-hover:text-gray-500 transition-colors"
                              />
                              <span className="text-[8px] text-gray-300 group-hover:text-gray-400">
                                 Thêm
                              </span>
                           </label>
                        </div>
                     </div>
                  </div>
               );
            })}
         </div>
         <button
            type="button"
            onClick={onAddColor}
            className="flex items-center gap-1.5 text-[12px] text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
         >
            <Plus size={12} /> Thêm màu thủ công
         </button>
      </div>
   );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN FORM
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_BASE_PRICE = 20_000_000;

interface ProductFormProps {
   product?: ProductDetail;
}

export default function ProductForm({ product }: ProductFormProps) {
   const router = useRouter();
   const isEdit = !!product;

   const [brands, setBrands] = useState<BrandOption[]>([]);
   const [categories, setCategories] = useState<CategoryOption[]>([]);
   const [loadingOptions, setLoadingOptions] = useState(true);
   const [template, setTemplate] = useState<CategoryTemplate | null>(null);
   const [loadingTemplate, setLoadingTemplate] = useState(false);
   const [showCategoryTree, setShowCategoryTree] = useState(false);
   const categoryTreeRef = useRef<HTMLDivElement>(null);
   const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(
      null,
   );
   const [showConfirmModal, setShowConfirmModal] = useState(false);

   const [name, setName] = useState(product?.name ?? "");
   const [brandId, setBrandId] = useState(product?.brandId ?? "");
   const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
   const [description, setDescription] = useState(product?.description ?? "");
   const [isActive, setIsActive] = useState(product?.isActive ?? true);
   const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
   const [variantDisplay, setVariantDisplay] = useState<"SELECTOR" | "CARD">(
      (product as any)?.variantDisplay ?? "SELECTOR",
   );

   // basePrice: khi edit lấy giá default variant làm heuristic; khi tạo mới = 20tr
   const [basePrice, setBasePrice] = useState<number>(() => {
      if (product?.variants?.length) {
         const def = product.variants.find((v) => v.isDefault && !v.deletedAt);
         if (def) return def.price;
      }
      return DEFAULT_BASE_PRICE;
   });

   const [checked, setChecked] = useState<Record<string, Set<string>>>(() => {
      if (product?.variants?.length) {
         const map: Record<string, Set<string>> = {};
         for (const v of product.variants.filter((v) => !v.deletedAt)) {
            for (const va of v.variantAttributes) {
               const attrId = va.attributeOption.attributeId;
               if (!map[attrId]) map[attrId] = new Set();
               map[attrId].add(va.attributeOptionId);
            }
         }
         return map;
      }
      return {};
   });

   const [variants, setVariants] = useState<VariantForm[]>(() => {
      if (product?.variants?.length) {
         return product.variants
            .filter((v) => !v.deletedAt)
            .map((v) => ({
               _key: uid(),
               id: v.id,
               code: v.code ?? "",
               computedPrice: v.price,
               quantity: String(v.quantity),
               isDefault: v.isDefault,
               isActive: v.isActive,
               attributes: Object.fromEntries(
                  v.variantAttributes.map((va) => [
                     va.attributeOption.attributeId,
                     va.attributeOptionId,
                  ]),
               ),
            }));
      }
      return [];
   });

   const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());

   const [colorImages, setColorImages] = useState<ColorImageForm[]>(() => {
      if (product?.img?.length) {
         const colorMap = new Map<string, ExistingImage[]>();
         for (const img of product.img) {
            if (!colorMap.has(img.color)) colorMap.set(img.color, []);
            if (img.imageUrl)
               colorMap
                  .get(img.color)!
                  .push({ id: img.id, url: img.imageUrl, toDelete: false });
         }
         return Array.from(colorMap.entries()).map(([color, imgs]) => ({
            _key: uid(),
            color,
            altText: "",
            files: [],
            previews: [],
            existingImages: imgs,
         }));
      }
      return [];
   });

   const [specs, setSpecs] = useState<SpecForm[]>(() => {
      if (product?.productSpecifications?.length) {
         return product.productSpecifications.map((s) => ({
            specificationId: s.specificationId,
            value: s.value,
            isHighlight: s.isHighlight,
            enabled: true,
         }));
      }
      return [];
   });

   const [errors, setErrors] = useState<Record<string, string>>({});
   const [submitting, setSubmitting] = useState(false);
   const [submitError, setSubmitError] = useState<string | null>(null);
   const createdIdRef = useRef<string | null>(null);

   const colorOptions =
      template?.attributes.find((a) => a.code === "color")?.options ?? [];
   const categoryTree = buildCategoryTree(categories);
   const categoryPath = getCategoryPath(categoryId, categories);

   const nameRef = useRef(name);
   useEffect(() => {
      nameRef.current = name;
   }, [name]);

   // Close category tree on outside click
   useEffect(() => {
      const handler = (e: MouseEvent) => {
         if (
            categoryTreeRef.current &&
            !categoryTreeRef.current.contains(e.target as Node)
         )
            setShowCategoryTree(false);
      };
      if (showCategoryTree) document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [showCategoryTree]);

   // Load brands + categories
   useEffect(() => {
      Promise.allSettled([
         apiRequest.get<any>("/brands/admin/all", { params: { limit: 100 } }),
         apiRequest.get<any>("/categories/admin/all", {
            params: { limit: 500 },
         }),
      ])
         .then(([b, c]) => {
            if (b.status === "fulfilled") {
               const d = b.value.data;
               setBrands(Array.isArray(d) ? d : (d?.data ?? []));
            }
            if (c.status === "fulfilled") {
               const d = c.value.data;
               setCategories(Array.isArray(d) ? d : (d?.data ?? []));
            }
         })
         .finally(() => setLoadingOptions(false));
   }, []);

   // Load category template
   const loadTemplate = useCallback(async (id: string) => {
      if (!id) {
         setTemplate(null);
         return;
      }
      setLoadingTemplate(true);
      try {
         const res = await apiRequest.get<any>(`/categories/${id}/template`);
         const t = res.data?.template ?? res.data;
         // Normalise: ensure priceAdjustment on every option
         const attrs: TemplateAttribute[] = (t?.attributes ?? []).map(
            (a: any) => ({
               ...a,
               options: (a.options ?? []).map((o: any) => ({
                  ...o,
                  priceAdjustment: o.priceAdjustment ?? 0,
               })),
            }),
         );
         setTemplate({
            attributes: attrs,
            specifications: t?.specifications ?? [],
         });
      } catch {
         setTemplate(null);
      } finally {
         setLoadingTemplate(false);
      }
   }, []);

   useEffect(() => {
      if (categoryId) loadTemplate(categoryId);
      else setTemplate(null);
   }, [categoryId, loadTemplate]);

   // Sync specs when template loads
   useEffect(() => {
      if (!template) return;
      const all = template.specifications.flatMap((g) => g.items);
      setSpecs((prev) => {
         const ids = new Set(prev.map((s) => s.specificationId));
         const toAdd = all
            .filter((s) => !ids.has(s.id))
            .map((s) => ({
               specificationId: s.id,
               value: "",
               isHighlight: false,
               enabled: true,
            }));
         return toAdd.length ? [...prev, ...toAdd] : prev;
      });
   }, [template]);

   // Helper: recompute all variant prices
   const recomputeAll = useCallback(
      (vars: VariantForm[], tmpl: CategoryTemplate | null, bp: number) =>
         vars.map((v) => ({
            ...v,
            computedPrice: computeVariantPrice(bp, v.attributes, tmpl),
         })),
      [],
   );

   // Auto-generate variants when checked changes
   useEffect(() => {
      if (!template || !template.attributes.length) return;
      const combos = cartesian(template.attributes, checked);
      if (!combos.length) {
         if (!isEdit) setVariants([]);
         return;
      }
      setVariants((prev) => {
         const existingMap = new Map(
            prev.map((v) => {
               const key = template.attributes
                  .map((a) => v.attributes[a.id] ?? "")
                  .join("|");
               return [key, v];
            }),
         );
         const newVariants = combos.map((attrMap, i) => {
            const key = template.attributes
               .map((a) => attrMap[a.id] ?? "")
               .join("|");
            const existing = existingMap.get(key);
            const cp = computeVariantPrice(basePrice, attrMap, template);
            if (existing)
               return { ...existing, attributes: attrMap, computedPrice: cp };
            const labels = template.attributes
               .map(
                  (a) =>
                     a.options.find((o) => o.id === attrMap[a.id])?.label ?? "",
               )
               .filter(Boolean);
            return {
               _key: uid(),
               code: generateSKU(nameRef.current, labels),
               computedPrice: cp,
               quantity: "0",
               isDefault: false,
               isActive: true,
               attributes: attrMap,
            };
         });

         // Đảm bảo đúng 1 default: giữ default cũ nếu còn tồn tại, không thì set index 0
         const hasDefault = newVariants.some((v) => v.isDefault);
         if (!hasDefault && newVariants.length > 0)
            newVariants[0].isDefault = true;

         return newVariants;
      });
      setSelectedKeys(new Set());
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [checked, template]);

   // Recompute prices when basePrice changes
   useEffect(() => {
      setVariants((prev) => recomputeAll(prev, template, basePrice));
   }, [basePrice, template, recomputeAll]);

   // Auto-regen SKU when name changes
   useEffect(() => {
      if (!template || !name.trim()) return;
      setVariants((prev) =>
         prev.map((v) => {
            const labels = template.attributes
               .map(
                  (a) =>
                     a.options.find((o) => o.id === v.attributes[a.id])
                        ?.label ?? "",
               )
               .filter(Boolean);
            const prefix = normalizeStr(name.trim());
            if (!v.code.trim() || v.code.startsWith(prefix + "-"))
               return { ...v, code: generateSKU(name, labels) };
            return v;
         }),
      );
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [name]);

   // Sync color image groups when color selection changes
   useEffect(() => {
      if (isEdit || !template) return;
      const colorAttr = template.attributes.find((a) => a.code === "color");
      if (!colorAttr) return;
      const selectedColorValues = [...(checked[colorAttr.id] ?? [])]
         .map((id) => colorAttr.options.find((o) => o.id === id)?.value)
         .filter(Boolean) as string[];
      setColorImages((prev) => {
         const filtered = prev.filter(
            (ci) => !ci.color || selectedColorValues.includes(ci.color),
         );
         const have = new Set(filtered.map((c) => c.color).filter(Boolean));
         const toAdd = selectedColorValues
            .filter((c) => !have.has(c))
            .map((c) => ({
               _key: uid(),
               color: c,
               altText: "",
               files: [],
               previews: [],
            }));
         return [...filtered, ...toAdd];
      });
   }, [checked, template, isEdit]);

   // Category select
   const handleCategorySelect = useCallback(
      async (newId: string) => {
         setShowCategoryTree(false);
         if (newId === categoryId) return;
         const hasSelection =
            variants.length > 0 ||
            Object.values(checked).some((s) => s.size > 0);
         if (!hasSelection) {
            setCategoryId(newId);
            setChecked({});
            return;
         }
         try {
            const res = await apiRequest.get<any>(
               `/categories/${newId}/template`,
            );
            const t = res.data?.template ?? res.data;
            const newAttrs: TemplateAttribute[] = t?.attributes ?? [];
            const currentAttrs = template?.attributes ?? [];
            const schemaChanged =
               JSON.stringify(
                  newAttrs.map((a) => ({ id: a.id, code: a.code })),
               ) !==
               JSON.stringify(
                  currentAttrs.map((a) => ({ id: a.id, code: a.code })),
               );
            if (
               schemaChanged &&
               (variants.length > 0 ||
                  Object.values(checked).some((s) => s.size > 0))
            ) {
               setPendingCategoryId(newId);
               setShowConfirmModal(true);
               return;
            }
         } catch {
            /* proceed */
         }
         setCategoryId(newId);
         setChecked({});
      },
      [categoryId, variants.length, checked, template],
   );

   const confirmCategoryChange = useCallback(() => {
      if (!pendingCategoryId) return;
      setCategoryId(pendingCategoryId);
      setChecked({});
      setVariants([]);
      setColorImages([]);
      setSelectedKeys(new Set());
      setSpecs([]);
      setShowConfirmModal(false);
      setPendingCategoryId(null);
   }, [pendingCategoryId]);

   const cancelCategoryChange = useCallback(() => {
      setShowConfirmModal(false);
      setPendingCategoryId(null);
   }, []);

   // Attribute toggle
   const handleToggle = (attrId: string, optId: string) =>
      setChecked((prev) => {
         const next = { ...prev, [attrId]: new Set(prev[attrId] ?? []) };
         next[attrId].has(optId)
            ? next[attrId].delete(optId)
            : next[attrId].add(optId);
         return next;
      });

   const handleAddOption = (attrId: string, label: string, value: string) =>
      setTemplate((prev) =>
         prev
            ? {
                 ...prev,
                 attributes: prev.attributes.map((a) =>
                    a.id !== attrId
                       ? a
                       : {
                            ...a,
                            options: [
                               ...a.options,
                               {
                                  id: "new-" + uid(),
                                  value,
                                  label,
                                  priceAdjustment: 0,
                               },
                            ],
                         },
                 ),
              }
            : prev,
      );

   // Update priceAdjustment for an option → recompute affected variants immediately
   const handleUpdatePriceAdjustment = useCallback(
      (attrId: string, optId: string, adj: number) => {
         // Update template state
         setTemplate((prev) => {
            if (!prev) return prev;
            const updated = {
               ...prev,
               attributes: prev.attributes.map((a) =>
                  a.id !== attrId
                     ? a
                     : {
                          ...a,
                          options: a.options.map((o) =>
                             o.id === optId
                                ? { ...o, priceAdjustment: adj }
                                : o,
                          ),
                       },
               ),
            };
            // Recompute variants with the updated template inline (avoid stale closure)
            setVariants((prevV) =>
               prevV.map((v) => ({
                  ...v,
                  computedPrice: computeVariantPrice(
                     basePrice,
                     v.attributes,
                     updated,
                  ),
               })),
            );
            return updated;
         });
      },
      [basePrice],
   );

   // Variant helpers
   const updateVariant = (key: string, field: keyof VariantForm, value: any) =>
      setVariants((p) =>
         p.map((v) => (v._key === key ? { ...v, [field]: value } : v)),
      );
   const setDefaultVariant = (key: string) =>
      setVariants((p) => p.map((v) => ({ ...v, isDefault: v._key === key })));
   const removeVariant = (key: string) => {
      setVariants((p) => p.filter((v) => v._key !== key));
      setSelectedKeys((prev) => {
         const n = new Set(prev);
         n.delete(key);
         return n;
      });
   };
   const toggleSelect = (key: string) =>
      setSelectedKeys((prev) => {
         const n = new Set(prev);
         n.has(key) ? n.delete(key) : n.add(key);
         return n;
      });
   const toggleAll = (v: boolean) =>
      setSelectedKeys(v ? new Set(variants.map((v) => v._key)) : new Set());

   // Color image helpers
   const addColor = () =>
      setColorImages((p) => [
         ...p,
         { _key: uid(), color: "", altText: "", files: [], previews: [] },
      ]);
   const removeColor = (key: string) => {
      colorImages
         .find((c) => c._key === key)
         ?.previews.forEach((u) => URL.revokeObjectURL(u));
      setColorImages((p) => p.filter((c) => c._key !== key));
   };
   const updateColor = (key: string, field: "color" | "altText", val: string) =>
      setColorImages((p) =>
         p.map((c) => (c._key === key ? { ...c, [field]: val } : c)),
      );
   const handleFiles = (key: string, files: FileList | null) => {
      if (!files) return;
      const newF = Array.from(files);
      const newP = newF.map((f) => URL.createObjectURL(f));
      setColorImages((p) =>
         p.map((c) =>
            c._key === key
               ? {
                    ...c,
                    files: [...c.files, ...newF],
                    previews: [...c.previews, ...newP],
                 }
               : c,
         ),
      );
   };
   const removeNewFile = (key: string, idx: number) =>
      setColorImages((p) =>
         p.map((c) => {
            if (c._key !== key) return c;
            URL.revokeObjectURL(c.previews[idx]);
            return {
               ...c,
               files: c.files.filter((_, i) => i !== idx),
               previews: c.previews.filter((_, i) => i !== idx),
            };
         }),
      );
   const toggleDeleteImg = (key: string, imgId: string) =>
      setColorImages((p) =>
         p.map((c) => {
            if (c._key !== key || !c.existingImages) return c;
            return {
               ...c,
               existingImages: c.existingImages.map((i) =>
                  i.id === imgId ? { ...i, toDelete: !i.toDelete } : i,
               ),
            };
         }),
      );

   // Spec helpers
   const toggleSpec = (id: string) =>
      setSpecs((p) =>
         p.map((s) =>
            s.specificationId === id
               ? { ...s, enabled: !s.enabled, value: s.enabled ? "" : s.value }
               : s,
         ),
      );
   const updateSpec = (id: string, value: string) =>
      setSpecs((p) =>
         p.map((s) => (s.specificationId === id ? { ...s, value } : s)),
      );
   const toggleHighlight = (id: string) =>
      setSpecs((p) =>
         p.map((s) =>
            s.specificationId === id
               ? { ...s, isHighlight: !s.isHighlight }
               : s,
         ),
      );

   // Validate
   const validate = () => {
      const errs: Record<string, string> = {};
      if (!name.trim() || name.trim().length < 3)
         errs.name = "Tên sản phẩm phải có ít nhất 3 ký tự";
      if (!brandId) errs.brandId = "Vui lòng chọn thương hiệu";
      if (!categoryId) errs.categoryId = "Vui lòng chọn danh mục";
      if (!basePrice || basePrice <= 0) errs.basePrice = "Giá gốc phải > 0";
      const hasAttributes = template && template.attributes.length > 0;
      if (hasAttributes) {
         if (!variants.length) errs.variants = "Phải có ít nhất 1 biến thể";
         else if (variants.filter((v) => v.isDefault).length !== 1)
            errs.variants = "Phải có đúng 1 biến thể mặc định";
         variants.forEach((v) => {
            if (!v.code.trim()) errs[`variant_${v._key}_code`] = "SKU bắt buộc";
         });
         if (
            !isEdit &&
            !colorImages.some((c) => c.color.trim() && c.files.length > 0)
         )
            errs.colorImages = "Cần ít nhất 1 màu có ảnh";
      }
      setErrors(errs);
      return !Object.keys(errs).length;
   };

   // Submit
   const handleSubmit = async () => {
      if (!validate()) return;
      setSubmitting(true);
      setSubmitError(null);
      createdIdRef.current = null;
      try {
         // Collect option price adjustments (non-zero only)
         const optionAdjustments =
            template?.attributes.flatMap((a) =>
               a.options
                  .filter((o) => o.priceAdjustment !== 0)
                  .map((o) => ({
                     attributeOptionId: o.id,
                     priceAdjustment: o.priceAdjustment,
                  })),
            ) ?? [];

         const variantsPayload = variants.map((v) => ({
            ...(v.id ? { id: v.id } : {}),
            code: v.code.trim(),
            price: v.computedPrice, // final price = basePrice + adjustments
            quantity: Number(v.quantity) || 0,
            isDefault: v.isDefault,
            isActive: v.isActive,
            variantAttributes: Object.entries(v.attributes)
               .filter(([, optId]) => optId)
               .map(([, attributeOptionId]) => ({ attributeOptionId })),
         }));

         const colorImagesPayload = colorImages
            .filter((c) => {
               if (!c.color.trim()) return false;
               if (!isEdit) return c.files.length > 0;
               return (
                  c.files.length > 0 ||
                  (c.existingImages ?? []).some((i) => i.toDelete)
               );
            })
            .map((c) => ({
               color: c.color.trim(),
               altText: c.altText.trim() || c.color.trim(),
               ...(isEdit && c.existingImages
                  ? {
                       deleteImageIds: c.existingImages
                          .filter((i) => i.toDelete)
                          .map((i) => i.id),
                    }
                  : {}),
            }));

         const specificationsPayload = specs
            .filter((s) => s.enabled && s.value.trim())
            .map((s) => ({
               specificationId: s.specificationId,
               value: s.value.trim(),
               isHighlight: s.isHighlight,
            }));

         const payload = {
            name: name.trim(),
            brandId,
            categoryId,
            description: description.trim() || undefined,
            isActive,
            isFeatured,
            variantDisplay,
            basePrice,
            optionPriceAdjustments: optionAdjustments,
            variants: variantsPayload,
            colorImages: colorImagesPayload,
            specifications: specificationsPayload,
         };

         const fd = buildFormData(
            { ...payload, colorImages: colorImagesPayload },
            colorImages.filter((c) => c.color.trim() && c.files.length > 0),
         );

         if (isEdit && product) {
            createdIdRef.current = product.id;
            await updateProduct(product.id, fd);
            router.push(`/admin/products/${product.id}`);
         } else {
            const res = await createProduct(fd);
            createdIdRef.current = res.data.id;
            router.push(`/admin/products/${res.data.id}`);
         }
      } catch (e: any) {
         const isTimeout =
            e?.name === "AbortError" ||
            e?.message?.includes("quá thời gian") ||
            e?.message?.includes("timeout") ||
            e?.message?.includes("Timeout");
         if (isTimeout) {
            if (createdIdRef.current)
               router.push(`/admin/products/${createdIdRef.current}`);
            else if (isEdit && product)
               router.push(`/admin/products/${product.id}`);
            else router.push("/admin/products");
            return;
         }
         setSubmitError(e?.message ?? "Đã xảy ra lỗi, vui lòng thử lại");
      } finally {
         setSubmitting(false);
      }
   };

   if (loadingOptions) {
      return (
         <div className="flex items-center justify-center py-24 gap-3">
            <Loader2 size={18} className="animate-spin text-gray-400" />
            <span className="text-[13px] text-gray-400">
               Đang tải dữ liệu...
            </span>
         </div>
      );
   }

   const filledSpecsCount = specs.filter(
      (s) => s.enabled && s.value.trim(),
   ).length;
   const totalSpecsCount = specs.filter((s) => s.enabled).length;
   const totalSelectedOptions = Object.values(checked).reduce(
      (s, v) => s + v.size,
      0,
   );

   return (
      <>
         {showConfirmModal && (
            <CategoryChangeModal
               onConfirm={confirmCategoryChange}
               onCancel={cancelCategoryChange}
            />
         )}

         <div className="space-y-3 pb-24">
            {/* ── BASIC INFO ─────────────────────────────────────────────── */}
            <Section icon={<FileText size={13} />} title="Thông tin cơ bản">
               <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                     Tên sản phẩm <span className="text-red-400">*</span>
                  </p>
                  <input
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="VD: iPhone 15 Pro Max"
                     className={`${inp(!!errors.name)} text-[14px] font-medium`}
                  />
                  {errors.name && (
                     <p className="text-[11px] text-red-500 mt-1">
                        {errors.name}
                     </p>
                  )}
               </div>

               <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                     Thương hiệu <span className="text-red-400">*</span>
                  </p>
                  <Select
                     options={brands.map((b) => ({
                        value: b.id,
                        label: b.name,
                     }))}
                     value={
                        brandId
                           ? {
                                value: brandId,
                                label:
                                   brands.find((b) => b.id === brandId)?.name ??
                                   "",
                             }
                           : null
                     }
                     onChange={(o: SelectOption | null) =>
                        setBrandId(o?.value ?? "")
                     }
                     placeholder="Chọn thương hiệu..."
                     isSearchable
                     isClearable
                     styles={rsStyles(!!errors.brandId)}
                     noOptionsMessage={() => "Không tìm thấy"}
                  />
                  {errors.brandId && (
                     <p className="text-[11px] text-red-500 mt-1">
                        {errors.brandId}
                     </p>
                  )}
               </div>

               <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                     Danh mục <span className="text-red-400">*</span>
                  </p>
                  <div className="relative" ref={categoryTreeRef}>
                     <button
                        type="button"
                        onClick={() => setShowCategoryTree((v) => !v)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-[13px] bg-gray-50 border rounded-lg
                           hover:bg-white focus:outline-none focus:bg-white focus:ring-4 focus:ring-gray-900/5 transition-all cursor-pointer
                           ${errors.categoryId ? "border-red-400" : "border-gray-200"}`}
                     >
                        {categoryPath.length > 0 ? (
                           <div className="flex items-center gap-1 flex-wrap">
                              {categoryPath.map((c, i) => (
                                 <span
                                    key={c.id}
                                    className="flex items-center gap-1"
                                 >
                                    {i > 0 && (
                                       <ChevronRight
                                          size={11}
                                          className="text-gray-400"
                                       />
                                    )}
                                    <span
                                       className={
                                          i === categoryPath.length - 1
                                             ? "text-gray-900 font-medium"
                                             : "text-gray-500"
                                       }
                                    >
                                       {c.name}
                                    </span>
                                 </span>
                              ))}
                           </div>
                        ) : (
                           <span className="text-gray-400">
                              Chọn danh mục...
                           </span>
                        )}
                        <ChevronDown
                           size={14}
                           className={`text-gray-400 flex-shrink-0 ml-2 transition-transform ${showCategoryTree ? "rotate-180" : ""}`}
                        />
                     </button>
                     {showCategoryTree && (
                        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2 max-h-72 overflow-y-auto">
                           <CategoryTree
                              nodes={categoryTree}
                              selectedId={categoryId}
                              onSelect={handleCategorySelect}
                           />
                        </div>
                     )}
                  </div>
                  {errors.categoryId && (
                     <p className="text-[11px] text-red-500 mt-1">
                        {errors.categoryId}
                     </p>
                  )}
               </div>

               {/* ── BASE PRICE ── */}
               <BasePriceInput
                  value={basePrice}
                  onChange={setBasePrice}
                  error={errors.basePrice}
               />

               <div className="flex gap-2 flex-wrap">
                  {(
                     [
                        {
                           label: "Hiển thị",
                           value: isActive,
                           set: setIsActive,
                        },
                        {
                           label: "Nổi bật",
                           value: isFeatured,
                           set: setIsFeatured,
                        },
                     ] as const
                  ).map((item) => (
                     <div
                        key={item.label}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50"
                     >
                        <span className="text-[13px] text-gray-700">
                           {item.label}
                        </span>
                        <Toggle
                           value={item.value}
                           onChange={item.set}
                           size="sm"
                        />
                     </div>
                  ))}
                  <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-gray-200 bg-gray-50/50">
                     <span className="text-[13px] text-gray-700">
                        Kiểu biến thể
                     </span>
                     <select
                        value={variantDisplay}
                        onChange={(e) =>
                           setVariantDisplay(
                              e.target.value as "SELECTOR" | "CARD",
                           )
                        }
                        className="text-[12px] border border-gray-200 rounded-md px-2 py-1 bg-white focus:outline-none cursor-pointer text-gray-700"
                     >
                        <option value="SELECTOR">SELECTOR</option>
                        <option value="CARD">CARD</option>
                     </select>
                  </div>
               </div>

               <div>
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                     Mô tả sản phẩm
                  </p>
                  <CKEditorWrapper
                     value={description}
                     onChange={setDescription}
                     uploadFolder="products"
                     minHeight={280}
                  />
               </div>
            </Section>

            {/* ── VARIANTS ───────────────────────────────────────────────── */}
            <Section
               icon={<Layers size={13} />}
               title="Thuộc tính & Biến thể"
               badge={variants.length > 0 ? variants.length : undefined}
            >
               {!categoryId ? (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-amber-50 border border-amber-100 text-[12px] text-amber-700">
                     <Info size={13} className="flex-shrink-0" />
                     Chọn danh mục để hiển thị thuộc tính biến thể
                  </div>
               ) : loadingTemplate ? (
                  <div className="flex items-center gap-2 py-4 text-[13px] text-gray-400">
                     <Loader2 size={14} className="animate-spin" /> Đang tải
                     template...
                  </div>
               ) : !template || template.attributes.length === 0 ? (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg bg-blue-50 border border-blue-100 text-[12px] text-blue-700">
                     <Info size={13} className="flex-shrink-0" />
                     Danh mục này không có cấu hình thuộc tính — sản phẩm đơn
                     giản (không có biến thể).
                  </div>
               ) : (
                  <div className="space-y-4">
                     <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                           <div>
                              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                                 Chọn thuộc tính & điều chỉnh giá
                              </p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                 Click option để chọn → nhập ±giá so với giá gốc
                                 ({fmtVND(basePrice)})
                              </p>
                           </div>
                           {variants.length > 0 && (
                              <div className="flex items-center gap-1.5 text-[11px] text-emerald-600">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                 Tự động · <strong>{variants.length}</strong>{" "}
                                 biến thể
                              </div>
                           )}
                        </div>
                        <ChipAttributeSelector
                           template={template}
                           checked={checked}
                           basePrice={basePrice}
                           onToggle={handleToggle}
                           onAddOption={handleAddOption}
                           onUpdatePriceAdjustment={handleUpdatePriceAdjustment}
                        />
                     </div>

                     {variants.length > 0 && name.trim() && (
                        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
                           <div className="flex items-center gap-2 text-[12px] text-gray-600">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {totalSelectedOptions} options đã chọn
                           </div>
                           <button
                              type="button"
                              onClick={() =>
                                 variants.forEach((v) => {
                                    const labels = template.attributes
                                       .map(
                                          (a) =>
                                             a.options.find(
                                                (o) =>
                                                   o.id === v.attributes[a.id],
                                             )?.label ?? "",
                                       )
                                       .filter(Boolean);
                                    const sku = generateSKU(name, labels);
                                    if (sku) updateVariant(v._key, "code", sku);
                                 })
                              }
                              className="flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 transition-colors cursor-pointer"
                           >
                              <Sparkles size={11} /> Tạo lại tất cả SKU
                           </button>
                        </div>
                     )}

                     {errors.variants && (
                        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[12px]">
                           <AlertCircle size={13} /> {errors.variants}
                        </div>
                     )}

                     {variants.length > 0 ? (
                        <VariantTable
                           variants={variants}
                           template={template}
                           basePrice={basePrice}
                           selectedKeys={selectedKeys}
                           onToggleSelect={toggleSelect}
                           onToggleAll={toggleAll}
                           onUpdate={updateVariant}
                           onSetDefault={setDefaultVariant}
                           onRemove={removeVariant}
                           errors={errors}
                           productName={name}
                        />
                     ) : (
                        <div className="flex items-center justify-center py-8 text-[13px] text-gray-400 rounded-lg border-2 border-dashed border-gray-200">
                           Click vào chip option để tự động sinh biến thể
                        </div>
                     )}
                  </div>
               )}
            </Section>

            {/* ── COLOR IMAGES ───────────────────────────────────────────── */}
            <Section
               icon={<Palette size={13} />}
               title="Hình ảnh biến thể"
               badge={colorImages.filter((c) => c.color).length || undefined}
            >
               {colorImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-3 rounded-lg border-2 border-dashed border-gray-200 text-center">
                     <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                        <ImagePlus size={16} className="text-gray-400" />
                     </div>
                     <p className="text-[13px] text-gray-500">
                        Chọn màu sắc ở biến thể để tự động tạo nhóm ảnh
                     </p>
                     <button
                        type="button"
                        onClick={addColor}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-[12px] text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                     >
                        <Plus size={12} /> Thêm màu thủ công
                     </button>
                  </div>
               ) : (
                  <ColorImages
                     colorImages={colorImages}
                     colorOptions={colorOptions}
                     isEdit={isEdit}
                     errors={errors}
                     onAddColor={addColor}
                     onRemoveColor={removeColor}
                     onUpdateColor={updateColor}
                     onHandleFiles={handleFiles}
                     onRemoveNewFile={removeNewFile}
                     onToggleDeleteImg={toggleDeleteImg}
                  />
               )}
            </Section>

            {/* ── SPECIFICATIONS ─────────────────────────────────────────── */}
            {categoryId &&
               !loadingTemplate &&
               template &&
               template.specifications.length > 0 && (
                  <Section
                     icon={<Package size={13} />}
                     title="Thông số kỹ thuật"
                     badge={`${filledSpecsCount}/${totalSpecsCount}`}
                     defaultOpen={false}
                  >
                     <div className="space-y-5">
                        {template.specifications.map((group) => (
                           <div key={group.groupName}>
                              <div className="flex items-center gap-3 mb-3">
                                 <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider whitespace-nowrap">
                                    {group.groupName}
                                 </p>
                                 <div className="flex-1 h-px bg-gray-200" />
                              </div>
                              <div className="grid grid-cols-2 gap-2">
                                 {group.items.map((spec) => {
                                    const s = specs.find(
                                       (s) => s.specificationId === spec.id,
                                    );
                                    const enabled = s?.enabled ?? true;
                                    return (
                                       <div
                                          key={spec.id}
                                          className={`flex items-start gap-2.5 p-2.5 rounded-lg border transition-all ${enabled ? "border-gray-200 bg-white" : "border-transparent bg-gray-50/40 opacity-40"}`}
                                       >
                                          <div className="min-w-0 flex-1 space-y-1.5">
                                             <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className="text-[12px] font-semibold text-gray-700">
                                                   {spec.name}
                                                </span>
                                                {spec.isRequired && (
                                                   <span className="text-red-400 text-[11px]">
                                                      *
                                                   </span>
                                                )}
                                                {spec.unit && (
                                                   <span className="text-[10px] text-gray-400">
                                                      ({spec.unit})
                                                   </span>
                                                )}
                                                {spec.isFilterable && (
                                                   <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-500 font-semibold border border-blue-100">
                                                      filter
                                                   </span>
                                                )}
                                             </div>
                                             {enabled && (
                                                <div className="flex items-center gap-1.5">
                                                   <input
                                                      value={s?.value ?? ""}
                                                      onChange={(e) =>
                                                         updateSpec(
                                                            spec.id,
                                                            e.target.value,
                                                         )
                                                      }
                                                      placeholder={
                                                         spec.unit
                                                            ? `Nhập (${spec.unit})`
                                                            : "Nhập giá trị..."
                                                      }
                                                      className={`flex-1 px-2.5 py-1.5 text-[12px] border rounded-md bg-gray-50 text-gray-900
                                                      placeholder:text-gray-300 focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-4 focus:ring-gray-900/5 transition-all
                                                      ${!s?.value && spec.isRequired ? "border-red-200" : "border-gray-200"}`}
                                                   />
                                                   <button
                                                      type="button"
                                                      onClick={() =>
                                                         toggleHighlight(
                                                            spec.id,
                                                         )
                                                      }
                                                      className={`p-1.5 rounded-md transition-all cursor-pointer flex-shrink-0 ${s?.isHighlight ? "text-amber-500 bg-amber-50" : "text-gray-300 hover:text-amber-400 hover:bg-amber-50"}`}
                                                   >
                                                      <Star
                                                         size={12}
                                                         fill={
                                                            s?.isHighlight
                                                               ? "currentColor"
                                                               : "none"
                                                         }
                                                      />
                                                   </button>
                                                </div>
                                             )}
                                          </div>
                                          {!spec.isRequired && (
                                             <Toggle
                                                value={enabled}
                                                onChange={() =>
                                                   toggleSpec(spec.id)
                                                }
                                                size="sm"
                                             />
                                          )}
                                       </div>
                                    );
                                 })}
                              </div>
                           </div>
                        ))}
                     </div>
                  </Section>
               )}

            {submitError && (
               <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-[13px]">
                  <AlertCircle size={14} /> {submitError}
               </div>
            )}

            {/* ── FOOTER BAR ─────────────────────────────────────────────── */}
            <div className="sticky bottom-0 -mx-1 bg-white border-t border-gray-200 px-5 py-3 flex items-center justify-between z-20">
               <div className="flex items-center gap-5 text-[12px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                     <BadgeDollarSign size={12} className="text-gray-400" />
                     <span>
                        Giá gốc:{" "}
                        <strong className="text-gray-900">
                           {fmtVND(basePrice)}
                        </strong>
                     </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Layers size={12} className="text-gray-400" />
                     <span>
                        <strong className="text-gray-900">
                           {variants.length}
                        </strong>{" "}
                        biến thể
                     </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Palette size={12} className="text-gray-400" />
                     <span>
                        <strong className="text-gray-900">
                           {colorImages.filter((c) => c.color).length}
                        </strong>{" "}
                        màu
                     </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                     <Package size={12} className="text-gray-400" />
                     <span>
                        <strong className="text-gray-900">
                           {filledSpecsCount}
                        </strong>{" "}
                        thông số
                     </span>
                  </div>
               </div>
               <div className="flex items-center gap-2.5">
                  <button
                     type="button"
                     onClick={() => router.back()}
                     disabled={submitting}
                     className="px-4 py-2.5 border border-gray-200 rounded-lg text-[13px] text-gray-700 hover:bg-gray-50 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                  >
                     Hủy bỏ
                  </button>
                  <button
                     type="button"
                     onClick={handleSubmit}
                     disabled={submitting}
                     className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 rounded-lg text-[13px] font-semibold text-white transition-all cursor-pointer disabled:opacity-60 active:scale-[0.98]"
                  >
                     {submitting && (
                        <Loader2 size={13} className="animate-spin" />
                     )}
                     {submitting
                        ? isEdit
                           ? "Đang lưu..."
                           : "Đang tạo..."
                        : isEdit
                          ? "Lưu thay đổi"
                          : "Tạo sản phẩm"}
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}
