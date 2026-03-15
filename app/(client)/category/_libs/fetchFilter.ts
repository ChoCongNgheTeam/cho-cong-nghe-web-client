import apiRequest from "@/lib/api";

export type FilterType = "ENUM" | "RANGE" | "BOOLEAN";

export interface FilterOption {
   value: string;
   label: string;
   count?: number;
}

export interface FilterGroup {
   key: string;
   label: string; // FE dùng "label", nhưng API trả về "name" — cần map
   type: FilterType;
   options?: FilterOption[]; // ENUM
   min?: number; // RANGE — được map từ range.min
   max?: number; // RANGE — được map từ range.max
   unit?: string; // RANGE — được map từ range.unit
}

// ─── Raw API types ────────────────────────────────────────────────────────────

interface RawFilterGroup {
   key: string;
   name: string; // API dùng "name", không phải "label"
   type: FilterType;
   source: string;
   sortOrder: number;
   options?: FilterOption[];
   range?: {
      min: number;
      max: number;
      unit?: string;
   };
}

interface FilterResponseData {
   categoryId: string;
   categorySlug: string;
   categoryName: string;
   filters: RawFilterGroup[];
}

interface FilterResponse {
   data: FilterResponseData;
   message: string;
}

// ─── Map raw → FilterGroup ────────────────────────────────────────────────────

function mapFilter(raw: RawFilterGroup): FilterGroup {
   return {
      key: raw.key,
      label: raw.name, // map name → label
      type: raw.type,
      options: raw.options,
      min: raw.range?.min,
      max: raw.range?.max,
      unit: raw.range?.unit,
   };
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export async function fetchFilters(
   categorySlug: string,
): Promise<FilterGroup[]> {
   try {
      const res = await apiRequest.get<FilterResponse>("/products/filters", {
         params: { category: categorySlug },
         noAuth: true,
      });
      const raw = res?.data?.filters ?? [];
      return raw.map(mapFilter);
   } catch (err) {
      console.error("[fetchFilters] failed:", err);
      return [];
   }
}
