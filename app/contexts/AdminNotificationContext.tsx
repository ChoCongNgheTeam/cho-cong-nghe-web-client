"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore, NotificationItem } from "../hooks/useNotificationStore";
import { UserRole } from "@/(client)/staff-permissions.types";

interface AdminNotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AdminNotificationContext = createContext<AdminNotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  fetchNextPage: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refresh: async () => {},
});

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // Chỉ fetch nếu đang là ADMIN hoặc STAFF
  const role = user?.role;

  const isAdminOrStaff = isAuthenticated && (role === "ADMIN" || (!!role && (["SALES", "MARKETING", "SUPPORT", "ACCOUNTING"] as const).includes(role as any)));

  const store = useNotificationStore({
    listEndpoint: "/notifications/admin",
    markAllEndpoint: "/notifications/admin/read-all",
    markOneEndpoint: (id) => `/notifications/${id}/read`,
    enabled: isAdminOrStaff,
    // Poll nhanh hơn cho admin vì cần biết đơn/comment mới ngay
    pollInterval: 15_000,
  });

  return <AdminNotificationContext.Provider value={store}>{children}</AdminNotificationContext.Provider>;
}

export function useAdminNotifications() {
  return useContext(AdminNotificationContext);
}
