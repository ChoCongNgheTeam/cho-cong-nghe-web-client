import apiRequest from "@/lib/api";
import {
   VoucherDetail,
   VouchersResponse,
   GetVouchersParams,
   CreateVoucherPayload,
   UpdateVoucherPayload,
   VoucherCard,
} from "../voucher.types";
import { EntityOption } from "../components/MultiSelectDropdown";

interface VoucherDetailResponse {
   data: VoucherDetail;
   message: string;
}

interface DeletedVouchersResponse {
   data: VoucherCard[];
   message: string;
}

export const getAllVouchers = async (
   params?: GetVouchersParams,
): Promise<VouchersResponse> => {
   return apiRequest.get<VouchersResponse>("/vouchers/admin/all", { params });
};

export const getVoucher = async (
   id: string,
): Promise<VoucherDetailResponse> => {
   return apiRequest.get<VoucherDetailResponse>(`/vouchers/admin/${id}`);
};

export const createVoucher = async (
   payload: CreateVoucherPayload,
): Promise<VoucherDetailResponse> => {
   return apiRequest.post<VoucherDetailResponse>("/vouchers/admin", payload);
};

export const updateVoucher = async (
   id: string,
   payload: UpdateVoucherPayload,
): Promise<VoucherDetailResponse> => {
   return apiRequest.patch<VoucherDetailResponse>(
      `/vouchers/admin/${id}`,
      payload,
   );
};

export const deleteVoucher = async (id: string): Promise<void> => {
   await apiRequest.delete(`/vouchers/admin/${id}`);
};

export const bulkDeleteVouchers = async (
   ids: string[],
): Promise<{ data: { count: number }; message: string }> => {
   return apiRequest.delete("/vouchers/admin/bulk", { data: { ids } });
};

export async function fetchProductSearch(
   term: string,
): Promise<EntityOption[]> {
   const res = await apiRequest.get<{ data: any[] }>("/products", {
      params: { search: term, limit: 20 },
      noAuth: true,
   });
   return (res?.data ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      meta: p.sku ?? p.slug ?? undefined,
   }));
}

export async function fetchAllCategories(): Promise<EntityOption[]> {
   const res = await apiRequest.get<{ data: any[] }>("/categories", {
      params: { limit: 200 },
      noAuth: true,
   });
   return (res?.data ?? []).map((c) => ({ id: c.id, name: c.name }));
}

export async function fetchAllBrands(): Promise<EntityOption[]> {
   const res = await apiRequest.get<{ data: any[] }>("/brands", {
      noAuth: true,
   });
   return (res?.data ?? []).map((b) => ({ id: b.id, name: b.name }));
}
