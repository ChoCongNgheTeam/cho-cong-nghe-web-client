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
   avatar?: string;
}

interface ApiResponse<T> {
   data: T;
   message?: string;
   success?: boolean;
}
interface AuthContextType {
   user: User | null;
   login: (userData: User) => Promise<void>;
   logout: () => void;
   loading: boolean;
   isAuthenticated: boolean;
   refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
   undefined
);

export function AuthProvider({
   children,
   initialUser,
}: {
   children: ReactNode;
   initialUser?: User | null;
}) {
   const [user, setUser] = useState<User | null>(initialUser || null);
   const [loading, setLoading] = useState(true);
   const router = useRouter();

   useEffect(() => {
      const checkAuth = async () => {
         const token = tokenManager.getToken();

         if (!token) {
            setUser(null);
            setLoading(false);
            return;
         }

         if (initialUser) {
            setUser(initialUser);
            setLoading(false);
            return;
         }

         try {
            const response = await apiRequest.get<ApiResponse<User>>(
               "/users/me",
               {
                  noRedirectOn401: true,
               }
            );

            if (response?.data) {
               setUser(response.data);
            }
         } catch (error) {
            console.log("[AuthContext] No valid session");
            tokenManager.removeToken();
            setUser(null);
         } finally {
            setLoading(false);
         }
      };

      checkAuth();
   }, [initialUser]);

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

   const login = async (userData: User) => {
      setUser(userData);
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
         // Wait for cart merge event
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
      tokenManager.removeToken();
      setUser(null);
      router.push("/account");
      toast.success("Đăng xuất thành công");
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
         }}
      >
         {children}
      </AuthContext.Provider>
   );
}
