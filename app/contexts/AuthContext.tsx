"use client";
import { createContext, useState, useEffect, useRef, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import apiRequest, { performRefresh, resolveAuthInit, resetAuthInit, setAccessToken } from "@/lib/api";
import { StaffPermissions, UserRole } from "@/(client)/staff-permissions.types";

interface User {
  id: string;
  email: string;
  phone?: string;
  userName: string;
  fullName: string;
  role: UserRole;
  avatarImage?: string;
  gender?: string;
  dateOfBirth?: string;
  permissions?: StaffPermissions;
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [showWelcome, setShowWelcome] = useState(true);
  // loading=true cho đến khi checkAuth xong hoàn toàn
  const [loading, setLoading] = useState(!initialUser);
  const router = useRouter();
  const toast = useToasty();

  const authChecked = useRef(false);

  useEffect(() => {
    // StrictMode guard
    if (authChecked.current) return;
    authChecked.current = true;

    // Reset gate mỗi lần AuthProvider mount thật sự
    resetAuthInit();

    const checkAuth = async () => {
      try {
        const refreshed = await performRefresh();

        if (!refreshed) {
          setUser(null);
          resolveAuthInit();
          setLoading(false);
          return;
        }

        resolveAuthInit();

        try {
          const response = await apiRequest.get<ApiResponse<User>>("/users/me", {
            noRedirectOn401: true,
            timeout: 15000, // tăng lên 15s
          });
          if (response?.data) {
            setUser(response.data);
          } else {
            setUser(null);
          }
        } catch (meError: any) {
          console.error("[checkAuth] /users/me failed:", meError?.status, meError?.message);
          if (meError?.status === 401) {
            setUser(null);
          }
          // /users/me lỗi 401 → refresh token đã bị revoke → đây mới là logout thật
          if (meError?.status === 401) {
            setUser(null);
          }
          // Lỗi khác (500, network) → KHÔNG logout, giữ session
          // user vẫn null nhưng accessToken vẫn còn trong memory
        }
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const refreshUser = useCallback(async () => {
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
  }, []);

  // const login = async (userData: User, accessToken: string) => {
  //   setAccessToken(accessToken);
  //   setUser(userData);
  //   setShowWelcome(true);

  //   // Sync user mới nhất từ server (ảnh, role, v.v.)
  //   await refreshUser();

  //   // window.dispatchEvent(new Event("auth-login-success"));

  //   const redirectPath = userData.role === "ADMIN" ? "/admin/dashboard" : "/";

  //   toast.success("Đăng nhập thành công", {
  //     title: "Chào mừng trở lại!",
  //     duration: 3000,
  //     showProgress: true,
  //   });

  //   router.refresh();
  //   await new Promise((resolve) => setTimeout(resolve, 100));
  //   router.push(redirectPath);
  // };
  const login = async (userData: User, accessToken: string) => {
    setAccessToken(accessToken);
    setUser(userData); // isAuthenticated = true ngay
    setShowWelcome(true);
    // Không await refreshUser() ở đây nữa
    refreshUser(); // fire-and-forget, chạy nền
  };
  const logout = async () => {
    try {
      await apiRequest.post("/auth/logout", {}, { timeout: 5000 });
    } catch (error) {
      console.error("[Logout] ❌ Error:", error);
    } finally {
      setAccessToken(null);
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
