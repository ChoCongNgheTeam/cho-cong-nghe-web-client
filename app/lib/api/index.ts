const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "");

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

      try {
         const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal,
            credentials: "include", // ✅ GỬI COOKIE
            headers: {
               ...(isJsonBody ? { "Content-Type": "application/json" } : {}),
               ...fetchOptions.headers,
            },
            body: isJsonBody
               ? JSON.stringify(fetchOptions.body)
               : fetchOptions.body,
         });

         clearTimeout(timeoutId);

         // ✅ XỬ LÝ 401 - Access token expired
         if (response.status === 401 && !noRedirectOn401) {
            console.log("[API] ⚠️ 401 - Trying to refresh token...");

            try {
               const refreshResponse = await fetch(
                  `${BASE_URL}/api/v1/auth/refresh`,
                  {
                     method: "POST",
                     credentials: "include", // ✅ Gửi refreshToken cookie
                  },
               );

               if (refreshResponse.ok) {
                  console.log("[API] 🔄 Token refreshed successfully");

                  // ✅ QUAN TRỌNG: Đợi một chút để browser cập nhật cookie
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  // ✅ Retry request gốc với cookie mới
                  const retryController = new AbortController();
                  const retryTimeoutId = setTimeout(
                     () => retryController.abort(),
                     timeout,
                  );

                  const retryResponse = await fetch(url, {
                     ...fetchOptions,
                     signal: retryController.signal,
                     credentials: "include", // ✅ Browser sẽ gửi cookie mới
                     headers: {
                        ...(isJsonBody
                           ? { "Content-Type": "application/json" }
                           : {}),
                        ...fetchOptions.headers,
                     },
                     body: isJsonBody
                        ? JSON.stringify(fetchOptions.body)
                        : fetchOptions.body,
                  });

                  clearTimeout(retryTimeoutId);

                  if (retryResponse.ok) {
                     if (retryResponse.status === 204) {
                        return null as T;
                     }
                     return (await retryResponse.json()) as T;
                  }

                  // Retry vẫn thất bại
                  console.error("[API] ❌ Retry failed after refresh");
                  throw new ApiError(
                     "Retry failed after refresh",
                     retryResponse.status,
                  );
               }

               // Refresh thất bại
               console.error(
                  "[API] ❌ Refresh failed with status:",
                  refreshResponse.status,
               );
            } catch (refreshError) {
               console.error("[API] ❌ Refresh error:", refreshError);
            }

            // ❌ Redirect login nếu refresh thất bại
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
