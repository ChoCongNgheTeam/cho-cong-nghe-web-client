"use client";

import { useState, useCallback } from "react";
import Select, { MultiValue, components } from "react-select";
import { Plus, X } from "lucide-react";

// ─── types (copy từ ProductForm) ─────────────────────────────────────────────

interface AttrOption {
   id: string;
   value: string;
   label: string;
   priceAdjustment: number;
}

interface TemplateAttribute {
   id: string;
   code: string;
   name: string;
   isRequired: boolean;
   options: AttrOption[];
}

interface CategoryTemplate {
   attributes: TemplateAttribute[];
   specifications: any[];
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtVND(n: number): string {
   if (Math.abs(n) >= 1_000_000) {
      const m = n / 1_000_000;
      return (Number.isInteger(m) ? m : m.toFixed(1)) + "tr";
   }
   if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + "k";
   return n.toLocaleString("vi-VN");
}

const uid = () => Math.random().toString(36).slice(2, 9);

// ─── react-select styles (dùng CSS vars giống ProductForm) ───────────────────

const rsStyles = (isColor?: boolean) => ({
   control: (b: any, s: any) => ({
      ...b,
      borderRadius: "0.5rem",
      borderColor: s.isFocused ? "rgb(var(--primary))" : "rgb(var(--neutral))",
      boxShadow: s.isFocused ? "0 0 0 4px rgba(var(--primary),0.05)" : "none",
      background: s.isFocused
         ? "rgb(var(--neutral-light))"
         : "rgb(var(--neutral-light-active))",
      "&:hover": { borderColor: "rgb(var(--neutral-active))" },
      minHeight: "36px",
      transition: "all 0.15s",
      cursor: "text",
      flexWrap: "wrap",
   }),
   valueContainer: (b: any) => ({
      ...b,
      padding: "3px 8px",
      gap: "4px",
      flexWrap: "wrap",
   }),
   multiValue: (b: any) => ({
      ...b,
      backgroundColor: "rgb(var(--primary))",
      borderRadius: "6px",
      margin: 0,
   }),
   multiValueLabel: (b: any) => ({
      ...b,
      color: "rgb(var(--neutral-light))",
      fontSize: "12px",
      fontWeight: 500,
      padding: "2px 6px",
   }),
   multiValueRemove: (b: any) => ({
      ...b,
      color: "rgb(var(--neutral-light))",
      borderRadius: "0 6px 6px 0",
      paddingRight: "4px",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "rgba(255,255,255,0.2)",
         color: "rgb(var(--neutral-light))",
      },
   }),
   input: (b: any) => ({
      ...b,
      margin: 0,
      padding: "2px 0",
      fontSize: "13px",
      color: "rgb(var(--primary))",
   }),
   menu: (b: any) => ({
      ...b,
      borderRadius: "0.5rem",
      marginTop: 4,
      boxShadow: "0 8px 24px rgba(0,0,0,.12)",
      zIndex: 9999,
      border: "1px solid rgb(var(--neutral))",
      background: "rgb(var(--neutral-light))",
   }),
   menuList: (b: any) => ({ ...b, padding: "4px" }),
   option: (b: any, s: any) => ({
      ...b,
      borderRadius: "6px",
      margin: "1px 0",
      background: s.isSelected
         ? "rgb(var(--primary))"
         : s.isFocused
           ? "rgb(var(--neutral-light-active))"
           : "transparent",
      color: s.isSelected ? "rgb(var(--neutral-light))" : "rgb(var(--primary))",
      fontSize: "13px",
      padding: "7px 10px",
      cursor: "pointer",
   }),
   placeholder: (b: any) => ({
      ...b,
      fontSize: "13px",
      color: "rgb(var(--neutral-dark))",
   }),
   indicatorSeparator: () => ({ display: "none" }),
   dropdownIndicator: (b: any) => ({
      ...b,
      padding: "0 8px",
      color: "rgb(var(--neutral-dark))",
   }),
   clearIndicator: (b: any) => ({
      ...b,
      padding: "0 4px",
      color: "rgb(var(--neutral-dark))",
      cursor: "pointer",
   }),
});

// ─── Option label với color swatch ───────────────────────────────────────────

interface RsOption {
   value: string; // optId
   label: string;
   color?: string; // hex/css value
   priceAdjustment: number;
}

function OptionLabel({
   data,
   basePrice,
}: {
   data: RsOption;
   basePrice: number;
}) {
   const finalPrice = basePrice + data.priceAdjustment;
   return (
      <div className="flex items-center gap-2">
         {data.color && (
            <span
               className="w-3 h-3 rounded-full shrink-0 ring-1 ring-neutral"
               style={{ background: data.color }}
            />
         )}
         <span className="flex-1 truncate">{data.label}</span>
         {data.priceAdjustment !== 0 && (
            <span
               className={`text-[10px] font-semibold shrink-0 ${
                  data.priceAdjustment > 0 ? "text-accent" : "text-promotion"
               }`}
            >
               {data.priceAdjustment > 0 ? "+" : ""}
               {fmtVND(data.priceAdjustment)} → {fmtVND(finalPrice)}
            </span>
         )}
      </div>
   );
}

// MultiValue label với color swatch
function MultiValueLabelWithColor({
   data,
   innerProps,
}: {
   data: RsOption;
   innerProps: any;
}) {
   return (
      <div
         {...innerProps}
         className="flex items-center gap-1.5 py-0.5 pl-2 pr-1"
      >
         {data.color && (
            <span
               className="w-2.5 h-2.5 rounded-full shrink-0 ring-1 ring-white/30"
               style={{ background: data.color }}
            />
         )}
         <span className="text-[12px] font-medium text-neutral-light">
            {data.label}
         </span>
      </div>
   );
}

// ─── Price Adj inline (hiển thị bên dưới mỗi option đã chọn) ────────────────

function PriceAdjRow({
   opt,
   basePrice,
   onChange,
}: {
   opt: AttrOption;
   basePrice: number;
   onChange: (adj: number) => void;
}) {
   const [raw, setRaw] = useState(
      opt.priceAdjustment === 0 ? "" : String(opt.priceAdjustment),
   );

   const commit = () => {
      const isNeg = raw.trim().startsWith("-");
      const digits = Number(raw.replace(/[^\d]/g, "")) || 0;
      const n = isNeg ? -digits : digits;
      onChange(n);
      setRaw(n === 0 ? "" : String(n));
   };

   const adj = opt.priceAdjustment;
   const colorCls =
      adj > 0
         ? "border-accent text-accent-dark bg-accent-light/40"
         : adj < 0
           ? "border-promotion text-promotion bg-promotion-light/40"
           : "border-neutral text-neutral-dark bg-neutral-light";

   return (
      <div className="flex items-center gap-2 py-1.5 px-2 rounded-md bg-neutral-light-active border border-neutral">
         {/* color swatch nếu có */}
         <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[12px] text-primary font-medium truncate">
               {opt.label}
            </span>
            <span className="text-[10px] text-neutral-dark shrink-0">±giá</span>
            <div className="relative flex-1 max-w-[120px]">
               <input
                  value={raw}
                  onChange={(e) => setRaw(e.target.value)}
                  onBlur={commit}
                  onKeyDown={(e) => e.key === "Enter" && commit()}
                  placeholder="0"
                  className={`w-full px-2 py-1 text-[11px] border rounded-md tabular-nums
              focus:outline-none focus:border-primary transition-all ${colorCls}`}
               />
            </div>
            <span className="text-[10px] text-neutral-dark shrink-0">
               → {fmtVND(basePrice + adj)}
            </span>
         </div>
      </div>
   );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

interface ChipAttributeSelectorProps {
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
}

export function ChipAttributeSelector({
   template,
   checked,
   basePrice,
   onToggle,
   onAddOption,
   onUpdatePriceAdjustment,
}: ChipAttributeSelectorProps) {
   // "thêm option mới" state per attr
   const [adding, setAdding] = useState<Record<string, boolean>>({});
   const [newLabel, setNewLabel] = useState<Record<string, string>>({});

   const submitNew = (attrId: string) => {
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

   // Convert AttrOption → RsOption
   const toRs = (opt: AttrOption, isColor: boolean): RsOption => ({
      value: opt.id,
      label: opt.label,
      color: isColor ? opt.value : undefined,
      priceAdjustment: opt.priceAdjustment,
   });

   return (
      <div className="space-y-5">
         {template.attributes.map((attr) => {
            const isColor = attr.code === "color";
            const selectedIds = checked[attr.id] ?? new Set<string>();
            const selCount = selectedIds.size;

            // Build options list
            const rsOptions: RsOption[] = attr.options.map((o) =>
               toRs(o, isColor),
            );

            // Current multi-value
            const value: RsOption[] = attr.options
               .filter((o) => selectedIds.has(o.id))
               .map((o) => toRs(o, isColor));

            // onChange from react-select
            const handleChange = (newVal: MultiValue<RsOption>) => {
               const newIds = new Set((newVal ?? []).map((o) => o.value));
               // find removed
               selectedIds.forEach((id) => {
                  if (!newIds.has(id)) onToggle(attr.id, id);
               });
               // find added
               newIds.forEach((id) => {
                  if (!selectedIds.has(id)) onToggle(attr.id, id);
               });
            };

            // Selected options (with priceAdjustment from template)
            const selectedOpts = attr.options.filter((o) =>
               selectedIds.has(o.id),
            );

            return (
               <div key={attr.id}>
                  {/* Label row */}
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-[12px] font-semibold text-primary">
                        {attr.name}
                        {attr.isRequired && (
                           <span className="text-promotion ml-0.5">*</span>
                        )}
                     </span>
                     {selCount > 0 && (
                        <span className="text-[10px] font-semibold text-accent-dark bg-accent-light border border-accent-light-active px-2 py-0.5 rounded-full">
                           {selCount} đã chọn
                        </span>
                     )}
                  </div>

                  {/* Search-select */}
                  <Select<RsOption, true>
                     isMulti
                     options={rsOptions}
                     value={value}
                     onChange={handleChange}
                     placeholder={`Tìm và chọn ${attr.name.toLowerCase()}...`}
                     isSearchable
                     isClearable
                     closeMenuOnSelect={false}
                     hideSelectedOptions={false}
                     styles={rsStyles(isColor)}
                     formatOptionLabel={(data) => (
                        <OptionLabel data={data} basePrice={basePrice} />
                     )}
                     components={{
                        MultiValueLabel: (props) => (
                           <MultiValueLabelWithColor
                              data={props.data}
                              innerProps={props.innerProps}
                           />
                        ),
                     }}
                     noOptionsMessage={({ inputValue }) =>
                        inputValue
                           ? `Không tìm thấy "${inputValue}"`
                           : "Không có option"
                     }
                     menuPosition="fixed"
                     menuPlacement="auto"
                  />

                  {/* Price adjustment rows for selected options */}
                  {selectedOpts.length > 0 && (
                     <div className="mt-2 space-y-1">
                        {selectedOpts.map((opt) => (
                           <PriceAdjRow
                              key={opt.id}
                              opt={opt}
                              basePrice={basePrice}
                              onChange={(adj) =>
                                 onUpdatePriceAdjustment(attr.id, opt.id, adj)
                              }
                           />
                        ))}
                     </div>
                  )}

                  {/* Thêm option mới */}
                  <div className="mt-2">
                     {adding[attr.id] ? (
                        <div className="inline-flex items-center gap-1.5 border border-neutral bg-neutral-light rounded-lg px-2.5 py-1.5">
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
                                 if (e.key === "Enter") submitNew(attr.id);
                                 if (e.key === "Escape")
                                    setAdding((p) => ({
                                       ...p,
                                       [attr.id]: false,
                                    }));
                              }}
                              placeholder="Tên option mới..."
                              className="w-32 text-[12px] bg-transparent focus:outline-none text-primary placeholder:text-neutral-dark"
                           />
                           <button
                              type="button"
                              onClick={() => submitNew(attr.id)}
                              className="text-[11px] font-semibold text-primary cursor-pointer hover:opacity-70"
                           >
                              OK
                           </button>
                           <button
                              type="button"
                              onClick={() =>
                                 setAdding((p) => ({ ...p, [attr.id]: false }))
                              }
                              className="text-neutral-dark cursor-pointer hover:text-primary"
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
                           className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-neutral text-[11px] text-neutral-dark hover:border-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all cursor-pointer"
                        >
                           <Plus size={10} /> Thêm option mới
                        </button>
                     )}
                  </div>
               </div>
            );
         })}
      </div>
   );
}
