"use client";

import { useAdminPrefix } from "@/contexts/AdminPrefixContext";
import { useCallback } from "react";

/**
 * Dùng cho <Link href> thay vì hardcode "/admin/..."
 * const href = useAdminHref();
 * <Link href={href("/promotions/new")}>
 */
export function useAdminHref() {
  const prefix = useAdminPrefix();
  return useCallback((path: string) => `${prefix}${path}`, [prefix]);
}
