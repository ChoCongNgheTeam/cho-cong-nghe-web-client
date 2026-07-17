"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchCategoryChildren } from "@/lib/api/header/header.api";
import { Category } from "@/types/category";

interface UseCategoryHoverOptions {
  hideDelayMs?: number;
}

export function useCategoryHover(options?: UseCategoryHoverOptions) {
  const hideDelayMs = options?.hideDelayMs ?? 120;

  const [hoveredCategory, setHoveredCategory] = useState<Category | null>(null);
  const [childrenCache, setChildrenCache] = useState<Record<string, Category[]>>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearHideTimer = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
  }, []);

  const scheduleHide = useCallback(() => {
    clearHideTimer();
    hideTimerRef.current = setTimeout(() => setHoveredCategory(null), hideDelayMs);
  }, [clearHideTimer, hideDelayMs]);

  // Dọn timer khi unmount để tránh setState trên component đã unmount
  useEffect(() => {
    return () => clearHideTimer();
  }, [clearHideTimer]);

  const handleHover = useCallback(
    async (cat: Category) => {
      clearHideTimer();
      setHoveredCategory(cat);
      if (childrenCache[cat.id] !== undefined) return;
      if (!cat._count?.children) return;
      setLoadingId(cat.id);
      try {
        const children = await fetchCategoryChildren(cat.id);
        setChildrenCache((prev) => ({ ...prev, [cat.id]: children }));
      } catch (error) {
        console.error("Failed to load category children:", error);
        // có thể setChildrenCache với [] để tránh gọi lại liên tục, tuỳ ý
      } finally {
        setLoadingId(null);
      }
    },
    [childrenCache, clearHideTimer],
  );

  const reset = useCallback(() => {
    clearHideTimer();
    setHoveredCategory(null);
  }, [clearHideTimer]);

  const activeChildren = hoveredCategory ? (childrenCache[hoveredCategory.id] ?? []) : [];

  // Số cột theo số children
  const colCount = activeChildren.length <= 2 ? 2 : activeChildren.length <= 3 ? 3 : activeChildren.length <= 4 ? 4 : activeChildren.length <= 6 ? 3 : 4;

  return {
    hoveredCategory,
    activeChildren,
    colCount,
    isLoading: loadingId !== null && loadingId === hoveredCategory?.id,
    handleHover,
    clearHideTimer,
    scheduleHide,
    reset,
  };
}
