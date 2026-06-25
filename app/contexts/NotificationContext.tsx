"use client";

import { createContext, useContext } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNotificationStore, NotificationItem } from "../hooks/useNotificationStore";

interface NotificationContextValue {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  hasMore: boolean;
  fetchNextPage: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refresh: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue>({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  hasMore: false,
  fetchNextPage: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refresh: async () => {},
});

const NOTIFICATION_ENDPOINTS = {
  list: "/notifications",
  markAll: "/notifications/read-all",
  markOne: (id: string) => `/notifications/${id}/read`,
};

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  const store = useNotificationStore({
    listEndpoint: NOTIFICATION_ENDPOINTS.list,
    markAllEndpoint: NOTIFICATION_ENDPOINTS.markAll,
    markOneEndpoint: NOTIFICATION_ENDPOINTS.markOne,
    enabled: isAuthenticated,
  });

  return <NotificationContext.Provider value={store}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  return useContext(NotificationContext);
}
