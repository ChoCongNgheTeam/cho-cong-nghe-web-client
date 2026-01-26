"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import apiRequest, { tokenManager } from "@/lib/api";

interface User {
   id: string;
   email: string;
   userName: string;
   fullName: string;
   role: string;
   avatarImage?: string;
}

interface ApiResponse<T> {
   data: T;
   message?: string;
   success?: boolean;
}

interface AuthContextType {
   user: User | null;
   login: (userData: User, accessToken: string) => Promise<void>;
   logout: () => Promise<void>;
   loading: boolean;
   isAuthenticated: boolean;
   refreshUser: () => Promise<void>;
   showWelcome: boolean;
   setShowWelcome: (show: boolean) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(
   undefined,
);

export function AuthProvider({
   children,
   initialUser,
}: {
   children: ReactNode;
   initialUser?: User | null;
}) {
   const [user, setUser] = useState<User | null>(initialUser || null);
   const [showWelcome, setShowWelcome] = useState(true);
   const [loading, setLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      const checkAuth = async () => {
         try {
            // ✅ CHỈ GỌI 1 API DUY NHẤT
            // Backend middleware tự động:
            // - Kiểm tra accessToken
            // - Nếu hết hạn → dùng refreshToken (cookie) cấp token mới
            // - Trả token mới qua header "x-access-token"
            // - ApiRequest tự động lưu token mới vào memory
            const response = await apiRequest.get<ApiResponse<User>>(
               "/users/me",
               { noRedirectOn401: true },
            );

            if (response?.data) {
               setUser(response.data);
               console.log(
                  "[AuthContext] ✅ Authenticated:",
                  response.data.email,
               );
            }
         } catch (error: any) {
            if (error?.status === 401) {
               console.log("[AuthContext] ⚠️ No valid session");
            } else {
               console.error("[AuthContext] ❌ Error:", error.message);
            }
            setUser(null);
         } finally {
            setLoading(false);
         }
      };

      checkAuth();
   }, []);

   const refreshUser = async () => {
      try {
         const response = await apiRequest.get<ApiResponse<User>>("/users/me");
         if (response?.data) {
            setUser(response.data);
         }
      } catch (error) {
         console.error("[AuthContext] Failed to refresh user:", error);
         tokenManager.removeToken();
         setUser(null);
      }
   };

   const login = async (userData: User, accessToken: string) => {
      tokenManager.setToken(accessToken);
      setUser(userData);
      setShowWelcome(true);
      // Cart merge logic
      const localCartStr = localStorage.getItem("cart");
      let hasLocalCart = false;
      if (localCartStr) {
         try {
            const localCart = JSON.parse(localCartStr);
            hasLocalCart = localCart && localCart.length > 0;
         } catch (e) {
            hasLocalCart = false;
         }
      }

      if (hasLocalCart) {
         await new Promise((resolve) => {
            const handleMerge = () => {
               window.removeEventListener("cart-merged", handleMerge);
               resolve(true);
            };
            window.addEventListener("cart-merged", handleMerge);

            setTimeout(() => {
               window.removeEventListener("cart-merged", handleMerge);
               resolve(false);
            }, 5000);
         });
      } else {
         await new Promise((resolve) => setTimeout(resolve, 300));
      }

      const redirectPath = userData.role === "ADMIN" ? "/admin/dashboard" : "/";
      router.push(redirectPath);
      toast.success("Đăng nhập thành công");
   };

   const logout = async () => {
      try {
         await apiRequest.post(
            "/auth/logout",
            {},
            {
               noAuth: false,
               timeout: 5000,
            },
         );
      } catch (error: any) {
         console.error("[Logout] Error:", error);

         if (
            error.message?.includes("kết nối") ||
            error.message?.includes("timeout")
         ) {
            console.warn(
               "[Logout] Network error, proceeding with local logout",
            );
         }
      } finally {
         tokenManager.removeToken();
         setUser(null);
         localStorage.removeItem("cart");
         router.push("/account");
         toast.success("Đăng xuất thành công");
      }
   };

   return (
      <AuthContext.Provider
         value={{
            user,
            login,
            logout,
            loading,
            isAuthenticated: !!user,
            refreshUser,
            showWelcome,
            setShowWelcome,
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
