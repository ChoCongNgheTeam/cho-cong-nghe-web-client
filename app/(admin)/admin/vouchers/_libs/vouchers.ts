import apiRequest from "@/lib/api";
import { VoucherDetail, VouchersResponse, GetVouchersParams, CreateVoucherPayload, UpdateVoucherPayload, VoucherCard } from "../voucher.types";

interface VoucherDetailResponse {
  data: VoucherDetail;
  message: string;
}

interface DeletedVouchersResponse {
  data: VoucherCard[];
  message: string;
}

export const getAllVouchers = async (params?: GetVouchersParams): Promise<VouchersResponse> => {
  return apiRequest.get<VouchersResponse>("/vouchers/admin/all", { params });
};

export const getVoucher = async (id: string): Promise<VoucherDetailResponse> => {
  return apiRequest.get<VoucherDetailResponse>(`/vouchers/admin/${id}`);
};

export const createVoucher = async (payload: CreateVoucherPayload): Promise<VoucherDetailResponse> => {
  return apiRequest.post<VoucherDetailResponse>("/vouchers/admin", payload);
};

export const updateVoucher = async (id: string, payload: UpdateVoucherPayload): Promise<VoucherDetailResponse> => {
  return apiRequest.patch<VoucherDetailResponse>(`/vouchers/admin/${id}`, payload);
};

export const deleteVoucher = async (id: string): Promise<void> => {
  await apiRequest.delete(`/vouchers/admin/${id}`);
};

export const bulkDeleteVouchers = async (ids: string[]): Promise<{ data: { count: number }; message: string }> => {
  return apiRequest.delete("/vouchers/admin/bulk", { data: { ids } });
};
