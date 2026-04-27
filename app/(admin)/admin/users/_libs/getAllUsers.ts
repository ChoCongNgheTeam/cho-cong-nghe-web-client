import apiRequest from "@/lib/api";
import type { User, UserRole } from "../user.types";

// ─── Query params — khớp với getUsersQuerySchema của backend ──────────────────
export interface GetUsersQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  gender?: string;
  includeDeleted?: boolean;
  sortBy?: "createdAt" | "fullName" | "email" | "role";
  sortOrder?: "asc" | "desc";
}

// ─── Response — khớp với getUsersHandler của backend ─────────────────────────
// Controller trả về:
// { data: users[], pagination: { total, page, limit, totalPages }, message }
export interface GetUsersResponse {
  data: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  message?: string;
}

export async function getAllUsers(query: GetUsersQuery = {}): Promise<GetUsersResponse> {
  // Lọc bỏ undefined — không gửi param rỗng lên server
  const params = Object.fromEntries(Object.entries(query).filter(([, v]) => v !== undefined && v !== ""));

  const res = await apiRequest.get<GetUsersResponse>("/users/admin", { params });

  // Guard: đảm bảo shape đúng dù apiRequest có unwrap hay không
  const data: User[] = Array.isArray(res.data) ? res.data : [];
  const pagination = res.pagination ?? {
    total: data.length,
    page: query.page ?? 1,
    limit: query.limit ?? 10,
    totalPages: Math.ceil(data.length / (query.limit ?? 10)) || 1,
  };

  return { data, pagination, message: res.message };
}

export type ExportUserFormat = "excel" | "csv";

export interface ExportUsersParams {
  format: ExportUserFormat;
  search?: string;
  role?: "CUSTOMER" | "ADMIN" | "STAFF";
  isActive?: boolean;
  gender?: "MALE" | "FEMALE" | "OTHER";
  /** Có kèm số đơn hàng + tổng chi tiêu không (chậm hơn một chút) */
  withOrderStats?: boolean;
}

export async function exportUsers(params: ExportUsersParams): Promise<{ blob: Blob; filename: string; count: number }> {
  const qs = new URLSearchParams();
  qs.set("format", params.format);
  if (params.search) qs.set("search", params.search);
  if (params.role) qs.set("role", params.role);
  if (params.isActive !== undefined) qs.set("isActive", String(params.isActive));
  if (params.gender) qs.set("gender", params.gender);
  if (params.withOrderStats) qs.set("withOrderStats", "true");

  const blob = await apiRequest.get<Blob>(`/users/admin/export?${qs.toString()}`, {
    responseType: "blob",
  });

  const ext = params.format === "excel" ? "xlsx" : "csv";
  return { blob, filename: `users_export_${Date.now()}.${ext}`, count: 0 };
}
