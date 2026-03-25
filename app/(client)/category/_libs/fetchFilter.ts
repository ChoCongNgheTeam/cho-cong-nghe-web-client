import apiRequest from "@/lib/api";

export interface FilterOption {
   value: string;
   label: string;
   count?: number;
}

type FilterGroupBase = {
   key: string;
   name: string; // ← BE dùng "name", không phải "label"
   source: "specification" | "attribute" | "built-in";
   sortOrder?: number;
};

export type FilterGroup =
   | (FilterGroupBase & {
        type: "RANGE";
        range: { min: number; max: number; unit?: string };
        options?: never;
     })
   | (FilterGroupBase & {
        type: "ENUM";
        options: FilterOption[];
        range?: never;
     })
   | (FilterGroupBase & {
        type: "BOOLEAN";
        options: FilterOption[];
        range?: never;
     });

// ─── Raw API response shape ───────────────────────────────────────────────────

interface FilterResponseData {
   categoryId: string;
   categorySlug: string;
   categoryName: string;
   filters: FilterGroup[]; // BE shape khớp trực tiếp với FilterGroup
}

interface FilterResponse {
   data: FilterResponseData;
   message: string;
}

// ─── Fetch — không cần map, BE shape === FilterGroup shape ───────────────────

export async function fetchFilters(
   categorySlug: string,
): Promise<FilterGroup[]> {
   try {
      const res = await apiRequest.get<FilterResponse>("/products/filters", {
         params: { category: categorySlug },
         noAuth: true,
      });
      return res?.data?.filters ?? [];
   } catch (err) {
      console.error("[fetchFilters] failed:", err);
      return [];
   }
}
