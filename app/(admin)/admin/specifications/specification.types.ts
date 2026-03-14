export type FilterType = "RANGE" | "ENUM" | "BOOLEAN";

export interface Specification {
  id: string;
  key: string;
  name: string;
  group: string;
  unit?: string;
  icon?: string;
  isActive: boolean;
  isFilterable: boolean;
  filterType?: FilterType;
  isRequired: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface SpecificationsMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SpecificationsResponse {
  data: Specification[];
  meta: SpecificationsMeta;
  message: string;
}

export interface GetSpecificationsParams {
  page?: number;
  limit?: number;
  search?: string;
  group?: string;
  isActive?: boolean;
  isFilterable?: boolean;
  sortBy?: "createdAt" | "name" | "group" | "sortOrder";
  sortOrder?: "asc" | "desc";
}

export interface CreateSpecificationPayload {
  key: string;
  name: string;
  group?: string;
  unit?: string;
  icon?: string;
  isActive?: boolean;
  isFilterable?: boolean;
  filterType?: FilterType;
  isRequired?: boolean;
  sortOrder?: number;
}

export type UpdateSpecificationPayload = Omit<Partial<CreateSpecificationPayload>, "key">;
