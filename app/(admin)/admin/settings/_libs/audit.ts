import apiRequest from "@/lib/api";

/* ─── Types ─── */
export type AuditSeverity = "INFO" | "WARNING" | "CRITICAL";
export type AuditAction = "CREATE" | "READ" | "UPDATE" | "DELETE" | "RESTORE" | "LOGIN" | "LOGOUT" | "LOGIN_FAILED" | "PERMISSION_CHANGE" | "BULK_ACTION" | "EXPORT" | "SETTINGS_CHANGE";

export interface AuditLog {
  id: string;
  userId?: string | null;
  userName?: string | null;
  userRole?: string | null;
  action: AuditAction;
  module: string;
  targetId?: string | null;
  targetType?: string | null;
  description: string;
  diff?: { before: Record<string, unknown>; after: Record<string, unknown> } | null;
  ip?: string | null;
  userAgent?: string | null;
  device?: string | null;
  location?: string | null;
  severity: AuditSeverity;
  isSuccess: boolean;
  errorMsg?: string | null;
  createdAt: string;
}

export interface LoginHistory {
  id: string;
  userId?: string | null;
  email?: string | null;
  isSuccess: boolean;
  ip?: string | null;
  userAgent?: string | null;
  device?: string | null;
  browser?: string | null;
  location?: string | null;
  failReason?: string | null;
  createdAt: string;
}

export interface ActiveSession {
  id: string; // tokenId (refresh_token id)
  deviceName?: string | null;
  browser?: string | null;
  ip?: string | null;
  location?: string | null;
  lastUsedAt?: string | null;
  createdAt: string;
  isCurrent: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  module?: string;
  severity?: AuditSeverity | "";
  isSuccess?: boolean | "";
  search?: string;
  from?: string;
  to?: string;
}

export interface GetLoginHistoryParams {
  page?: number;
  limit?: number;
}

/* ─── API ─── */

export const getAuditLogs = async (params?: GetAuditLogsParams): Promise<PaginatedResponse<AuditLog>> => {
  return apiRequest.get("/audit/logs", { params });
};

export const getAuditLogDetail = async (id: string): Promise<{ data: AuditLog; message: string }> => {
  return apiRequest.get(`/audit/logs/${id}`);
};

export const exportAuditLogs = (params?: GetAuditLogsParams): string => {
  const base = "/audit/logs";
  const query = new URLSearchParams();
  if (params?.module) query.set("module", params.module);
  if (params?.severity) query.set("severity", params.severity);
  if (params?.search) query.set("search", params.search);
  if (params?.from) query.set("from", params.from);
  if (params?.to) query.set("to", params.to);
  query.set("format", "csv");
  return `${base}?${query.toString()}`;
};

export const getMyLoginHistory = async (params?: GetLoginHistoryParams): Promise<PaginatedResponse<LoginHistory>> => {
  return apiRequest.get("/audit/login-history/me", { params });
};

export const getAllLoginHistory = async (params?: GetLoginHistoryParams): Promise<PaginatedResponse<LoginHistory>> => {
  return apiRequest.get("/audit/login-history", { params });
};

export const getMySessions = async (): Promise<{
  data: ActiveSession[];
  message: string;
}> => {
  return apiRequest.get("/audit/sessions");
};

export const revokeSession = async (tokenId: string): Promise<{ message: string }> => {
  return apiRequest.delete(`/audit/sessions/${tokenId}`);
};

export const revokeAllSessions = async (): Promise<{ message: string }> => {
  return apiRequest.delete("/audit/sessions");
};
