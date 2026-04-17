export interface AttributeOption {
  id: string;
  value: string;
  label: string;
  isActive: boolean;
}

export interface Attribute {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  options: AttributeOption[];
}

export interface AttributesMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  activeCounts: { ALL: number; ACTIVE: number; INACTIVE: number };
}

export interface AttributesResponse {
  data: Attribute[];
  meta: AttributesMeta;
  message: string;
}

export interface GetAttributesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: "createdAt" | "name" | "code" | "optionCount";
  sortOrder?: "asc" | "desc";
}

export interface CreateAttributePayload {
  code: string;
  name: string;
  isActive?: boolean;
}

export interface UpdateAttributePayload {
  name?: string;
  isActive?: boolean;
}

export interface CreateOptionPayload {
  value: string;
  label: string;
  isActive?: boolean;
}

export interface UpdateOptionPayload {
  value?: string; // ← mới: cho phép sửa value
  label?: string;
  isActive?: boolean;
}
