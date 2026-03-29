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
import {
   ChevronDown,
   ChevronUp,
   SlidersHorizontal,
   X,
   Filter,
   TrendingUp,
   TrendingDown,
   Sparkles,
   ShoppingBag,
   Star,
} from "lucide-react";
import { FilterGroup } from "../_libs/fetchFilter";

// ─── Debounce hook ─────────────────────────────────────────────────────────────
function useDebounce<T>(value: T, delay: number): T {
   const [debounced, setDebounced] = useState<T>(value);
   useEffect(() => {
      const t = setTimeout(() => setDebounced(value), delay);
      return () => clearTimeout(t);
   }, [value, delay]);
   return debounced;
}

// ─── Mobile detection ──────────────────────────────────────────────────────────
function useIsMobile() {
   const [isMobile, setIsMobile] = useState(false);
   useEffect(() => {
      const mq = window.matchMedia("(max-width: 1023px)");
      setIsMobile(mq.matches);
      const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
      mq.addEventListener("change", handler);
      return () => mq.removeEventListener("change", handler);
   }, []);
   return isMobile;
}

const SORT_CHIPS = [
   {
      label: "Nổi bật",
      value: "featured",
      sortBy: "viewsCount",
      sortOrder: "desc",
      icon: Sparkles,
   },
   {
      label: "Mới nhất",
      value: "newest",
      sortBy: "createdAt",
      sortOrder: "desc",
      icon: Star,
   },
   // {
   //    label: "Bán chạy",
   //    value: "bestseller",
   //    sortBy: "soldCount",
   //    sortOrder: "desc",
   //    icon: ShoppingBag,
   // },
   {
      label: "Giá tăng dần",
      value: "price_asc",
      sortBy: "price",
      sortOrder: "asc",
      icon: TrendingUp,
   },
   {
      label: "Giá giảm dần",
      value: "price_desc",
      sortBy: "price",
      sortOrder: "desc",
      icon: TrendingDown,
   },
] as const;

interface ProductFilterProps {
   filters: FilterGroup[];
}
type EnumState = Record<string, string[]>;
type RangeState = Record<string, { min: number; max: number }>;
type BoolState = Record<string, boolean | null>;

function getRangeMinMax(
   group: FilterGroup,
): { min: number; max: number } | null {
   if (group.type !== "RANGE" || !group.range) return null;
   return { min: group.range.min, max: group.range.max };
}

export default function ProductFilter({ filters }: ProductFilterProps) {
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [isPending, startTransition] = useTransition();
   const isMobile = useIsMobile();

   // ─── Desktop: collapsed sections ────────────────────────────────────────────
   const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
   const toggleCollapse = (key: string) =>
      setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }));

   // ─── Desktop: slider state (debounced → URL) ────────────────────────────────
   const [sliderValues, setSliderValues] = useState<RangeState>({});
   useEffect(() => {
      const init: RangeState = {};
      filters.forEach((g) => {
         const bounds = getRangeMinMax(g);
         if (!bounds) return;
         init[g.key] = {
            min: Number(searchParams.get(`${g.key}_min`) || bounds.min),
            max: Number(searchParams.get(`${g.key}_max`) || bounds.max),
         };
      });
      setSliderValues(init);
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [filters]);

   const debouncedSliders = useDebounce(sliderValues, 400);
   const prevDebouncedRef = useRef<RangeState>({});

   useEffect(() => {
      if (isMobile) return;
      const prev = prevDebouncedRef.current;
      const updates: Record<string, string | null> = {};
      let changed = false;
      for (const [key, val] of Object.entries(debouncedSliders)) {
         const group = filters.find((g) => g.key === key);
         const bounds = group ? getRangeMinMax(group) : null;
         if (!bounds) continue;
         const prevVal = prev[key];
         if (prevVal?.min === val.min && prevVal?.max === val.max) continue;
         changed = true;
         updates[`${key}_min`] =
            val.min === bounds.min ? null : String(val.min);
         updates[`${key}_max`] =
            val.max === bounds.max ? null : String(val.max);
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

   // ─── Desktop URL helpers ─────────────────────────────────────────────────────
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
            if (Array.isArray(value))
               value.forEach((v) => params.append(key, v));
            else if (value !== "") params.set(key, value);
         }
         startTransition(() => {
            router.push(`${pathname}?${params.toString()}`, { scroll: false });
         });
      },
      [router, pathname, searchParams, startTransition],
   );

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
      const reset: RangeState = {};
      filters.forEach((g) => {
         const bounds = getRangeMinMax(g);
         if (bounds) reset[g.key] = bounds;
      });
      setSliderValues(reset);
      prevDebouncedRef.current = reset;
      startTransition(() => router.push(pathname, { scroll: false }));
   }, [filters, pathname, router, startTransition]);

   // ─── MOBILE: Bottom sheet state ──────────────────────────────────────────────
   const [isSheetOpen, setIsSheetOpen] = useState(false);
   const [activeSort, setActiveSort] = useState<string>("featured");

   const [draftEnum, setDraftEnum] = useState<EnumState>({});
   const [draftRange, setDraftRange] = useState<RangeState>({});
   const [draftBool, setDraftBool] = useState<BoolState>({});

   const openSheet = useCallback(() => {
      const initEnum: EnumState = {};
      const initRange: RangeState = {};
      const initBool: BoolState = {};
      filters.forEach((g) => {
         if (g.type === "ENUM") {
            initEnum[g.key] = searchParams.getAll(g.key);
         } else if (g.type === "RANGE") {
            const bounds = getRangeMinMax(g);
            if (!bounds) return;
            initRange[g.key] = {
               min: Number(searchParams.get(`${g.key}_min`) || bounds.min),
               max: Number(searchParams.get(`${g.key}_max`) || bounds.max),
            };
         } else if (g.type === "BOOLEAN") {
            const raw = searchParams.get(g.key);
            initBool[g.key] =
               raw === "true" ? true : raw === "false" ? false : null;
         }
      });
      setDraftEnum(initEnum);
      setDraftRange(initRange);
      setDraftBool(initBool);
      setIsSheetOpen(true);
      document.body.style.overflow = "hidden";
   }, [filters, searchParams]);

   const closeSheet = useCallback(() => {
      setIsSheetOpen(false);
      document.body.style.overflow = "";
   }, []);

   const resetDraft = useCallback(() => {
      const initEnum: EnumState = {};
      const initRange: RangeState = {};
      const initBool: BoolState = {};
      filters.forEach((g) => {
         if (g.type === "ENUM") initEnum[g.key] = [];
         else if (g.type === "RANGE") {
            const bounds = getRangeMinMax(g);
            if (bounds) initRange[g.key] = bounds;
         } else if (g.type === "BOOLEAN") initBool[g.key] = null;
      });
      setDraftEnum(initEnum);
      setDraftRange(initRange);
      setDraftBool(initBool);
   }, [filters]);

   const applyDraft = useCallback(() => {
      const params = new URLSearchParams();
      const sortBy = searchParams.get("sortBy");
      const sortOrder = searchParams.get("sortOrder");
      if (sortBy) params.set("sortBy", sortBy);
      if (sortOrder) params.set("sortOrder", sortOrder);

      for (const [key, vals] of Object.entries(draftEnum)) {
         vals.forEach((v) => params.append(key, v));
      }
      for (const [key, val] of Object.entries(draftRange)) {
         const group = filters.find((g) => g.key === key);
         const bounds = group ? getRangeMinMax(group) : null;
         if (!bounds) continue;
         if (val.min !== bounds.min) params.set(`${key}_min`, String(val.min));
         if (val.max !== bounds.max) params.set(`${key}_max`, String(val.max));
      }
      for (const [key, val] of Object.entries(draftBool)) {
         if (val !== null) params.set(key, String(val));
      }
      startTransition(() => {
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
      closeSheet();
   }, [
      draftEnum,
      draftRange,
      draftBool,
      filters,
      pathname,
      router,
      searchParams,
      closeSheet,
      startTransition,
   ]);

   useEffect(() => {
      if (!isSheetOpen) return;
      const handler = (e: KeyboardEvent) => {
         if (e.key === "Escape") closeSheet();
      };
      document.addEventListener("keydown", handler);
      return () => document.removeEventListener("keydown", handler);
   }, [isSheetOpen, closeSheet]);

   const draftToggleEnum = (key: string, val: string) => {
      setDraftEnum((prev) => {
         const cur = prev[key] ?? [];
         return {
            ...prev,
            [key]: cur.includes(val)
               ? cur.filter((v) => v !== val)
               : [...cur, val],
         };
      });
   };
   const draftSetRange = (key: string, min: number, max: number) => {
      setDraftRange((prev) => ({ ...prev, [key]: { min, max } }));
   };
   const draftSetBool = (key: string, val: boolean | null) => {
      setDraftBool((prev) => ({ ...prev, [key]: val }));
   };

   const draftCount = useMemo(() => {
      let count = 0;
      for (const vals of Object.values(draftEnum)) count += vals.length;
      for (const val of Object.values(draftBool)) {
         if (val !== null) count++;
      }
      for (const [key, val] of Object.entries(draftRange)) {
         const g = filters.find((f) => f.key === key);
         const bounds = g ? getRangeMinMax(g) : null;
         if (bounds && (val.min !== bounds.min || val.max !== bounds.max))
            count++;
      }
      return count;
   }, [draftEnum, draftBool, draftRange, filters]);

   // ─── Sort chip handler — gửi đúng sortBy/sortOrder lên URL ──────────────────
   const handleSortChip = (chip: (typeof SORT_CHIPS)[number]) => {
      setActiveSort(chip.value);
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", chip.sortBy);
      params.set("sortOrder", chip.sortOrder);
      params.delete("page");
      startTransition(() => {
         router.push(`${pathname}?${params.toString()}`, { scroll: false });
      });
   };

   // ─── Shared sub-components ───────────────────────────────────────────────────

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
            <ChevronDown className="w-4 h-4 text-primary" />
         ) : (
            <ChevronUp className="w-4 h-4 text-primary" />
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

   // ─── Desktop render helpers ──────────────────────────────────────────────────
   const renderEnumDesktop = (group: FilterGroup) => {
      if (group.type !== "ENUM" || !group.options?.length) return null;
      const selected = getValues(group.key);
      return (
         <div key={group.key}>
            {/* group.name — khớp với BE */}
            <SectionHeader label={group.name} groupKey={group.key} />
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

   const renderRangeDesktop = (group: FilterGroup) => {
      const bounds = getRangeMinMax(group);
      if (!bounds) return null;
      const local = sliderValues[group.key] ?? bounds;
      const isPrice = group.key === "price";
      const isSameMinMax = bounds.min === bounds.max;
      const unit = group.type === "RANGE" ? group.range?.unit : undefined;
      const fmt = (v: number) =>
         isPrice
            ? v.toLocaleString("vi-VN") + "đ"
            : `${v}${unit ? " " + unit : ""}`;
      const setLocal = (min: number, max: number) =>
         setSliderValues((prev) => ({ ...prev, [group.key]: { min, max } }));

      return (
         <div key={group.key}>
            <SectionHeader label={group.name} groupKey={group.key} />
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
                     <p className="text-xs text-primary text-center">
                        {fmt(bounds.min)}
                     </p>
                  ) : (
                     <>
                        <input
                           type="range"
                           min={bounds.min}
                           max={bounds.max}
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
                           min={bounds.min}
                           max={bounds.max}
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

   const renderBooleanDesktop = (group: FilterGroup) => {
      const raw = getValue(group.key);
      const current = raw === "true" ? true : raw === "false" ? false : null;
      return (
         <div key={group.key}>
            <SectionHeader label={group.name} groupKey={group.key} />
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

   const renderGroupDesktop = (group: FilterGroup) => {
      switch (group.type) {
         case "ENUM":
            return renderEnumDesktop(group);
         case "RANGE":
            return renderRangeDesktop(group);
         case "BOOLEAN":
            return renderBooleanDesktop(group);
         default:
            return null;
      }
   };

   // ─── Mobile: sheet render helpers ───────────────────────────────────────────

   const SheetSectionHeader = ({ label }: { label: string }) => (
      <div className="py-3 border-b border-neutral mb-3">
         <span className="text-sm font-semibold text-primary">{label}</span>
      </div>
   );

   const SheetChip = ({
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
         className={`w-full py-2.5 rounded-xl text-sm font-medium border transition-all cursor-pointer duration-150 ${
            active
               ? "border-accent bg-accent-light text-accent"
               : "border-neutral bg-neutral-light text-primary hover:border-accent-light hover:bg-accent-light/50"
         }`}
      >
         {label}
      </button>
   );

   const renderEnumSheet = (group: FilterGroup) => {
      if (group.type !== "ENUM" || !group.options?.length) return null;
      const selected = draftEnum[group.key] ?? [];
      return (
         <div key={group.key} className="mb-5">
            <SheetSectionHeader label={group.name} />
            <div className="grid grid-cols-2 gap-2">
               {group.options.map((opt) => (
                  <SheetChip
                     key={opt.value}
                     label={opt.label}
                     active={selected.includes(opt.value)}
                     onClick={() => draftToggleEnum(group.key, opt.value)}
                  />
               ))}
            </div>
         </div>
      );
   };

   const renderRangeSheet = (group: FilterGroup) => {
      const bounds = getRangeMinMax(group);
      if (!bounds) return null;
      const local = draftRange[group.key] ?? bounds;
      const isPrice = group.key === "price";
      const isSameMinMax = bounds.min === bounds.max;
      const unit = group.type === "RANGE" ? group.range?.unit : undefined;
      const fmt = (v: number) =>
         isPrice
            ? v.toLocaleString("vi-VN") + "đ"
            : `${v}${unit ? " " + unit : ""}`;

      return (
         <div key={group.key} className="mb-5">
            <SheetSectionHeader label={group.name} />
            <div className="space-y-3">
               <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2 text-sm border border-neutral rounded-xl bg-neutral-light-active text-primary text-center font-medium">
                     {fmt(local.min)}
                  </div>
                  <span className="text-neutral-dark text-sm">–</span>
                  <div className="flex-1 px-3 py-2 text-sm border border-neutral rounded-xl bg-neutral-light-active text-primary text-center font-medium">
                     {fmt(local.max)}
                  </div>
               </div>
               {isSameMinMax ? (
                  <p className="text-sm text-primary text-center">
                     {fmt(bounds.min)}
                  </p>
               ) : (
                  <>
                     <input
                        type="range"
                        min={bounds.min}
                        max={bounds.max}
                        step={isPrice ? 500000 : 0.1}
                        value={local.min}
                        onChange={(e) =>
                           draftSetRange(
                              group.key,
                              Math.min(
                                 Number(e.target.value),
                                 local.max - (isPrice ? 500000 : 0.1),
                              ),
                              local.max,
                           )
                        }
                        className="w-full h-1.5 rounded-full cursor-pointer"
                     />
                     <input
                        type="range"
                        min={bounds.min}
                        max={bounds.max}
                        step={isPrice ? 500000 : 0.1}
                        value={local.max}
                        onChange={(e) =>
                           draftSetRange(
                              group.key,
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
         </div>
      );
   };

   const renderBooleanSheet = (group: FilterGroup) => {
      const current = draftBool[group.key] ?? null;
      return (
         <div key={group.key} className="mb-5">
            <SheetSectionHeader label={group.name} />
            <div className="grid grid-cols-3 gap-2">
               <SheetChip
                  label="Tất cả"
                  active={current === null}
                  onClick={() => draftSetBool(group.key, null)}
               />
               <SheetChip
                  label="Có"
                  active={current === true}
                  onClick={() => draftSetBool(group.key, true)}
               />
               <SheetChip
                  label="Không"
                  active={current === false}
                  onClick={() => draftSetBool(group.key, false)}
               />
            </div>
         </div>
      );
   };

   const renderGroupSheet = (group: FilterGroup) => {
      switch (group.type) {
         case "ENUM":
            return renderEnumSheet(group);
         case "RANGE":
            return renderRangeSheet(group);
         case "BOOLEAN":
            return renderBooleanSheet(group);
         default:
            return null;
      }
   };

   if (!filters.length) return null;

   // ─── DESKTOP render ───────────────────────────────────────────────────────────
   if (!isMobile) {
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
                     <span className="text-xs text-primary animate-pulse">
                        Đang lọc...
                     </span>
                  )}
               </div>
               {hasFilters && (
                  <button
                     type="button"
                     onClick={resetAll}
                     className="flex items-center gap-1 text-xs text-accent hover:text-accent-hover transition-colors cursor-pointer"
                  >
                     <X className="w-3.5 h-3.5" />
                     Xoá tất cả
                  </button>
               )}
            </div>
            <div className="px-4 py-4 space-y-5">
               {filters.map(renderGroupDesktop)}
            </div>
         </div>
      );
   }

   // ─── MOBILE render ────────────────────────────────────────────────────────────
   return (
      <>
         <div
            className={`flex items-center gap-0 transition-opacity duration-200 ${
               isPending ? "opacity-60 pointer-events-none" : ""
            }`}
         >
            {/* Scrollable sort chips */}
            <div className="flex-1 overflow-x-auto scrollbar-none">
               <div
                  className="flex items-center gap-2 pr-1 pb-3 pt-3"
                  style={{ width: "max-content" }}
               >
                  {SORT_CHIPS.map((chip) => {
                     const Icon = chip.icon;
                     const isActive = activeSort === chip.value;
                     return (
                        <button
                           key={chip.value}
                           type="button"
                           onClick={() => handleSortChip(chip)}
                           className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-full text-sm font-medium border transition-all duration-150 cursor-pointer ${
                              isActive
                                 ? "bg-accent text-neutral-light border-accent shadow-sm"
                                 : "bg-neutral-light text-primary border-neutral hover:border-accent-light"
                           }`}
                        >
                           <Icon className="w-3.5 h-3.5 shrink-0" />
                           {chip.label}
                        </button>
                     );
                  })}
               </div>
            </div>

            {/* Divider */}
            <div className="w-px h-7 bg-neutral mx-2 shrink-0" />

            {/* Filter button */}
            <button
               type="button"
               onClick={openSheet}
               className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium border border-neutral bg-neutral-light text-primary hover:border-accent-light transition-all shrink-0 cursor-pointer"
            >
               <Filter className="w-3.5 h-3.5" />
               <span>Lọc</span>
               {hasFilters && (
                  <span className="absolute -top-1.5 right-0 w-4 h-4 bg-accent text-neutral-light text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                     {
                        Array.from(searchParams.entries()).filter(
                           ([k]) =>
                              k !== "page" &&
                              k !== "sortBy" &&
                              k !== "sortOrder",
                        ).length
                     }
                  </span>
               )}
            </button>
         </div>

         {/* ── Bottom Sheet ── */}

         {/* Backdrop */}
         <div
            aria-hidden="true"
            onClick={closeSheet}
            className={`fixed inset-0 z-40 bg-primary-darker/50 transition-opacity duration-300 ${
               isSheetOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
            }`}
         />

         {/* Sheet */}
         <div
            role="dialog"
            aria-modal="true"
            aria-label="Bộ lọc tìm kiếm"
            className={`fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-neutral-light rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
               isSheetOpen ? "translate-y-0" : "translate-y-full"
            }`}
            style={{ maxHeight: "90dvh" }}
         >
            {/* Handle */}
            <div className="flex justify-center pt-3 shrink-0">
               <div className="w-10 h-1 rounded-full bg-neutral" />
            </div>

            {/* Header — fixed */}
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral shrink-0">
               <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-accent" />
                  <span className="text-base font-bold text-primary">
                     Bộ lọc tìm kiếm
                  </span>
               </div>
               <button
                  type="button"
                  onClick={closeSheet}
                  aria-label="Đóng"
                  className="p-1.5 rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-colors"
               >
                  <X className="w-5 h-5" />
               </button>
            </div>

            {/* Body — scrollable */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-2 pb-2">
               {filters.map(renderGroupSheet)}
            </div>

            {/* Footer — sticky */}
            <div className="shrink-0 px-4 py-4 border-t border-neutral bg-neutral-light">
               <div className="flex gap-3">
                  <button
                     type="button"
                     onClick={resetDraft}
                     className="flex-1 py-3 rounded-xl text-sm font-semibold border-2 border-neutral text-primary bg-neutral-light hover:border-neutral-hover transition-colors"
                  >
                     Thiết lập lại
                  </button>
                  <button
                     type="button"
                     onClick={applyDraft}
                     className={`flex-1 py-3 rounded-xl text-sm font-semibold text-neutral-light transition-colors ${
                        isPending
                           ? "bg-accent-dark cursor-not-allowed"
                           : "bg-accent hover:bg-accent-hover"
                     }`}
                     disabled={isPending}
                  >
                     {isPending ? "Đang lọc..." : "Áp dụng"}
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}
