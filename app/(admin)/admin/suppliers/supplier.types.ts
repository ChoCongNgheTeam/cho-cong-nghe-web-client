export interface Supplier {
  id: string;
  code: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxCode: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface SupplierLite {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
}

export interface SuppliersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface SuppliersResponse {
  data: Supplier[];
  meta: SuppliersMeta;
  message: string;
}

export interface GetSuppliersParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateSupplierPayload {
  code?: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxCode?: string;
  note?: string;
  isActive?: boolean;
}

export type UpdateSupplierPayload = Partial<CreateSupplierPayload>;
