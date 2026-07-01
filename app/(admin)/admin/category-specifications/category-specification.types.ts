import type { Specification } from "../specifications/specification.types";

export interface CategorySpecItem {
  categoryId: string;
  specificationId: string;
  groupName: string;
  isRequired: boolean;
  sortOrder: number;
  specification: Specification;
}

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
}

export interface GetCategorySpecsResponse {
  data: {
    category: { id: string; name: string };
    items: CategorySpecItem[];
  };
  message: string;
}

export interface UpsertCategorySpecPayload {
  specificationId: string;
  groupName: string;
  isRequired: boolean;
  sortOrder: number;
}

export interface BulkUpsertCategorySpecsPayload {
  items: UpsertCategorySpecPayload[];
}

export interface RemoveCategorySpecPayload {
  specificationId: string;
}

// Grouped for UI rendering
export interface SpecGroup {
  groupName: string;
  items: CategorySpecItem[];
}
