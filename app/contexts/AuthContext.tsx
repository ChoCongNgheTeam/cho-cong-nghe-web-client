"use client";
import { createContext, useState, useEffect, useRef, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import apiRequest, {
   performRefresh,
   resolveAuthInit,
   resetAuthInit,
   setAccessToken,
} from "@/lib/api";

interface User {
   id: string;
   email: string;
   phone?: string;
   userName: string;
   fullName: string;
   role: string;
   avatarImage?: string;
   gender?: string;
   dateOfBirth?: string;
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

interface LocalCart {
   items: unknown[];
}

export const AuthContext = createContext<AuthContextType | undefined>(
   undefined,
);

interface AuthProviderProps {
   children: ReactNode;
   initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
   const [user, setUser] = useState<User | null>(initialUser || null);
   const [showWelcome, setShowWelcome] = useState(true);
   const [loading, setLoading] = useState(true);
   const router = useRouter();
   const toast = useToasty();

   // Guard chống React StrictMode double-invoke useEffect trong development
   // Đảm bảo checkAuth chỉ chạy đúng 1 lần dù useEffect bị gọi 2 lần
   const authChecked = useRef(false);

   useEffect(() => {
      // StrictMode fix: bỏ qua lần chạy thứ 2
      if (authChecked.current) return;
      authChecked.current = true;

      // Reset auth init gate để tránh trạng thái cũ từ HMR/StrictMode
      // Nếu không reset: _authInitialized=true từ lần trước khiến các request
      // gửi đi ngay mà không chờ, dẫn đến 401 dù cookie vẫn còn hạn
      resetAuthInit();

      const checkAuth = async () => {
         try {
            // Reload page → thử refresh để lấy access token mới từ httpOnly cookie
            const refreshed = await performRefresh();

            if (!refreshed) {
               console.log("[AuthContext] ⚠️ Không có session hợp lệ");
               setUser(null);
               return;
            }

            // Có access token rồi, lấy thông tin user
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
         } catch {
            setUser(null);
         } finally {
            setLoading(false);
            // Báo cho tất cả request đang chờ biết auth đã init xong
            // Dù success hay fail, các request cần tiếp tục (với hoặc không có token)
            resolveAuthInit();
         }
      };

      checkAuth();
   }, []);

   const refreshUser = async () => {
      try {
         const response = await apiRequest.get<ApiResponse<User>>("/users/me", {
            noRedirectOn401: true,
         });
         if (response?.data) {
            setUser(response.data);
         }
      } catch {
         setUser(null);
      }
   };

   const hasLocalCart = (): boolean => {
      const localCartStr = localStorage.getItem("cart");
      if (!localCartStr) return false;
      try {
         const localCart = JSON.parse(localCartStr) as LocalCart;
         return Boolean(localCart?.items?.length > 0);
      } catch {
         return false;
      }
   };

   const waitForCartMerge = (): Promise<boolean> => {
      return new Promise((resolve) => {
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
   };

   // Trong hàm login, sau setUser:
   // Trong hàm login, sau setUser:
   const login = async (userData: User, accessToken: string) => {
      setAccessToken(accessToken);
      setUser(userData);
      setShowWelcome(true);

      await refreshUser();

      // Dispatch event để CartContext biết cần sync
      window.dispatchEvent(new Event("auth-login-success"));

      const redirectPath = userData.role === "ADMIN" ? "/admin/dashboard" : "/";

      toast.success("Đăng nhập thành công", {
         title: "Chào mừng trở lại!",
         duration: 3000,
         showProgress: true,
      });

      router.refresh();
      await new Promise((resolve) => setTimeout(resolve, 100));
      router.push(redirectPath);
   };

   const logout = async () => {
      try {
         await apiRequest.post("/auth/logout", {}, { timeout: 5000 });
         console.log("[Logout] ✅ Backend logout successful");
      } catch (error) {
         console.error("[Logout] ❌ Error:", error);
      } finally {
         setAccessToken(null); // xóa access token khỏi memory
         setUser(null);
         localStorage.removeItem("cart");

         toast.success("Đăng xuất thành công", {
            title: "Hẹn gặp lại!",
            duration: 5000,
            showProgress: true,
         });

         setTimeout(() => {
            router.replace("/account?login");
         }, 500);
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
