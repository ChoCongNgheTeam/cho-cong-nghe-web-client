"use client";

import { PermissionKey, STAFF_ROLES } from "@/(client)/staff-permissions.types";
import { useAuth } from "@/hooks/useAuth";
import type { ReactNode } from "react";

interface Props {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export function WithPermission({ permission, children, fallback = null }: Props) {
  const { user } = useAuth();
  if (!user) return <>{fallback}</>;

  // ADMIN luôn pass
  if (user.role === "ADMIN") return <>{children}</>;

  // Không phải staff role → chặn
  if (!(STAFF_ROLES as readonly string[]).includes(user.role)) return <>{fallback}</>;

  // Có permissions object và permission được bật
  if (user.permissions?.[permission]) return <>{children}</>;

  return <>{fallback}</>;
}
