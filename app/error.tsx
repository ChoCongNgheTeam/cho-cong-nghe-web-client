"use client";

import { useEffect } from "react";
import { RouteError } from "@/components/shared/RouteError";
import { logError } from "@/lib/monitoring/log-error";

// Root error.tsx là lưới an toàn cuối cùng — chỉ bắt lỗi ở những route CHƯA có
// error.tsx riêng (vd. app/(client)/home/error.tsx). Trước khi thêm file này,
// một exception ngoài dự kiến ở bất kỳ route nào chưa có error.tsx segment sẽ
// khiến Next.js hiển thị trang lỗi mặc định (trắng/không style), không đúng
// định hướng "khai báo đầy đủ trạng thái Loading/Success/Error/Empty" của repo.
export default function GlobalRouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logError("Root error boundary caught error", error, { digest: error.digest });
  }, [error]);

  return <RouteError reset={reset} title="Đã có lỗi xảy ra" description="Vui lòng thử lại. Nếu lỗi tiếp diễn, hãy quay về trang chủ." />;
}
