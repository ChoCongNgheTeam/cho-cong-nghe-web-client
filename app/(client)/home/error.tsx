"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/shared/RouteError";
import { logError } from "@/lib/monitoring/log-error";

export default function HomeError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError("HomeError boundary caught error", error, { digest: error.digest });
  }, [error]);

  return <RouteError reset={reset} title="Không thể tải trang chủ" description="Đã có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại." />;
}
