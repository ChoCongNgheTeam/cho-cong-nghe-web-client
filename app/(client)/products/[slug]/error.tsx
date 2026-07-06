"use client";

import { useEffect } from "react";
import { logError } from "@/lib/monitoring/log-error";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    logError("ProductDetailPage: render error boundary triggered", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold text-primary">Không thể tải sản phẩm</h1>
      <p className="mb-6 text-neutral-darker">Có lỗi xảy ra trong quá trình tải dữ liệu.</p>
      <button onClick={reset} className="rounded-md border border-neutral-dark px-4 py-2 text-primary hover:bg-neutral transition-colors cursor-pointer">
        Thử lại
      </button>
    </div>
  );
}
