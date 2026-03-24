"use client";

import { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import apiRequest from "@/lib/api";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

interface NotificationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount: number;
}

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

const PAGE_SIZE = 15;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ── Core fetch ──────────────────────────────────────────────────────────────
  const fetchPage = useCallback(
    async (pageNum: number, replace = false) => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const res = await apiRequest.get<{
          data: NotificationItem[];
          meta: NotificationMeta;
        }>("/notifications", {
          params: { page: pageNum, limit: PAGE_SIZE },
        });

        if (!isMounted.current) return;

        const items = res.data ?? [];
        setNotifications((prev) => (replace ? items : [...prev, ...items]));
        setUnreadCount(res.meta?.unreadCount ?? 0);
        setHasMore(pageNum < (res.meta?.totalPages ?? 1));
        setPage(pageNum);
      } catch {
        // silent
      } finally {
        if (isMounted.current) setIsLoading(false);
      }
    },
    [isAuthenticated],
  );

  const refresh = useCallback(() => fetchPage(1, true), [fetchPage]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPage(page + 1, false);
  }, [hasMore, isLoading, page, fetchPage]);

  // ── Auto fetch + poll 30s ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    // Fetch ngay khi mount / login
    fetchPage(1, true);

    // Poll mỗi 30s để cập nhật badge realtime tạm thời
    const interval = setInterval(() => fetchPage(1, true), 30_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchPage]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const markAsRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await apiRequest.patch(`/notifications/${id}/read`, {});
    } catch {
      // Rollback nếu lỗi
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
      setUnreadCount((c) => c + 1);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    const prevNotifications = notifications;
    const prevCount = unreadCount;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiRequest.patch("/notifications/read-all", {});
    } catch {
      // Rollback
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  }, [notifications, unreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        hasMore,
        fetchNextPage,
        markAsRead,
        markAllAsRead,
        refresh,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationContext);
}
