const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

class TokenManager {
   private accessToken: string | null = null;

   getToken(): string | null {
      return this.accessToken;
   }

   setToken(token: string): void {
      this.accessToken = token;
   }

   removeToken(): void {
      this.accessToken = null;
   }
}

export const tokenManager = new TokenManager();

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

class ApiRequest {
   private async request<T>(
      endpoint: string,
      options: RequestInit & {
         noAuth?: boolean;
         params?: Record<string, any>;
         noRedirectOn401?: boolean;
         timeout?: number;
      } = {},
   ): Promise<T> {
      const {
         noAuth = false,
         params,
         noRedirectOn401 = false,
         timeout = 15000,
         ...fetchOptions
      } = options;

      if (!BASE_URL) {
         throw new Error("NEXT_PUBLIC_API_BASE_URL chưa được cấu hình");
      }

      // Tạo URL với query params
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

      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const isFormData = fetchOptions.body instanceof FormData;
      const isJsonBody =
         fetchOptions.body &&
         typeof fetchOptions.body === "object" &&
         !isFormData;

      const token = !noAuth ? tokenManager.getToken() : null;

      try {
         const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            credentials: "include", // ✅ GỬI COOKIE (refreshToken)
            headers: {
               ...(token ? { Authorization: `Bearer ${token}` } : {}),
               ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
               ...fetchOptions.headers,
            },
            body: isJsonBody
               ? JSON.stringify(fetchOptions.body)
               : fetchOptions.body,
         });

         clearTimeout(timeoutId);

         // ✅ SILENT REFRESH: Kiểm tra header "x-access-token"
         const newAccessToken = response.headers.get("x-access-token");
         if (newAccessToken) {
            console.log("[API] 🔄 Token auto-refreshed by backend");
            tokenManager.setToken(newAccessToken);
         }

         // ✅ XỬ LÝ 401
         if (response.status === 401 && !noRedirectOn401) {
            tokenManager.removeToken();

            if (typeof window !== "undefined") {
               window.location.href = "/login?expired=1";
            }
            throw new ApiError("Session expired", 401);
         }

         // ✅ XỬ LÝ LỖI KHÁC
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

         // ✅ TRẢ DATA
         if (response.status === 204) {
            return null as T;
         }

         return (await response.json()) as T;
      } catch (error: any) {
         clearTimeout(timeoutId);

         if (error.name === "AbortError") {
            throw new Error("Request quá thời gian, vui lòng thử lại");
         }

         if (error instanceof ApiError) {
            throw error;
         }

         if (error instanceof TypeError) {
            throw new Error("Không thể kết nối đến server");
         }

         throw error;
      }
   }

   get<T>(
      endpoint: string,
      options?: {
         params?: any;
         noAuth?: boolean;
         noRedirectOn401?: boolean;
         timeout?: number;
      },
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "GET",
      });
   }

   post<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      },
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "POST",
         body,
      });
   }

   put<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      },
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "PUT",
         body,
      });
   }

   patch<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      },
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "PATCH",
         body,
      });
   }

   delete<T>(
      endpoint: string,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      },
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "DELETE",
      });
   }
}

const apiRequest = new ApiRequest();
export default apiRequest;
export { ApiError };
