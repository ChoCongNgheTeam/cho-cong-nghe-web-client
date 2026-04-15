const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

// ==========================================
// ACCESS TOKEN - lưu trong memory (không dùng localStorage/cookie)
// ==========================================
let _accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  _accessToken = token;
};

export const getAccessToken = () => _accessToken;

class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

interface SafeResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    status: number;
    data?: any;
  };
}

// ==========================================
// SINGLETON REFRESH - chỉ 1 request refresh tại một thời điểm
// ==========================================
let _refreshPromise: Promise<boolean> | null = null;

export const performRefresh = async (retryCount = 0): Promise<boolean> => {
  if (_refreshPromise) return _refreshPromise;

  _refreshPromise = (async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const refreshResponse = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
        method: "POST",
        credentials: "include",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const token = data?.data?.accessToken ?? data?.accessToken ?? null;
        if (token) {
          setAccessToken(token);
          return true;
        }
        return false;
      }

      return false;
    } catch (err: any) {
      if (err?.name === "AbortError") {
        console.warn(`[performRefresh] Timeout lần ${retryCount + 1}`);

        if (retryCount < 2) {
          _refreshPromise = null;
          return performRefresh(retryCount + 1);
        }

        console.warn("[performRefresh] Hết retry, coi như fail");
      }
      return false;
    } finally {
      _refreshPromise = null;
    }
  })();

  return _refreshPromise;
};

// ==========================================
// AUTH INIT GATE
// ==========================================
let _authInitialized = false;
let _authInitPromise: Promise<void> | null = null;
let _authInitResolve: (() => void) | null = null;

export const waitForAuthInit = (): Promise<void> => {
  if (_authInitialized) return Promise.resolve();
  if (_authInitPromise) return _authInitPromise;
  _authInitPromise = new Promise((resolve) => {
    _authInitResolve = resolve;
  });
  return _authInitPromise;
};

export const resolveAuthInit = () => {
  _authInitialized = true;
  _authInitResolve?.();
};

export const resetAuthInit = () => {
  _authInitialized = false;
  _authInitPromise = null;
  _authInitResolve = null;
};

type ApiResponseType = "json" | "blob" | "text";

// ==========================================
// SHARED OPTIONS TYPE
// ==========================================
interface RequestOptions extends Omit<RequestInit, "signal"> {
  noAuth?: boolean;
  params?: Record<string, any>;
  noRedirectOn401?: boolean;
  silentAuth?: boolean;
  timeout?: number;
  /** Cho phép caller truyền AbortSignal để cancel request */
  signal?: AbortSignal;

  responseType?: ApiResponseType;
}

// ==========================================
// API REQUEST CLASS
// ==========================================
class ApiRequest {
  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const {
      noAuth = false,
      params,
      noRedirectOn401 = false,
      silentAuth = false,
      timeout = 15000,
      signal: externalSignal, // ← signal từ AbortController bên ngoài
      ...fetchOptions
    } = options;

    if (!BASE_URL) {
      throw new Error("NEXT_PUBLIC_API_BASE_URL chưa được cấu hình");
    }

    if (!noAuth && !_accessToken) {
      await waitForAuthInit();
    }

    let url = `${BASE_URL}/api/v1${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) url += `?${queryString}`;
    }

    // Kết hợp timeout controller + external signal
    const timeoutController = new AbortController();
    const timeoutId = setTimeout(() => timeoutController.abort(), timeout);

    // Nếu caller cancel → propagate vào timeoutController
    externalSignal?.addEventListener("abort", () => timeoutController.abort());

    const signal = timeoutController.signal;

    const isFormData = fetchOptions.body instanceof FormData;
    const isJsonBody = fetchOptions.body && typeof fetchOptions.body === "object" && !isFormData;

    const buildHeaders = () => {
      // Với FormData: KHÔNG set Content-Type — browser tự thêm boundary
      // Caller headers vẫn được merge, nhưng Content-Type bị strip nếu là FormData
      const callerHeaders = fetchOptions.headers
        ? Object.fromEntries(Object.entries(fetchOptions.headers as Record<string, string>).filter(([k]) => !(isFormData && k.toLowerCase() === "content-type")))
        : {};

      return {
        ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
        ...(_accessToken && !noAuth ? { Authorization: `Bearer ${_accessToken}` } : {}),
        ...callerHeaders,
      };
    };

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal,
        credentials: "include",
        headers: buildHeaders(),
        body: isJsonBody ? JSON.stringify(fetchOptions.body) : fetchOptions.body,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        let errorData = null;
        try {
          errorData = await response.json();
        } catch {}

        if (noAuth) throw new ApiError(errorData?.message ?? "Unauthorized", 401, errorData);
        if (noRedirectOn401) throw new ApiError(errorData?.message ?? "Unauthorized", 401, errorData);

        const refreshed = await performRefresh();

        if (refreshed) {
          const retryController = new AbortController();
          const retryTimeoutId = setTimeout(() => retryController.abort(), timeout);
          externalSignal?.addEventListener("abort", () => retryController.abort());

          const retryResponse = await fetch(url, {
            ...fetchOptions,
            signal: retryController.signal,
            credentials: "include",
            headers: buildHeaders(),
            body: isJsonBody ? JSON.stringify(fetchOptions.body) : fetchOptions.body,
          });

          clearTimeout(retryTimeoutId);

          if (retryResponse.ok) {
            if (retryResponse.status === 204) return null as T;
            const responseType = options.responseType ?? "json";

            switch (responseType) {
              case "blob":
                return (await response.blob()) as T;
              case "text":
                return (await response.text()) as T;
              default:
                return (await response.json()) as T;
            }
          }

          if (!silentAuth) {
            let retryErrorData = null;
            try {
              retryErrorData = await retryResponse.json();
            } catch {}
            throw new ApiError(retryErrorData?.message ?? "Retry failed after refresh", retryResponse.status, retryErrorData);
          }
        }

        if (silentAuth) throw new ApiError("Not authenticated", 401);
        throw new ApiError("Session expired", 401);
      }

      if (!response.ok) {
        let message = "Lỗi máy chủ";
        let errorData = null;
        try {
          errorData = response.status === 204 ? null : await response.json();
          message = errorData?.message || message;
        } catch {}
        throw new ApiError(message, response.status, errorData);
      }

      if (response.status === 204) return null as T;

      const responseType = options.responseType ?? "json";

      switch (responseType) {
        case "blob":
          return (await response.blob()) as T;
        case "text":
          return (await response.text()) as T;
        default:
          return (await response.json()) as T;
      }
    } catch (error: any) {
      clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        // Phân biệt user cancel vs timeout
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

  async postSafe<T>(endpoint: string, body?: any, options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit; signal?: AbortSignal }): Promise<SafeResponse<T>> {
    try {
      const data = await this.request<T>(endpoint, { ...options, method: "POST", body });
      return { success: true, data };
    } catch (error) {
      if (error instanceof ApiError) {
        return { success: false, error: { message: error.message, status: error.status, data: error.data } };
      }
      if (error instanceof Error) {
        return { success: false, error: { message: error.message, status: 500 } };
      }
      return { success: false, error: { message: "Đã xảy ra lỗi không xác định", status: 500 } };
    }
  }

  get<T>(endpoint: string, options?: RequestOptions) {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  post<T>(endpoint: string, body?: any, options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit; signal?: AbortSignal }) {
    return this.request<T>(endpoint, { ...options, method: "POST", body });
  }

  put<T>(endpoint: string, body?: any, options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit; signal?: AbortSignal }) {
    return this.request<T>(endpoint, { ...options, method: "PUT", body });
  }

  patch<T>(endpoint: string, body?: any, options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit; signal?: AbortSignal }) {
    return this.request<T>(endpoint, { ...options, method: "PATCH", body });
  }

  delete<T>(endpoint: string, body?: any, options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit; signal?: AbortSignal }) {
    return this.request<T>(endpoint, { ...options, method: "DELETE", body });
  }
}

const apiRequest = new ApiRequest();
export default apiRequest;
export { ApiError };
export type { SafeResponse };
