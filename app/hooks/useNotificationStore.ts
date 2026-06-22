"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import apiRequest from "@/lib/api";

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
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
  listEndpoint: string;
  markAllEndpoint: string;
  markOneEndpoint: (id: string) => string;
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
        }>(listEndpoint, { params: { page: pageNum, limit: pageSize } });

        if (!isMounted.current) return;

        const items = res.data ?? [];
        const newUnread = res.meta?.unreadCount ?? 0;

        setNotifications((prev) => {
          if (replace) {
            // Chỉ update nếu data thực sự thay đổi
            const same = prev.length === items.length && items.every((item, i) => prev[i]?.id === item.id && prev[i]?.isRead === item.isRead);
            return same ? prev : items; // ← giữ reference cũ nếu không đổi
          }
          return [...prev, ...items];
        });

        // Tương tự với unreadCount
        setUnreadCount((prev) => (prev === newUnread ? prev : newUnread));
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
    if (!enabled) return;

    const timeoutId = setTimeout(() => fetchPage(1, true), 0);
    const interval = setInterval(() => fetchPage(1, true), pollInterval);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(interval);
    };
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
    // Dùng functional update để không cần capture state vào deps
    let prevNotifications: NotificationItem[] = [];
    let prevCount = 0;

    setNotifications((prev) => {
      prevNotifications = prev;
      return prev.map((n) => ({ ...n, isRead: true }));
    });
    setUnreadCount((prev) => {
      prevCount = prev;
      return 0;
    });

    try {
      await apiRequest.patch(markAllEndpoint, {});
    } catch {
      setNotifications(prevNotifications);
      setUnreadCount(prevCount);
    }
  }, [markAllEndpoint]);

  return useMemo(
    () => ({
      notifications: enabled ? notifications : [],
      unreadCount: enabled ? unreadCount : 0,
      isLoading,
      hasMore: enabled ? hasMore : false,
      fetchNextPage,
      markAsRead,
      markAllAsRead,
      refresh,
    }),
    [enabled, notifications, unreadCount, isLoading, hasMore, fetchNextPage, markAsRead, markAllAsRead, refresh],
  );
}
