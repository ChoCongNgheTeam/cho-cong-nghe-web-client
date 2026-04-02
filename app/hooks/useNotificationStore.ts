"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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

interface UseNotificationStoreOptions {
  /** Endpoint lấy danh sách thông báo, vd: "/notifications" hoặc "/notifications/admin" */
  listEndpoint: string;
  /** Endpoint đánh dấu tất cả đã đọc, vd: "/notifications/read-all" hoặc "/notifications/admin/read-all" */
  markAllEndpoint: string;
  /** Endpoint đánh dấu 1 thông báo đã đọc — luôn là PATCH /notifications/:id/read */
  markOneEndpoint: (id: string) => string;
  /** Có fetch không (false khi chưa login) */
  enabled: boolean;
  pageSize?: number;
  pollInterval?: number;
}

export function useNotificationStore({ listEndpoint, markAllEndpoint, markOneEndpoint, enabled, pageSize = 15, pollInterval = 30_000 }: UseNotificationStoreOptions) {
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
      if (!enabled) return;
      setIsLoading(true);
      try {
        const res = await apiRequest.get<{
          data: NotificationItem[];
          meta: NotificationMeta;
        }>(listEndpoint, {
          params: { page: pageNum, limit: pageSize },
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
    [enabled, listEndpoint, pageSize],
  );

  const refresh = useCallback(() => fetchPage(1, true), [fetchPage]);

  const fetchNextPage = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPage(page + 1, false);
  }, [hasMore, isLoading, page, fetchPage]);

  // ── Auto fetch + poll ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!enabled) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchPage(1, true);
    const interval = setInterval(() => fetchPage(1, true), pollInterval);
    return () => clearInterval(interval);
  }, [enabled, fetchPage, pollInterval]);

  // ── Actions ─────────────────────────────────────────────────────────────────
  const markAsRead = useCallback(
    async (id: string) => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      setUnreadCount((c) => Math.max(0, c - 1));
      try {
        await apiRequest.patch(markOneEndpoint(id), {});
      } catch {
        setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: false } : n)));
        setUnreadCount((c) => c + 1);
      }
    },
    [markOneEndpoint],
  );

  const markAllAsRead = useCallback(async () => {
    const prevNotifications = notifications;
    const prevCount = unreadCount;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await apiRequest.patch(markAllEndpoint, {});
    } catch {
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  }, [markAllEndpoint, notifications, unreadCount]);

  return {
    notifications,
    unreadCount,
    isLoading,
    hasMore,
    fetchNextPage,
    markAsRead,
    markAllAsRead,
    refresh,
  };
}
