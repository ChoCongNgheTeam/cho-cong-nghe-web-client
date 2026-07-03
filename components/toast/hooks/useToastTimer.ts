"use client";

import { useCallback, useEffect, useRef } from "react";

interface UseToastTimerParams {
  duration: number;
  isLoading: boolean;
  pauseOnHover: boolean;
  onExpire: () => void;
}

/**
 * Quản lý progress bar + auto-dismiss của 1 toast bằng DUY NHẤT 1 nguồn timer.
 * Progress cập nhật trực tiếp qua DOM ref (không setState) nên không kéo theo
 * re-render component cha 60 lần/giây. pause()/resume() gọi thẳng hàm — không
 * đi qua state — nên không còn 2 hệ thống tranh nhau quản lý timer như bản gốc.
 */
export function useToastTimer({ duration, isLoading, pauseOnHover, onExpire }: UseToastTimerParams) {
  const progressBarRef = useRef<HTMLDivElement>(null);
  const remainingRef = useRef(duration);
  const startedAtRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  const isActive = duration > 0 && !isLoading;

  const clearTimers = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    if (timeoutRef.current !== null) clearTimeout(timeoutRef.current);
    rafRef.current = null;
    timeoutRef.current = null;
  }, []);

  const setProgressWidth = useCallback((percent: number) => {
    if (progressBarRef.current) progressBarRef.current.style.width = `${percent}%`;
  }, []);

  const start = useCallback(() => {
    if (!isActive) return;
    clearTimers();
    startedAtRef.current = Date.now();
    const total = remainingRef.current;

    const tick = () => {
      const elapsed = Date.now() - startedAtRef.current;
      const remaining = Math.max(0, total - elapsed);
      setProgressWidth((remaining / total) * 100);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    timeoutRef.current = setTimeout(() => {
      onExpireRef.current();
    }, total);
  }, [isActive, clearTimers, setProgressWidth]);

  const pause = useCallback(() => {
    if (!pauseOnHover || !isActive) return;
    const elapsed = Date.now() - startedAtRef.current;
    remainingRef.current = Math.max(0, remainingRef.current - elapsed);
    clearTimers();
  }, [pauseOnHover, isActive, clearTimers]);

  const resume = useCallback(() => {
    if (!pauseOnHover || !isActive) return;
    start();
  }, [pauseOnHover, isActive, start]);

  // Khởi động lại toàn bộ khi duration/loại toast đổi (ví dụ update() đổi type)
  useEffect(() => {
    remainingRef.current = duration;
    setProgressWidth(100);
    start();
    return clearTimers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [duration, isLoading]);

  return { progressBarRef, pause, resume };
}
