"use client";
import { createContext, useState, useEffect, useRef, useCallback, ReactNode, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import apiRequest, { performRefresh, resolveAuthInit, resetAuthInit, setAccessToken } from "@/lib/api";
import { StaffPermissions, UserRole } from "@/types/staff-permissions.types";

interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

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
        } catch (meError: unknown) {
          const status = (meError as { status?: number })?.status;
          const message = (meError as { message?: string })?.message;
          console.error("[checkAuth] /users/me failed:", status, message);
          if (status === 401) {
            setUser(null);
          }
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

  const login = useCallback(
    async (userData: User, accessToken: string) => {
      setAccessToken(accessToken);
      setUser(userData);
      setShowWelcome(true);
      refreshUser();
    },
    [refreshUser],
  );

  const logout = useCallback(async () => {
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
  }, [router, toast]);

  return (
    <AuthContext.Provider
      value={useMemo(
        () => ({
          // ✅ thêm useMemo
          user,
          login,
          logout,
          loading,
          isAuthenticated: !!user,
          refreshUser,
          showWelcome,
          setShowWelcome,
        }),
        [user, loading, showWelcome, login, logout, refreshUser],
      )} // ← deps
    >
      {children}
    </AuthContext.Provider>
  );
}
