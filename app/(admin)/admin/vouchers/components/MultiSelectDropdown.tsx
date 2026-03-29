"use client";

/**
 * MultiSelectDropdown.tsx
 *
 * Exports:
 *  - EntityOption          — shared type
 *  - ProductSearch         — async search via react-select + apiRequest
 *  - MultiSelectDropdown   — preloaded list (categories / brands) via react-select
 */

import AsyncSelect from "react-select/async";
import Select from "react-select";
import apiRequest from "@/lib/api";

// ── Shared type ────────────────────────────────────────────────────────────────

export interface EntityOption {
   id: string;
   name: string;
   meta?: string;
   thumbnail?: string;
   price?: number;
}

// ── Internal react-select option shape ────────────────────────────────────────

interface RsOption {
   value: string;
   label: string;
   meta?: string;
   thumbnail?: string;
   price?: number;
}

function toRs(e: EntityOption): RsOption {
   return {
      value: e.id,
      label: e.name,
      meta: e.meta,
      thumbnail: e.thumbnail,
      price: e.price,
   };
}

function fromRs(o: RsOption): EntityOption {
   return {
      id: o.value,
      name: o.label,
      meta: o.meta,
      thumbnail: o.thumbnail,
      price: o.price,
   };
}

// ── Shared styles (matches Notification rsStyles pattern) ──────────────────────

const rsStyles = {
   control: (b: any, s: any) => ({
      ...b,
      minHeight: "42px",
      borderRadius: "0.75rem",
      borderColor: s.isFocused
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-neutral, #e5e7eb)",
      boxShadow: s.isFocused
         ? "0 0 0 2px color-mix(in srgb, var(--color-accent, #0ea5e9) 20%, transparent)"
         : "none",
      backgroundColor: "var(--color-neutral-light, #fff)",
      "&:hover": { borderColor: "var(--color-accent-hover, #0369a1)" },
      transition: "border-color 0.15s, box-shadow 0.15s",
      cursor: "text",
      flexWrap: "wrap",
   }),
   valueContainer: (b: any) => ({
      ...b,
      padding: "4px 8px",
      gap: "4px",
      flexWrap: "wrap",
   }),
   multiValue: (b: any) => ({
      ...b,
      backgroundColor:
         "color-mix(in srgb, var(--color-accent, #0ea5e9) 12%, transparent)",
      borderRadius: "0.5rem",
      padding: "0 2px",
      margin: 0,
   }),
   multiValueLabel: (b: any) => ({
      ...b,
      color: "var(--color-accent-hover, #0369a1)",
      fontSize: "12px",
      fontWeight: 500,
      padding: "2px 4px",
   }),
   multiValueRemove: (b: any) => ({
      ...b,
      color: "var(--color-accent-hover, #0369a1)",
      borderRadius: "0 0.5rem 0.5rem 0",
      cursor: "pointer",
      "&:hover": {
         backgroundColor: "var(--color-accent-hover, #0369a1)",
         color: "#fff",
      },
   }),
   input: (b: any) => ({
      ...b,
      color: "var(--color-primary, #111827)",
      fontSize: "13px",
      margin: 0,
      padding: "2px 0",
   }),
   placeholder: (b: any) => ({
      ...b,
      color: "var(--color-neutral-dark, #9ca3af)",
      fontSize: "13px",
   }),
   menu: (b: any) => ({
      ...b,
      borderRadius: "0.75rem",
      border: "1px solid var(--color-neutral, #e5e7eb)",
      boxShadow:
         "0 10px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
      overflow: "hidden",
      zIndex: 9999,
      backgroundColor: "var(--color-neutral-light, #fff)",
      marginTop: "6px",
   }),
   menuList: (b: any) => ({
      ...b,
      padding: "4px",
      maxHeight: "260px",
   }),
   option: (b: any, s: any) => ({
      ...b,
      borderRadius: "0.5rem",
      padding: "6px 10px",
      backgroundColor: s.isSelected
         ? "color-mix(in srgb, var(--color-accent, #0ea5e9) 15%, transparent)"
         : s.isFocused
           ? "var(--color-neutral, #f3f4f6)"
           : "transparent",
      color: s.isSelected
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-primary, #111827)",
      cursor: "pointer",
      fontSize: "13px",
      fontWeight: s.isSelected ? 500 : 400,
      "&:active": { backgroundColor: "var(--color-neutral-hover, #e5e7eb)" },
   }),
   loadingMessage: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #6b7280)",
      fontSize: "13px",
      padding: "12px 16px",
   }),
   noOptionsMessage: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #6b7280)",
      fontSize: "13px",
      padding: "12px 16px",
   }),
   indicatorSeparator: () => ({ display: "none" }),
   dropdownIndicator: (b: any, s: any) => ({
      ...b,
      color: s.isFocused
         ? "var(--color-accent-hover, #0369a1)"
         : "var(--color-neutral-darker, #9ca3af)",
      padding: "0 8px",
      transition: "color 0.15s, transform 0.2s",
      transform: s.selectProps.menuIsOpen ? "rotate(180deg)" : "rotate(0deg)",
   }),
   clearIndicator: (b: any) => ({
      ...b,
      color: "var(--color-neutral-darker, #9ca3af)",
      padding: "0 4px",
      cursor: "pointer",
      "&:hover": { color: "var(--color-primary, #111827)" },
   }),
};

// ── Custom Option: thumbnail + name + meta + price ─────────────────────────────

function ProductOptionLabel({ data }: { data: RsOption }) {
   const price = data.price;
   return (
      <div className="flex items-center gap-2.5 py-0.5">
         <div className="shrink-0 w-8 h-8 rounded-md overflow-hidden border border-neutral bg-white flex items-center justify-center">
            {data.thumbnail ? (
               // eslint-disable-next-line @next/next/no-img-element
               <img
                  src={data.thumbnail}
                  alt={data.label}
                  className="w-full h-full object-contain"
               />
            ) : (
               <svg
                  className="w-4 h-4 opacity-30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={1.5}
                     d="M3 7h2l2-3h10l2 3h2a1 1 0 011 1v11a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z"
                  />
                  <circle cx="12" cy="13" r="3" strokeWidth={1.5} />
               </svg>
            )}
         </div>

         <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-primary truncate leading-tight">
               {data.label}
            </p>
            {data.meta && (
               <p className="text-[11px] text-neutral-darker truncate leading-tight">
                  {data.meta}
               </p>
            )}
         </div>

         {price != null && (
            <span className="shrink-0 text-[11px] font-semibold text-accent bg-accent/10 px-2 py-0.5 rounded-full whitespace-nowrap">
               {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
               }).format(price)}
            </span>
         )}
      </div>
   );
}

// ── API loader ─────────────────────────────────────────────────────────────────

async function defaultSearchProducts(term: string): Promise<RsOption[]> {
   if (!term.trim()) return [];
   const res = await apiRequest.get<{ data: any[] }>("/products", {
      params: { search: term, limit: 20 },
      noAuth: true,
   });
   return (res?.data ?? []).map((p) => ({
      value: p.id,
      label: p.name,
      meta: p.sku ?? p.slug ?? undefined,
      thumbnail: p.thumbnail,
      price: p.price?.base,
   }));
}

// ── SingleProductSearch ────────────────────────────────────────────────────────

interface SingleProductSearchProps {
   value: EntityOption | null;
   onChange: (item: EntityOption | null) => void;
   onSearch?: (term: string) => Promise<EntityOption[]>;
   placeholder?: string;
   isDisabled?: boolean;
}

export function SingleProductSearch({
   value,
   onChange,
   onSearch,
   placeholder = "Tìm tên sản phẩm, SKU...",
   isDisabled = false,
}: SingleProductSearchProps) {
   const loadOptions = async (inputValue: string): Promise<RsOption[]> => {
      if (onSearch) return (await onSearch(inputValue)).map(toRs);
      return defaultSearchProducts(inputValue);
   };

   return (
      <AsyncSelect
         cacheOptions
         defaultOptions={false}
         loadOptions={loadOptions}
         value={value ? toRs(value) : null}
         onChange={(opt: any) => onChange(opt ? fromRs(opt) : null)}
         placeholder={placeholder}
         isDisabled={isDisabled}
         styles={rsStyles}
         formatOptionLabel={(opt: any) => <ProductOptionLabel data={opt} />}
         loadingMessage={() => "Đang tìm kiếm..."}
         noOptionsMessage={({ inputValue }: any) =>
            inputValue
               ? `Không tìm thấy "${inputValue}"`
               : "Nhập để tìm sản phẩm"
         }
         isClearable
         classNamePrefix="rs-product-single"
      />
   );
}

// ── SingleSelectDropdown ───────────────────────────────────────────────────────

interface SingleSelectDropdownProps {
   value: EntityOption | null;
   onChange: (item: EntityOption | null) => void;
   options: EntityOption[];
   loading?: boolean;
   placeholder?: string;
   isDisabled?: boolean;
}

export function SingleSelectDropdown({
   value,
   onChange,
   options,
   loading = false,
   placeholder = "Chọn...",
   isDisabled = false,
}: SingleSelectDropdownProps) {
   return (
      <Select
         options={options.map(toRs)}
         value={value ? toRs(value) : null}
         onChange={(opt: any) => onChange(opt ? fromRs(opt) : null)}
         placeholder={loading ? "Đang tải..." : placeholder}
         isDisabled={isDisabled || loading}
         isLoading={loading}
         styles={rsStyles}
         noOptionsMessage={() => "Không có lựa chọn"}
         isClearable
         classNamePrefix="rs-single"
      />
   );
}
