import { getAccessToken } from "./token";
import { waitForAuthInit } from "./auth-init";
import { performRefresh } from "./refresh";
import { ApiError, type SafeResponse } from "./errors";
import { API_BASE_URL } from "@/config/api.config";

const BASE_URL = API_BASE_URL?.replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 15000;

type ApiResponseType = "json" | "blob" | "text";
type QueryParams = object;

interface RequestOptions extends Omit<RequestInit, "signal" | "body"> {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  noAuth?: boolean;
  params?: QueryParams;
  noRedirectOn401?: boolean;
  silentAuth?: boolean;
  timeout?: number;
  signal?: AbortSignal;
  responseType?: ApiResponseType;
  body?: unknown;
}

type SimpleOptions = {
  noAuth?: boolean;
  timeout?: number;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

async function parseBody<T>(response: Response, responseType: ApiResponseType): Promise<T> {
  switch (responseType) {
    case "blob":
      return (await response.blob()) as T;
    case "text":
      return (await response.text()) as T;
    default:
      return (await response.json()) as T;
  }
}

async function safeJson(response: Response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

class ApiRequest {
  private buildUrl(endpoint: string, params?: object) {
    let url = `${BASE_URL}/api/v1${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== "object") {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }
    return url;
  }

  private buildHeaders(rawHeaders: HeadersInit | undefined, noAuth: boolean, isFormData: boolean, isJsonBody: boolean) {
    const callerHeaders = rawHeaders ? Object.fromEntries(Object.entries(rawHeaders as Record<string, string>).filter(([k]) => !(isFormData && k.toLowerCase() === "content-type"))) : {};

    const token = getAccessToken();

    return {
      ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
      ...(token && !noAuth ? { Authorization: `Bearer ${token}` } : {}),
      ...callerHeaders,
    };
  }

  private async doFetch(
    url: string,
    fetchOptions: Omit<RequestOptions, "params" | "noAuth" | "noRedirectOn401" | "silentAuth" | "timeout" | "signal" | "responseType" | "body" | "headers">,
    headers: HeadersInit,
    body: BodyInit | null | undefined,
    timeout: number,
    externalSignal?: AbortSignal,
  ) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    externalSignal?.addEventListener("abort", () => controller.abort());

    try {
      return await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        credentials: "include",
        headers,
        body,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { noAuth = false, params, noRedirectOn401 = false, silentAuth = false, timeout = DEFAULT_TIMEOUT_MS, signal: externalSignal, responseType = "json", ...fetchOptions } = options;

    if (!BASE_URL) {
      throw new Error("API_BASE_URL chưa được cấu hình");
    }

    if (!noAuth && !getAccessToken()) {
      await waitForAuthInit();
    }

    const url = this.buildUrl(endpoint, params);
    const isFormData = fetchOptions.body instanceof FormData;
    const isJsonBody = !!fetchOptions.body && typeof fetchOptions.body === "object" && !isFormData;
    const body = isJsonBody ? JSON.stringify(fetchOptions.body) : (fetchOptions.body as BodyInit | null | undefined);

    try {
      let response = await this.doFetch(url, fetchOptions, this.buildHeaders(fetchOptions.headers, noAuth, isFormData, isJsonBody), body, timeout, externalSignal);

      if (response.status === 401) {
        const errorData = await safeJson(response);

        if (noAuth || noRedirectOn401) {
          throw new ApiError(errorData?.message ?? "Unauthorized", 401, errorData);
        }

        const refreshed = await performRefresh();
        if (!refreshed) {
          throw new ApiError(silentAuth ? "Not authenticated" : "Session expired", 401);
        }

        // token mới -> build lại header rồi retry đúng 1 lần
        response = await this.doFetch(url, fetchOptions, this.buildHeaders(fetchOptions.headers, noAuth, isFormData, isJsonBody), body, timeout, externalSignal);

        if (!response.ok) {
          const retryErrorData = await safeJson(response);
          throw new ApiError(silentAuth ? "Not authenticated" : (retryErrorData?.message ?? "Retry failed after refresh"), response.status, retryErrorData);
        }
      } else if (!response.ok) {
        const errorData = response.status === 204 ? null : await safeJson(response);
        throw new ApiError(errorData?.message || "Lỗi máy chủ", response.status, errorData);
      }

      if (response.status === 204) return null as T;
      return await parseBody<T>(response, responseType);
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") {
        if (externalSignal?.aborted) {
          throw new DOMException("Request cancelled", "AbortError");
        }
        throw new Error("Request quá thời gian, vui lòng thử lại");
      }
      if (error instanceof ApiError) throw error;
      if (error instanceof TypeError) throw new Error("Không thể kết nối đến server");
      throw error;
    }
  }

  async postSafe<T>(endpoint: string, body?: unknown, options?: SimpleOptions): Promise<SafeResponse<T>> {
    try {
      const data = await this.request<T>(endpoint, { ...options, method: "POST", body });
      return { success: true, data };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: { message: error.message, status: error.status, data: error.data } };
      }
      const message = error instanceof Error ? error.message : "Đã xảy ra lỗi không xác định";
      return { success: false, error: { message, status: 500 } };
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }
  post<T>(endpoint: string, body?: unknown, options?: SimpleOptions) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }
  put<T>(endpoint: string, body?: unknown, options?: SimpleOptions) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }
  patch<T>(endpoint: string, body?: unknown, options?: SimpleOptions) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }
  delete<T>(endpoint: string, body?: unknown, options?: SimpleOptions) {
    return this.request<T>(endpoint, { ...options, method: "DELETE", body });
  }
}

const apiRequest = new ApiRequest();
export default apiRequest;
