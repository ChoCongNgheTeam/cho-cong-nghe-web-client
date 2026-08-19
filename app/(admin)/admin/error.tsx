"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/shared/RouteError";
import { logError } from "@/lib/monitoring/log-error";

// Đặt ở app/(admin)/admin/ (không phải app/error.tsx) để khi 1 trang admin con
// throw lỗi, sidebar/header admin vẫn hiển thị bình thường — error.tsx chỉ thay
// thế phần <main>{children}</main> trong layout.tsx, không thay cả layout.
export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError("Admin route error boundary caught error", error, { digest: error.digest });
  }, [error]);

  return (
    <RouteError reset={reset} title="Trang quản trị gặp lỗi" description="Đã có lỗi xảy ra khi tải dữ liệu trang này. Vui lòng thử lại." />
  );
}
