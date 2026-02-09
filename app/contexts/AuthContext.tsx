"use client";
import { createContext, useState, useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import apiRequest from "@/lib/api";

interface User {
   id: string;
   email: string;
   phone: string;
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
               console.error("[AuthContext] ❌ Error:", errorMessage);
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
      console.log("[AuthContext] User logged in:", userData.userName);

      // Cart merge logic
      if (hasLocalCart()) {
         await waitForCartMerge();
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

         toast.success("Đăng xuất thành công");

         setTimeout(() => {
            window.location.href = "/account";
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

/**
 * ### **🔍 Case 1: Chưa đăng nhập (lần đầu vào trang)**
```
1. AuthContext mount → gọi GET /users/me với silentAuth: true
2. Backend trả 401 (không có token)
3. api.ts thấy silentAuth = true → thử refresh token
4. Refresh fail (không có refreshToken cookie)
5. ❌ KHÔNG redirect → chỉ throw error
6. AuthContext catch error → setUser(null) → setLoading(false)
7. ✅ User thấy trang bình thường, không bị redirect
```

### **✅ Case 2: Đã đăng nhập, accessToken còn hạn**
```
1. AuthContext mount → gọi GET /users/me với silentAuth: true
2. Backend trả 200 + user data
3. setUser(userData) → User vào trang bình thường
```

### **🔄 Case 3: Đã đăng nhập, accessToken hết hạn**
```
1. AuthContext mount → gọi GET /users/me với silentAuth: true
2. Backend trả 401 (accessToken expired)
3. api.ts thấy silentAuth = true → thử refresh token
4. Refresh success → accessToken mới được set vào cookie
5. Retry GET /users/me → trả 200 + user data
6. ✅ setUser(userData) → User vào trang bình thường
```

### **❌ Case 4: Đã đăng nhập, CẢ 2 token đều hết hạn**
```
1. AuthContext mount → gọi GET /users/me với silentAuth: true
2. Backend trả 401 (accessToken expired)
3. api.ts thử refresh token → Refresh fail (refreshToken expired)
4. ❌ KHÔNG redirect (vì silentAuth = true)
5. setUser(null) → User bị logout nhưng vẫn ở trang hiện tại
```

### **🔒 Case 5: User đang browse trang, token hết hạn giữa chừng**
```
1. User click nút "Thêm vào giỏ" → gọi POST /cart
2. Backend trả 401 (token expired)
3. api.ts KHÔNG có silentAuth → Chạy normal flow
4. Thử refresh token → Nếu success: retry request
5. Nếu fail: redirect /login?expired=1
 */
