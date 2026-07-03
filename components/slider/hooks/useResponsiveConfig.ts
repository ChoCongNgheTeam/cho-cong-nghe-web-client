"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ResponsiveBreakpoints, ResponsiveControls } from "../types";

interface UseResponsiveConfigParams {
  items: number | ResponsiveBreakpoints;
  controls: boolean | ResponsiveControls;
  controlsOffset: string;
}

const MOBILE_BREAKPOINT = 480;
const TABLET_BREAKPOINT = 768;
const LG_BREAKPOINT = 1024;
const ARROW_PROTRUSION = 20; // phần nút tự nhô ra ngoài mép khi offsetPx = 0
const SAFE_BUFFER = 4; // chừa thêm chút để không chạm sát viền màn hình

function resolveItemsCount(items: number | ResponsiveBreakpoints): number {
  if (typeof items === "number") return items;
  if (typeof window === "undefined") return items.desktop ?? 2;
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) return items.mobile ?? 1;
  if (width < TABLET_BREAKPOINT) return items.tablet ?? 2;
  if (width < LG_BREAKPOINT) return items.lg ?? 2;
  return items.desktop ?? 2;
}

function resolveShowControls(controls: boolean | ResponsiveControls): boolean {
  if (typeof controls === "boolean") return controls;
  if (typeof window === "undefined") return controls.desktop ?? true;
  const width = window.innerWidth;
  if (width < MOBILE_BREAKPOINT) return controls.mobile ?? false;
  if (width < TABLET_BREAKPOINT) return controls.tablet ?? false;
  if (width < LG_BREAKPOINT) return controls.lg ?? true;
  return controls.desktop ?? true;
}

/**
 * Tính offset an toàn cho 2 nút mũi tên — không cho nhô ra quá khoảng trống
 * thực tế 2 bên (tránh tràn ra ngoài viewport trên màn hình hẹp).
 */
function resolveSafeOffsetPx(arrowsWrapper: HTMLDivElement | null, controlsOffset: string): number {
  if (!arrowsWrapper) return 0;
  const desiredOffsetPx = controlsOffset !== "0" ? Math.abs(Number(controlsOffset.replace("-", ""))) : 0;
  if (desiredOffsetPx === 0) return 0;

  const rect = arrowsWrapper.getBoundingClientRect();
  const desiredProtrusion = desiredOffsetPx + ARROW_PROTRUSION;
  const spaceLeft = rect.left;
  const spaceRight = window.innerWidth - rect.right;
  const minSpace = Math.max(0, Math.min(spaceLeft, spaceRight) - SAFE_BUFFER);
  const safeProtrusion = Math.min(desiredProtrusion, minSpace);

  return Math.max(0, safeProtrusion - ARROW_PROTRUSION);
}

/**
 * Gộp toàn bộ giá trị phụ thuộc window.innerWidth (số item hiển thị, có
 * hiện controls không, có đang ở mobile không, offset an toàn của arrow)
 * vào 1 hook duy nhất — dùng chung 1 listener "resize" thay vì mỗi nơi tự
 * đăng ký riêng.
 */
export function useResponsiveConfig({ items, controls, controlsOffset }: UseResponsiveConfigParams) {
  const arrowsWrapperRef = useRef<HTMLDivElement>(null);

  const [itemsCount, setItemsCount] = useState(() => resolveItemsCount(items));
  const [showControls, setShowControls] = useState(() => resolveShowControls(controls));
  const [isMobile, setIsMobile] = useState(false);
  const [safeOffsetPx, setSafeOffsetPx] = useState(0);

  const recompute = useCallback(() => {
    setItemsCount((prev) => {
      const next = resolveItemsCount(items);
      return next !== prev ? next : prev;
    });
    setShowControls((prev) => {
      const next = resolveShowControls(controls);
      return next !== prev ? next : prev;
    });
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    setSafeOffsetPx(resolveSafeOffsetPx(arrowsWrapperRef.current, controlsOffset));
  }, [items, controls, controlsOffset]);

  useEffect(() => {
    // Cần gọi ngay lần đầu vì safeOffsetPx phải đo từ arrowsWrapperRef —
    // ref này chỉ có giá trị SAU khi DOM đã mount, không thể tính lúc render
    // như itemsCount/showControls/isMobile. Đây là 1 trong số ít trường hợp
    // hợp lệ để setState trong effect (đọc layout thật từ DOM), nên tắt rule
    // có chủ đích tại đây thay vì tái cấu trúc để né cảnh báo.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [recompute]);

  return { itemsCount, showControls, isMobile, safeOffsetPx, arrowsWrapperRef };
}
