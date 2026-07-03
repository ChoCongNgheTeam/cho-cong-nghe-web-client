"use client";

import { createContext, useContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNotificationStore, NotificationItem } from "../hooks/useNotificationStore";
import { STAFF_ROLES } from "@/types/staff-permissions.types";

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

const ADMIN_NOTIFICATION_ENDPOINTS = {
  list: "/notifications/admin",
  markAll: "/notifications/admin/read-all",
  markOne: (id: string) => `/notifications/${id}/read`,
};

export function AdminNotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role;

  // Chỉ fetch nếu đang là ADMIN hoặc STAFF
  const isAdminOrStaff = isAuthenticated && !!role && (role === "ADMIN" || (STAFF_ROLES as readonly string[]).includes(role));

  const store = useNotificationStore({
    listEndpoint: ADMIN_NOTIFICATION_ENDPOINTS.list,
    markAllEndpoint: ADMIN_NOTIFICATION_ENDPOINTS.markAll,
    markOneEndpoint: ADMIN_NOTIFICATION_ENDPOINTS.markOne,
    enabled: isAdminOrStaff,
    // Poll nhanh hơn cho admin vì cần biết đơn/comment mới ngay
    pollInterval: 15_000,
  });

  return <AdminNotificationContext.Provider value={store}>{children}</AdminNotificationContext.Provider>;
}

export function useAdminNotifications() {
  return useContext(AdminNotificationContext);
}
