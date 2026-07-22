import apiRequest from "@/lib/api";
import {
  VoucherDetail,
  VouchersResponse,
  GetVouchersParams,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherUsagesResponse,
  GetVoucherUsagesParams,
  VoucherUsersResponse,
  GetVoucherUsersParams,
  UserResult,
} from "../voucher.types";
import { EntityOption } from "@/components/admin/shared/EntitySelect";
import { createResourceApi, type ResourceEnvelope } from "@/lib/admin/createResourceApi";

// ── Voucher CRUD (chuẩn — dùng factory dùng chung) ────────────────────────────

const voucherApi = createResourceApi<VouchersResponse, VoucherDetail, CreateVoucherPayload, UpdateVoucherPayload, GetVouchersParams>("/vouchers/admin");

export const getAllVouchers = voucherApi.getAll;
export const getVoucher = (id: string) => voucherApi.getOne(id);
export const createVoucher = voucherApi.create;
export const updateVoucher = voucherApi.update;
export const deleteVoucher = voucherApi.remove;

export const bulkDeleteVouchers = async (ids: string[]): Promise<{ data: { count: number }; message: string }> => {
  return apiRequest.delete("/vouchers/admin/bulk", { data: { ids } });
};

// ── Usages ────────────────────────────────────────────────────────────────────

export const getVoucherUsages = async (params?: GetVoucherUsagesParams): Promise<VoucherUsagesResponse> => {
  return apiRequest.get<VoucherUsagesResponse>("/vouchers/admin/usages", { params });
};

// ── Private Users ─────────────────────────────────────────────────────────────

export const getVoucherUsers = async (params?: GetVoucherUsersParams): Promise<VoucherUsersResponse> => {
  return apiRequest.get<VoucherUsersResponse>("/vouchers/admin/private-users", { params });
};

export const revokeVoucherUser = async (voucherId: string, userId: string): Promise<{ message: string }> => {
  return apiRequest.delete(`/vouchers/admin/${voucherId}/users/${userId}`);
};

export const assignVoucherToUsers = async (payload: { voucherId: string; userIds: string[]; maxUsesPerUser: number }): Promise<{ data: { assigned: number }; message: string }> => {
  return apiRequest.post("/vouchers/admin/assign", payload);
};

// ── Search helpers ────────────────────────────────────────────────────────────

interface ApiProductSearchItem {
  id: string;
  name: string;
  sku?: string;
  slug?: string;
}

interface ApiCategoryItem {
  id: string;
  name: string;
}

interface ApiBrandItem {
  id: string;
  name: string;
}

export async function fetchProductSearch(term: string): Promise<EntityOption[]> {
  const res = await apiRequest.get<ResourceEnvelope<ApiProductSearchItem[]>>("/products", {
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
  const res = await apiRequest.get<ResourceEnvelope<ApiCategoryItem[]>>("/categories", {
    params: { limit: 200 },
    noAuth: true,
  });
  return (res?.data ?? []).map((c) => ({ id: c.id, name: c.name }));
}

export async function fetchAllBrands(): Promise<EntityOption[]> {
  const res = await apiRequest.get<ResourceEnvelope<ApiBrandItem[]>>("/brands", {
    noAuth: true,
  });
  return (res?.data ?? []).map((b) => ({ id: b.id, name: b.name }));
}

export async function searchUsers(q: string, limit = 10): Promise<UserResult[]> {
  const res = await apiRequest.get<{ data: UserResult[] }>("/users/admin", {
    params: { search: q, limit, role: "CUSTOMER" },
  });
  return Array.isArray(res.data) ? res.data : [];
}
