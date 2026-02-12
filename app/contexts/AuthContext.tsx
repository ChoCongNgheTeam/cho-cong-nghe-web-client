"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { flushSync } from "react-dom";

// In your AuthContext file
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
   login: (userData: User) => Promise<void>;
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

   useEffect(() => {
      const checkAuth = async () => {
         try {
            const response = await apiRequest.get<ApiResponse<User>>(
               "/users/me",
               { silentAuth: true },
            );
            if (response?.data) {
               setUser(response.data);
               console.log(
                  "[AuthContext] ✅ Authenticated:",
                  response.data.email,
               );
            }
         } catch (error) {
            if (
               error instanceof Error &&
               "status" in error &&
               error.status === 401
            ) {
               console.log("[AuthContext] ⚠️ User not logged in");
            } else {
               const errorMessage =
                  error instanceof Error ? error.message : "Unknown error";
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
         setUser(null);
      }
   };

   const hasLocalCart = (): boolean => {
      const localCartStr = localStorage.getItem("cart");
      if (!localCartStr) return false;

      try {
         const localCart = JSON.parse(localCartStr) as LocalCart;
         return Boolean(
            localCart && localCart.items && localCart.items.length > 0,
         );
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

   const login = async (userData: User) => {
      setUser(userData);
      setShowWelcome(true);
      await new Promise((resolve) => {
         // Use requestAnimationFrame để đảm bảo DOM đã update
         requestAnimationFrame(() => {
            requestAnimationFrame(() => {
               resolve(true);
            });
         });
      });
      await refreshUser();
      if (hasLocalCart()) {
         await waitForCartMerge();
      }
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
         await apiRequest.post(
            "/auth/logout",
            {},
            {
               noAuth: false,
               timeout: 5000,
            },
         );
         console.log("[Logout] ✅ Backend logout successful");
      } catch (error) {
         const errorMessage = error instanceof Error ? error.message : "";
         console.error("[Logout] ❌ Error:", error);

         if (
            errorMessage.includes("kết nối") ||
            errorMessage.includes("timeout")
         ) {
            console.warn(
               "[Logout] Network error, proceeding with local logout",
            );
         } else {
            console.warn("[Logout] Server error, forcing local logout");
         }
      } finally {
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
