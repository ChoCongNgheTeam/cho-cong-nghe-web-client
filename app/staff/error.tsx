"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/shared/RouteError";
import { logError } from "@/lib/monitoring/log-error";

export default function StaffError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError("Staff route error boundary caught error", error, { digest: error.digest });
  }, [error]);

  return (
    <RouteError reset={reset} title="Trang nhân viên gặp lỗi" description="Đã có lỗi xảy ra khi tải dữ liệu trang này. Vui lòng thử lại." />
  );
}
