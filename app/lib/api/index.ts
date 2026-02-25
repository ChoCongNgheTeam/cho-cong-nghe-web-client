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
         const refreshResponse = await fetch(
            `${BASE_URL}/api/v1/auth/refresh`,
            {
               method: "POST",
               credentials: "include",
            },
         );

         if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            if (data?.data?.accessToken) setAccessToken(data.data.accessToken);
            else if (data?.accessToken) setAccessToken(data.accessToken);
            return true;
         }

         // Xử lý 429: chờ rồi retry (tối đa 3 lần)
         if (refreshResponse.status === 429 && retryCount < 3) {
            const retryAfter = refreshResponse.headers.get("Retry-After");
            const delay = retryAfter
               ? parseInt(retryAfter) * 1000
               : (retryCount + 1) * 2000; // 2s, 4s, 6s
            await new Promise((r) => setTimeout(r, delay));
            _refreshPromise = null; // reset để cho phép retry
            return performRefresh(retryCount + 1);
         }

         return false;
      } catch {
         return false;
      } finally {
         _refreshPromise = null;
      }
   })();

   return _refreshPromise;
};

// ==========================================
// AUTH INIT GATE - block request cho đến khi AuthContext init xong
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

/**
 * Reset auth init gate.
 * Cần gọi khi AuthProvider mount lại (HMR, StrictMode) để tránh
 * trạng thái _authInitialized=true cũ khiến requests gửi đi không có token.
 */
export const resetAuthInit = () => {
   _authInitialized = false;
   _authInitPromise = null;
   _authInitResolve = null;
};

// ==========================================
// API REQUEST CLASS
// ==========================================
class ApiRequest {
   private async request<T>(
      endpoint: string,
      options: RequestInit & {
         noAuth?: boolean;
         params?: Record<string, any>;
         noRedirectOn401?: boolean;
         silentAuth?: boolean;
         timeout?: number;
      } = {},
   ): Promise<T> {
      const {
         noAuth = false,
         params,
         noRedirectOn401 = false,
         silentAuth = false,
         timeout = 15000,
         ...fetchOptions
      } = options;

      if (!BASE_URL) {
         throw new Error("NEXT_PUBLIC_API_BASE_URL chưa được cấu hình");
      }

      // Chờ AuthContext init xong trước khi gửi request cần auth
      // Tránh race condition khi F5: các component mount trước khi có access token
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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const isFormData = fetchOptions.body instanceof FormData;
      const isJsonBody =
         fetchOptions.body &&
         typeof fetchOptions.body === "object" &&
         !isFormData;

      const buildHeaders = () => ({
         ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
         ...(_accessToken && !noAuth
            ? { Authorization: `Bearer ${_accessToken}` }
            : {}),
         ...fetchOptions.headers,
      });

      try {
         const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            credentials: "include",
            headers: buildHeaders(),
            body: isJsonBody
               ? JSON.stringify(fetchOptions.body)
               : fetchOptions.body,
         });

         clearTimeout(timeoutId);

         if (response.status === 401) {
            if (noAuth) {
               throw new ApiError("Unauthorized", 401);
            }

            if (noRedirectOn401) {
               throw new ApiError("Unauthorized", 401);
            }

            // Thử refresh token (singleton - chỉ 1 lần dù nhiều request cùng 401)
            const refreshed = await performRefresh();

            if (refreshed) {
               const retryController = new AbortController();
               const retryTimeoutId = setTimeout(
                  () => retryController.abort(),
                  timeout,
               );

               const retryResponse = await fetch(url, {
                  ...fetchOptions,
                  signal: retryController.signal,
                  credentials: "include",
                  headers: buildHeaders(),
                  body: isJsonBody
                     ? JSON.stringify(fetchOptions.body)
                     : fetchOptions.body,
               });

               clearTimeout(retryTimeoutId);

               if (retryResponse.ok) {
                  if (retryResponse.status === 204) return null as T;
                  return (await retryResponse.json()) as T;
               }

               if (!silentAuth) {
                  throw new ApiError(
                     "Retry failed after refresh",
                     retryResponse.status,
                  );
               }
            }

            if (silentAuth) {
               throw new ApiError("Not authenticated", 401);
            }

            throw new ApiError("Session expired", 401);
         }

         if (!response.ok) {
            let message = "Lỗi máy chủ";
            let errorData = null;

            try {
               errorData =
                  response.status === 204 ? null : await response.json();
               message = errorData?.message || message;
            } catch {}

            throw new ApiError(message, response.status, errorData);
         }

         if (response.status === 204) return null as T;

         return (await response.json()) as T;
      } catch (error: any) {
         clearTimeout(timeoutId);

         if (error.name === "AbortError") {
            throw new Error("Request quá thời gian, vui lòng thử lại");
         }
         if (error instanceof ApiError) throw error;
         if (error instanceof TypeError) {
            throw new Error("Không thể kết nối đến server");
         }
         throw error;
      }
   }

   async postSafe<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      },
   ): Promise<SafeResponse<T>> {
      try {
         const data = await this.request<T>(endpoint, {
            ...options,
            method: "POST",
            body,
         });
         return { success: true, data };
      } catch (error) {
         if (error instanceof ApiError) {
            return {
               success: false,
               error: {
                  message: error.message,
                  status: error.status,
                  data: error.data,
               },
            };
         }
         if (error instanceof Error) {
            return {
               success: false,
               error: { message: error.message, status: 500 },
            };
         }
         return {
            success: false,
            error: { message: "Đã xảy ra lỗi không xác định", status: 500 },
         };
      }
   }

   get<T>(
      endpoint: string,
      options?: {
         params?: any;
         noAuth?: boolean;
         noRedirectOn401?: boolean;
         silentAuth?: boolean;
         timeout?: number;
      },
   ) {
      return this.request<T>(endpoint, { ...options, method: "GET" });
   }

   post<T>(
      endpoint: string,
      body?: any,
      options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit },
   ) {
      return this.request<T>(endpoint, { ...options, method: "POST", body });
   }

   put<T>(
      endpoint: string,
      body?: any,
      options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit },
   ) {
      return this.request<T>(endpoint, { ...options, method: "PUT", body });
   }

   patch<T>(
      endpoint: string,
      body?: any,
      options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit },
   ) {
      return this.request<T>(endpoint, { ...options, method: "PATCH", body });
   }

   delete<T>(
      endpoint: string,
      options?: { noAuth?: boolean; timeout?: number; headers?: HeadersInit },
   ) {
      return this.request<T>(endpoint, { ...options, method: "DELETE" });
   }
}

const apiRequest = new ApiRequest();
export default apiRequest;
export { ApiError };
export type { SafeResponse };
