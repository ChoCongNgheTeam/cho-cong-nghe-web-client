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
         silentAuth?: boolean; // ✅ THÊM FLAG MỚI
         timeout?: number;
      } = {},
   ): Promise<T> {
      const {
         noAuth = false,
         params,
         noRedirectOn401 = false,
         silentAuth = false, // ✅ Mặc định false
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
            credentials: "include",
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
         if (response.status === 401) {
            // ❌ CASE 1: Silent auth check (lần đầu load trang)
            // → Thử refresh token nhưng KHÔNG redirect nếu fail
            if (silentAuth) {
               console.log("[API] 🔍 Silent auth check - 401 received");

               try {
                  const refreshResponse = await fetch(
                     `${BASE_URL}/api/v1/auth/refresh`,
                     {
                        method: "POST",
                        credentials: "include",
                     },
                  );

                  if (refreshResponse.ok) {
                     console.log("[API] 🔄 Token refreshed (silent mode)");
                     await new Promise((resolve) => setTimeout(resolve, 100));

                     // ✅ Retry request gốc
                     const retryController = new AbortController();
                     const retryTimeoutId = setTimeout(
                        () => retryController.abort(),
                        timeout,
                     );

                     const retryResponse = await fetch(url, {
                        ...fetchOptions,
                        signal: retryController.signal,
                        credentials: "include",
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
                  }
               } catch (refreshError) {
                  console.log(
                     "[API] ⚠️ Silent refresh failed - User not logged in",
                  );
               }

               // ❌ Không redirect, chỉ throw error
               throw new ApiError("Not authenticated", 401);
            }

            // ❌ CASE 2: noRedirectOn401 = true
            // → Không làm gì cả, chỉ throw error
            if (noRedirectOn401) {
               console.log("[API] ⚠️ 401 with noRedirectOn401 flag");
               throw new ApiError("Unauthorized", 401);
            }

            // ✅ CASE 3: User action bị 401 (normal flow)
            // → Thử refresh, nếu fail thì redirect login
            console.log("[API] ⚠️ 401 - Trying to refresh token...");

            try {
               const refreshResponse = await fetch(
                  `${BASE_URL}/api/v1/auth/refresh`,
                  {
                     method: "POST",
                     credentials: "include",
                  },
               );

               if (refreshResponse.ok) {
                  console.log("[API] 🔄 Token refreshed successfully");
                  await new Promise((resolve) => setTimeout(resolve, 100));

                  // ✅ Retry request gốc
                  const retryController = new AbortController();
                  const retryTimeoutId = setTimeout(
                     () => retryController.abort(),
                     timeout,
                  );

                  const retryResponse = await fetch(url, {
                     ...fetchOptions,
                     signal: retryController.signal,
                     credentials: "include",
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

                  console.error("[API] ❌ Retry failed after refresh");
                  throw new ApiError(
                     "Retry failed after refresh",
                     retryResponse.status,
                  );
               }

               console.error(
                  "[API] ❌ Refresh failed with status:",
                  refreshResponse.status,
               );
            } catch (refreshError) {
               console.error("[API] ❌ Refresh error:", refreshError);
            }

            // ❌ Redirect login nếu refresh thất bại
            if (typeof window !== "undefined") {
               console.log("[API] 🔄 Redirecting to login...");
               window.location.href = "/account/login?expired=1";
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
         silentAuth?: boolean; // ✅ THÊM VÀO TYPE
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
