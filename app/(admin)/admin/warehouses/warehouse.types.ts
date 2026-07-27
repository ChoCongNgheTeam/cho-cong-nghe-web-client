export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  managerName: string | null;
  note: string | null;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  deletedBy: string | null;
}

export interface WarehouseLite {
  id: string;
  code: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface WarehousesMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WarehousesResponse {
  data: Warehouse[];
  meta: WarehousesMeta;
  message: string;
}

export interface GetWarehousesParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  includeDeleted?: boolean;
  sortBy?: "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateWarehousePayload {
  code?: string;
  name: string;
  address?: string;
  phone?: string;
  managerName?: string;
  note?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

export type UpdateWarehousePayload = Partial<CreateWarehousePayload>;
