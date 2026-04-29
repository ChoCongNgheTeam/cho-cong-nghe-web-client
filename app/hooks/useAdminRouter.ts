"use client";

import { useRouter } from "next/navigation";
import { useAdminPrefix } from "@/contexts/AdminPrefixContext";
import { useCallback } from "react";

/**
 * Wrap useRouter + AdminPrefixContext.
 * Thay thế router.push("/admin/xxx") → adminRouter.push("/xxx")
 * Tự động prepend prefix (/admin hoặc /staff) theo context hiện tại.
 */
export function useAdminRouter() {
  const router = useRouter();
  const prefix = useAdminPrefix(); // "/admin" hoặc "/staff"

  const push = useCallback(
    (path: string) => {
      // path phải bắt đầu bằng "/" ví dụ "/promotions/new"
      router.push(`${prefix}${path}`);
    },
    [router, prefix],
  );

  const replace = useCallback(
    (path: string) => {
      router.replace(`${prefix}${path}`);
    },
    [router, prefix],
  );

  const back = useCallback(() => {
    router.back();
  }, [router]);

  return { push, replace, back, prefix };
}
