"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore, NotificationItem } from "../hooks/useNotificationStore";

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
  const isAdminOrStaff = isAuthenticated && (user?.role === "ADMIN" || user?.role === "STAFF");

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
