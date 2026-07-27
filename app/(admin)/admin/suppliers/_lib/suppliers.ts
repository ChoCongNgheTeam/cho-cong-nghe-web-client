import apiRequest from "@/lib/api";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";
import { Supplier, SupplierLite, SuppliersResponse, GetSuppliersParams, CreateSupplierPayload, UpdateSupplierPayload } from "../supplier.types";

// LƯU Ý: giống warehouses — BE mount thẳng /admin/suppliers, không có suffix /all.

const supplierApi = createResourceApi<SuppliersResponse, Supplier, CreateSupplierPayload, UpdateSupplierPayload, GetSuppliersParams>("/admin/suppliers");

export const getSupplier = (id: string) => supplierApi.getOne(id);
export const createSupplier = supplierApi.create;
export const updateSupplier = supplierApi.update;
export const deleteSupplier = supplierApi.remove;

export const getAllSuppliers = (params?: GetSuppliersParams): Promise<SuppliersResponse> => apiRequest.get<SuppliersResponse>("/admin/suppliers", { params });

export const getActiveSuppliers = (): Promise<{ data: SupplierLite[]; message: string }> => apiRequest.get("/admin/suppliers/active");

export const restoreSupplier = (id: string): Promise<ResourceEnvelope<Supplier>> => apiRequest.post<ResourceEnvelope<Supplier>>(`/admin/suppliers/${id}/restore`, {});
