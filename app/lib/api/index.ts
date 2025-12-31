/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");
const TOKEN_KEY = "access_token";
export const tokenManager = {
   getToken: (): string | null => {
      if (typeof window === "undefined") return null;
      return localStorage.getItem(TOKEN_KEY);
   },

   setToken: (token: string): void => {
      if (typeof window === "undefined") return;
      localStorage.setItem(TOKEN_KEY, token);
   },

   removeToken: (): void => {
      if (typeof window === "undefined") return;
      localStorage.removeItem(TOKEN_KEY);
   },
};

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
         noAuth?: boolean; // dùng cho API public (login, register)
         params?: Record<string, any>; // query params
         noRedirectOn401?: boolean; // tắt redirect khi 401
         timeout?: number; // timeout (ms)
      } = {}
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
         if (queryString) {
            url += `?${queryString}`;
         }
      }

      // Timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      // Kiểm tra loại body
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

         if (response.status === 401) {
            tokenManager.removeToken();

            if (!noRedirectOn401 && typeof window !== "undefined") {
               window.location.href = "/login?expired=1";
            }
            throw new ApiError("Unauthorized", 401);
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

   // GET request
   get<T>(
      endpoint: string,
      options?: {
         params?: any;
         noAuth?: boolean;
         noRedirectOn401?: boolean;
         timeout?: number;
      }
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "GET",
      });
   }

   // POST request
   post<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      }
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "POST",
         body,
      });
   }

   // PUT request
   put<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      }
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "PUT",
         body,
      });
   }

   // PATCH request
   patch<T>(
      endpoint: string,
      body?: any,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      }
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "PATCH",
         body,
      });
   }

   // DELETE request
   delete<T>(
      endpoint: string,
      options?: {
         noAuth?: boolean;
         timeout?: number;
         headers?: HeadersInit;
      }
   ) {
      return this.request<T>(endpoint, {
         ...options,
         method: "DELETE",
      });
   }
}

const apiRequest = new ApiRequest();
export default apiRequest;

// Export ApiError để có thể catch và xử lý
export { ApiError };
