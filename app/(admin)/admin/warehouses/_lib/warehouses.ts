import apiRequest from "@/lib/api";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";
import { Warehouse, WarehouseLite, WarehousesResponse, GetWarehousesParams, CreateWarehousePayload, UpdateWarehousePayload } from "../warehouse.types";

// ── Warehouse CRUD ────────────────────────────────────────────────────────────
// LƯU Ý: BE mount thẳng /admin/warehouses (không theo convention {basePath}/admin/all
// như brands) nên KHÔNG dùng `getAll` của factory — viết tay riêng bên dưới.
// getOne/create/update/remove vẫn khớp path nên dùng factory bình thường.

const warehouseApi = createResourceApi<WarehousesResponse, Warehouse, CreateWarehousePayload, UpdateWarehousePayload, GetWarehousesParams>("/admin/warehouses");

export const getWarehouse = (id: string) => warehouseApi.getOne(id);
export const createWarehouse = warehouseApi.create;
export const updateWarehouse = warehouseApi.update;
export const deleteWarehouse = warehouseApi.remove;

export const getAllWarehouses = (params?: GetWarehousesParams): Promise<WarehousesResponse> => apiRequest.get<WarehousesResponse>("/admin/warehouses", { params });

// Danh sách rút gọn (kho đang active) — dùng cho dropdown chọn kho ở inventory/suppliers...
export const getActiveWarehouses = (): Promise<{ data: WarehouseLite[]; message: string }> => apiRequest.get("/admin/warehouses/active");

// ── Custom (không thuộc CRUD chuẩn) ───────────────────────────────────────────

export const restoreWarehouse = (id: string): Promise<ResourceEnvelope<Warehouse>> => apiRequest.post<ResourceEnvelope<Warehouse>>(`/admin/warehouses/${id}/restore`, {});

export const setDefaultWarehouse = (id: string): Promise<ResourceEnvelope<Warehouse>> => apiRequest.post<ResourceEnvelope<Warehouse>>(`/admin/warehouses/${id}/set-default`, {});
