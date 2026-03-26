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
import type {
   MultiValue,
   StylesConfig,
   GroupBase,
   components as RSComponents,
} from "react-select";
import { components } from "react-select";
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
   value: string; // entity id
   label: string; // entity name
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

// ── Shared styles (matches design system CSS variables) ────────────────────────

function makeStyles<IsMulti extends boolean = true>(): StylesConfig<
   RsOption,
   IsMulti,
   GroupBase<RsOption>
> {
   return {
      control: (base, state) => ({
         ...base,
         minHeight: "42px",
         borderRadius: "0.75rem",
         borderColor: state.isFocused
            ? "var(--color-accent-hover, #0369a1)"
            : "var(--color-neutral, #e5e7eb)",
         boxShadow: state.isFocused
            ? "0 0 0 2px color-mix(in srgb, var(--color-accent, #0ea5e9) 20%, transparent)"
            : "none",
         backgroundColor: "var(--color-neutral-light, #fff)",
         "&:hover": { borderColor: "var(--color-accent-hover, #0369a1)" },
         transition: "border-color 0.15s, box-shadow 0.15s",
         cursor: "text",
         flexWrap: "wrap",
      }),
      valueContainer: (base) => ({
         ...base,
         padding: "4px 8px",
         gap: "4px",
         flexWrap: "wrap",
      }),
      multiValue: (base) => ({
         ...base,
         backgroundColor:
            "color-mix(in srgb, var(--color-accent, #0ea5e9) 12%, transparent)",
         borderRadius: "0.5rem",
         padding: "0 2px",
         margin: 0,
      }),
      multiValueLabel: (base) => ({
         ...base,
         color: "var(--color-accent-hover, #0369a1)",
         fontSize: "12px",
         fontWeight: 500,
         padding: "2px 4px",
      }),
      multiValueRemove: (base) => ({
         ...base,
         color: "var(--color-accent-hover, #0369a1)",
         borderRadius: "0 0.5rem 0.5rem 0",
         cursor: "pointer",
         "&:hover": {
            backgroundColor: "var(--color-accent-hover, #0369a1)",
            color: "#fff",
         },
      }),
      input: (base) => ({
         ...base,
         color: "var(--color-primary, #111827)",
         fontSize: "13px",
         margin: 0,
         padding: "2px 0",
      }),
      placeholder: (base) => ({
         ...base,
         color: "var(--color-neutral-dark, #9ca3af)",
         fontSize: "13px",
      }),
      menu: (base) => ({
         ...base,
         borderRadius: "0.75rem",
         border: "1px solid var(--color-neutral, #e5e7eb)",
         boxShadow:
            "0 10px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)",
         overflow: "hidden",
         zIndex: 9999,
         backgroundColor: "var(--color-neutral-light, #fff)",
         marginTop: "6px",
      }),
      menuList: (base) => ({
         ...base,
         padding: "4px",
         maxHeight: "260px",
      }),
      option: (base, state) => ({
         ...base,
         borderRadius: "0.5rem",
         padding: "6px 10px",
         backgroundColor: state.isSelected
            ? "color-mix(in srgb, var(--color-accent, #0ea5e9) 15%, transparent)"
            : state.isFocused
              ? "var(--color-neutral, #f3f4f6)"
              : "transparent",
         color: state.isSelected
            ? "var(--color-accent-hover, #0369a1)"
            : "var(--color-primary, #111827)",
         cursor: "pointer",
         fontSize: "13px",
         fontWeight: state.isSelected ? 500 : 400,
         "&:active": { backgroundColor: "var(--color-neutral-hover, #e5e7eb)" },
      }),
      loadingMessage: (base) => ({
         ...base,
         color: "var(--color-neutral-darker, #6b7280)",
         fontSize: "13px",
         padding: "12px 16px",
      }),
      noOptionsMessage: (base) => ({
         ...base,
         color: "var(--color-neutral-darker, #6b7280)",
         fontSize: "13px",
         padding: "12px 16px",
      }),
      indicatorSeparator: () => ({ display: "none" }),
      dropdownIndicator: (base, state) => ({
         ...base,
         color: state.isFocused
            ? "var(--color-accent-hover, #0369a1)"
            : "var(--color-neutral-darker, #9ca3af)",
         padding: "0 8px",
         transition: "color 0.15s, transform 0.2s",
         transform: state.selectProps.menuIsOpen
            ? "rotate(180deg)"
            : "rotate(0deg)",
      }),
      clearIndicator: (base) => ({
         ...base,
         color: "var(--color-neutral-darker, #9ca3af)",
         padding: "0 4px",
         cursor: "pointer",
         "&:hover": { color: "var(--color-primary, #111827)" },
      }),
   };
}

// ── Custom Option: thumbnail + name + meta + price ─────────────────────────────

function ProductOptionLabel({ data }: { data: RsOption }) {
   const price = data.price;
   return (
      <div className="flex items-center gap-2.5 py-0.5">
         {/* Thumbnail */}
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

         {/* Name + meta */}
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

         {/* Price */}
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

// Custom MultiValue: hiển thị tên ngắn gọn trong tag
const MultiValueLabelProduct = (props: any) => (
   <components.MultiValueLabel {...props}>
      <span className="text-[12px]">{props.data.label}</span>
   </components.MultiValueLabel>
);

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

// ── ProductSearch ──────────────────────────────────────────────────────────────

interface ProductSearchProps {
   selected: EntityOption[];
   onChange: (items: EntityOption[]) => void;
   /**
    * Optional override — inject custom search fn from parent.
    * Falls back to apiRequest.get("/products") if omitted.
    */
   onSearch?: (term: string) => Promise<EntityOption[]>;
   placeholder?: string;
   isDisabled?: boolean;
}

export function ProductSearch({
   selected,
   onChange,
   onSearch,
   placeholder = "Tìm tên sản phẩm, SKU...",
   isDisabled = false,
}: ProductSearchProps) {
   const loadOptions = async (inputValue: string): Promise<RsOption[]> => {
      if (onSearch) {
         const items = await onSearch(inputValue);
         return items.map(toRs);
      }
      return defaultSearchProducts(inputValue);
   };

   const handleChange = (selected: MultiValue<RsOption>) => {
      onChange((selected as RsOption[]).map(fromRs));
   };

   const styles = makeStyles<true>();

   return (
      <AsyncSelect<RsOption, true>
         isMulti
         cacheOptions
         defaultOptions={false}
         loadOptions={loadOptions}
         value={selected.map(toRs)}
         onChange={handleChange}
         placeholder={placeholder}
         isDisabled={isDisabled}
         styles={styles}
         formatOptionLabel={(opt) => <ProductOptionLabel data={opt} />}
         components={{ MultiValueLabel: MultiValueLabelProduct }}
         loadingMessage={() => "Đang tìm kiếm..."}
         noOptionsMessage={({ inputValue }) =>
            inputValue
               ? `Không tìm thấy "${inputValue}"`
               : "Nhập để tìm sản phẩm"
         }
         isClearable
         closeMenuOnSelect={false}
         hideSelectedOptions={false}
         classNamePrefix="rs-product"
      />
   );
}

// ── MultiSelectDropdown (categories / brands — preloaded) ─────────────────────

interface MultiSelectDropdownProps {
   selected: EntityOption[];
   onChange: (items: EntityOption[]) => void;
   options: EntityOption[];
   loading?: boolean;
   placeholder?: string;
   isDisabled?: boolean;
}

export function MultiSelectDropdown({
   selected,
   onChange,
   options,
   loading = false,
   placeholder = "Chọn...",
   isDisabled = false,
}: MultiSelectDropdownProps) {
   const rsOptions = options.map(toRs);
   const rsValue = selected.map(toRs);
   const styles = makeStyles<true>();

   const handleChange = (val: MultiValue<RsOption>) => {
      onChange((val as RsOption[]).map(fromRs));
   };

   return (
      <Select<RsOption, true>
         isMulti
         options={rsOptions}
         value={rsValue}
         onChange={handleChange}
         placeholder={loading ? "Đang tải..." : placeholder}
         isDisabled={isDisabled || loading}
         isLoading={loading}
         styles={styles}
         loadingMessage={() => "Đang tải..."}
         noOptionsMessage={() => "Không có lựa chọn"}
         isClearable
         closeMenuOnSelect={false}
         hideSelectedOptions={false}
         classNamePrefix="rs-multi"
      />
   );
}
