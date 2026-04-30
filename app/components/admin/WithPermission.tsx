"use client";

import { PermissionKey, STAFF_ROLES } from "@/(client)/staff-permissions.types";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

interface Props {
  permission: PermissionKey;
  children: ReactNode;
  fallback?: ReactNode;
  redirect?: string; // nếu có → redirect thay vì render fallback
}

export function WithPermission({ permission, children, fallback = null, redirect }: Props) {
  const { user, loading } = useAuth();
  const router = useRouter();

  const hasPermission = !!user && (user.role === "ADMIN" || ((STAFF_ROLES as readonly string[]).includes(user.role) && user.permissions?.[permission] === true));

  useEffect(() => {
    if (!loading && !hasPermission && redirect) {
      router.replace(redirect);
    }
  }, [loading, hasPermission, redirect, router]);

  if (loading) return null;
  if (!hasPermission) return redirect ? null : <>{fallback}</>;
  return <>{children}</>;
}
