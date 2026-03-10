"use client";

import {
   useCallback,
   useMemo,
   useState,
   useTransition,
   useRef,
   useEffect,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from "lucide-react";
import { FilterGroup } from "../_libs/fetchFilter";

interface ProductFilterProps {
   filters: FilterGroup[];
}

// ─── Debounce hook ────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
   const [debounced, setDebounced] = useState<T>(value);
   useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
   }, [value, delay]);
   return debounced;
}

export default function ProductFilter({ filters }: ProductFilterProps) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [isPending, startTransition] = useTransition();
   const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

   const [sliderValues, setSliderValues] = useState<
      Record<string, { min: number; max: number }>
   >({});

   // Khởi tạo sliderValues từ URL params khi mount hoặc filters thay đổi
   useEffect(() => {
      const init: Record<string, { min: number; max: number }> = {};
      filters.forEach((g) => {
         if (g.type === "RANGE" && g.min != null && g.max != null) {
            init[g.key] = {
               min: Number(searchParams.get(`${g.key}_min`) || g.min),
               max: Number(searchParams.get(`${g.key}_max`) || g.max),
            };
         }
      });
      setSliderValues(init);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filters]);

   // Debounce slider → chỉ push URL sau 400ms dừng kéo
   const debouncedSliders = useDebounce(sliderValues, 400);
   const prevDebouncedRef = useRef<typeof debouncedSliders>({});

   useEffect(() => {
      const prev = prevDebouncedRef.current;
      const updates: Record<string, string | null> = {};
      let changed = false;

      for (const [key, val] of Object.entries(debouncedSliders)) {
         const group = filters.find((g) => g.key === key);
         if (!group) continue;

         const prevVal = prev[key];
         if (prevVal?.min === val.min && prevVal?.max === val.max) continue;

         changed = true;
         updates[`${key}_min`] = val.min === group.min ? null : String(val.min);
         updates[`${key}_max`] = val.max === group.max ? null : String(val.max);
      }

      if (!changed) return;
      prevDebouncedRef.current = debouncedSliders;

      const params = new URLSearchParams(searchParams.toString());
      params.delete("page");
      for (const [k, v] of Object.entries(updates)) {
         params.delete(k);
         if (v !== null) params.set(k, v);
      }
      startTransition(() => {
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
   }, [debouncedSliders]); // eslint-disable-line

   // ─── URL helpers ──────────────────────────────────────────────────

   const getValues = useCallback(
      (key: string) => searchParams.getAll(key),
      [searchParams],
   );

   const getValue = useCallback(
      (key: string) => searchParams.get(key) ?? "",
      [searchParams],
   );

   const pushParams = useCallback(
      (updates: Record<string, string | string[] | null>) => {
         const params = new URLSearchParams(searchParams.toString());
         params.delete("page");
         for (const [key, value] of Object.entries(updates)) {
            params.delete(key);
            if (value === null) continue;
            if (Array.isArray(value)) {
               value.forEach((v) => params.append(key, v));
            } else if (value !== "") {
               params.set(key, value);
            }
         }
         startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
         });
      },
      [router, pathname, searchParams, startTransition],
   );

   // ─── Filter actions ───────────────────────────────────────────────

   const toggleEnum = useCallback(
      (key: string, val: string) => {
         const current = getValues(key);
         const next = current.includes(val)
            ? current.filter((v) => v !== val)
            : [...current, val];
         pushParams({ [key]: next });
      },
      [getValues, pushParams],
   );

   const setBoolean = useCallback(
      (key: string, val: boolean | null) => {
         pushParams({ [key]: val === null ? null : String(val) });
      },
      [pushParams],
   );

   const hasFilters = useMemo(() => {
      for (const [key] of searchParams.entries()) {
         if (key !== "page") return true;
      }
      return false;
   }, [searchParams]);

   const resetAll = useCallback(() => {
      // Reset local sliders
      const reset: Record<string, { min: number; max: number }> = {};
      filters.forEach((g) => {
         if (g.type === "RANGE" && g.min != null && g.max != null) {
            reset[g.key] = { min: g.min, max: g.max };
         }
      });
      setSliderValues(reset);
      prevDebouncedRef.current = reset;
      startTransition(() => router.push(pathname, { scroll: false }));
   }, [filters, pathname, router, startTransition]);

   const toggleCollapse = (key: string) =>
      setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

   // ─── Sub-components ───────────────────────────────────────────────

   const SectionHeader = ({
      label,
      groupKey,
   }: {
      label: string;
      groupKey: string;
   }) => (
      <button
         type="button"
         onClick={() => toggleCollapse(groupKey)}
         className="w-full flex items-center justify-between py-2.5 border-b border-neutral mb-3 cursor-pointer"
      >
         <span className="text-sm font-semibold text-primary">{label}</span>
         {collapsed[groupKey] ? (
            <ChevronDown className="w-4 h-4 text-primary-light" />
         ) : (
            <ChevronUp className="w-4 h-4 text-primary-light" />
         )}
      </button>
   );

   const Chip = ({
      label,
      active,
      onClick,
   }: {
      label: string;
      active: boolean;
      onClick: () => void;
   }) => (
      <button
         type="button"
         onClick={onClick}
         className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer duration-150 ${
            active
               ? "border-accent bg-accent-light text-accent"
               : "border-neutral bg-neutral-light text-primary hover:border-accent-light hover:bg-accent-light/50"
         }`}
      >
         {label}
      </button>
   );

   // ─── Render by type ───────────────────────────────────────────────

   const renderEnum = (group: FilterGroup) => {
      if (!group.options?.length) return null;
      const selected = getValues(group.key);
      return (
         <div key={group.key}>
            <SectionHeader label={group.label} groupKey={group.key} />
            {!collapsed[group.key] && (
               <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => (
                     <Chip
                        key={opt.value}
                        label={opt.label}
                        active={selected.includes(opt.value)}
                        onClick={() => toggleEnum(group.key, opt.value)}
                     />
                  ))}
               </div>
            )}
         </div>
      );
   };

   const renderRange = (group: FilterGroup) => {
      if (group.min == null || group.max == null) return null;

      // Dùng local state thay vì đọc URL — mượt khi kéo
      const local = sliderValues[group.key] ?? {
         min: group.min,
         max: group.max,
      };

      const isPrice = group.key === "price";
      const isSameMinMax = group.min === group.max;

      const fmt = (v: number) =>
         isPrice
            ? v.toLocaleString("vi-VN") + "đ"
            : `${v}${group.unit ? " " + group.unit : ""}`;

      const setLocal = (min: number, max: number) => {
         setSliderValues((prev) => ({ ...prev, [group.key]: { min, max } }));
      };

      return (
         <div key={group.key}>
            <SectionHeader label={group.label} groupKey={group.key} />
            {!collapsed[group.key] && (
               <div className="space-y-3">
                  <div className="flex items-center gap-2">
                     <div className="flex-1 px-2 py-1.5 text-xs border border-neutral rounded-lg bg-neutral-light-active text-primary text-center">
                        {fmt(local.min)}
                     </div>
                     <span className="text-neutral-dark text-xs">–</span>
                     <div className="flex-1 px-2 py-1.5 text-xs border border-neutral rounded-lg bg-neutral-light-active text-primary text-center">
                        {fmt(local.max)}
                     </div>
                  </div>

                  {isSameMinMax ? (
                     // Không có range thực → chỉ hiển thị giá trị cố định
                     <p className="text-xs text-primary-light text-center">
                        {fmt(group.min)}
                     </p>
                  ) : (
                     <>
                        <input
                           type="range"
                           min={group.min}
                           max={group.max}
                           step={isPrice ? 500000 : 0.1}
                           value={local.min}
                           onChange={(e) =>
                              setLocal(
                                 Math.min(
                                    Number(e.target.value),
                                    local.max - (isPrice ? 500000 : 0.1),
                                 ),
                                 local.max,
                              )
                           }
                           className="w-full accent-[rgb(var(--accent))] h-1.5 rounded-full cursor-pointer"
                        />
                        <input
                           type="range"
                           min={group.min}
                           max={group.max}
                           step={isPrice ? 500000 : 0.1}
                           value={local.max}
                           onChange={(e) =>
                              setLocal(
                                 local.min,
                                 Math.max(
                                    Number(e.target.value),
                                    local.min + (isPrice ? 500000 : 0.1),
                                 ),
                              )
                           }
                           className="w-full accent-[rgb(var(--accent))] h-1.5 rounded-full cursor-pointer"
                        />
                     </>
                  )}
               </div>
            )}
         </div>
      );
   };

   const renderBoolean = (group: FilterGroup) => {
      const raw = getValue(group.key);
      const current = raw === "true" ? true : raw === "false" ? false : null;
      return (
         <div key={group.key}>
            <SectionHeader label={group.label} groupKey={group.key} />
            {!collapsed[group.key] && (
               <div className="flex gap-2">
                  <Chip
                     label="Tất cả"
                     active={current === null}
                     onClick={() => setBoolean(group.key, null)}
                  />
                  <Chip
                     label="Có"
                     active={current === true}
                     onClick={() => setBoolean(group.key, true)}
                  />
                  <Chip
                     label="Không"
                     active={current === false}
                     onClick={() => setBoolean(group.key, false)}
                  />
               </div>
            )}
         </div>
      );
   };

   const renderGroup = (group: FilterGroup) => {
      switch (group.type) {
         case "ENUM":
            return renderEnum(group);
         case "RANGE":
            return renderRange(group);
         case "BOOLEAN":
            return renderBoolean(group);
         default:
            return null;
      }
   };

   if (!filters.length) return null;

   return (
      <div
         className={`bg-neutral-light border border-neutral rounded-2xl overflow-hidden transition-opacity duration-200 ${
            isPending ? "opacity-50 pointer-events-none" : "opacity-100"
         }`}
      >
         <div className="flex items-center justify-between px-4 py-3 border-b border-neutral bg-neutral-light-active">
            <div className="flex items-center gap-2">
               <SlidersHorizontal className="w-4 h-4 text-accent" />
               <span className="text-sm font-bold text-primary">Bộ lọc</span>
               {isPending && (
                  <span className="text-xs text-primary-light animate-pulse">
                     Đang lọc...
                  </span>
               )}
            </div>
            {hasFilters && (
               <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1 text-xs text-promotion hover:text-promotion-hover transition-colors cursor-pointer"
               >
                  <X className="w-3.5 h-3.5" />
                  Xoá tất cả
               </button>
            )}
         </div>
         <div className="px-4 py-4 space-y-5">{filters.map(renderGroup)}</div>
      </div>
   );
}
