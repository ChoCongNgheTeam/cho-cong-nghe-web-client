"use client";

import { useMemo } from "react";
import { SidebarShell } from "./sidebar";
import { filterStaffNavGroups } from "./sidebar/staffNavGroups";
import { useAuth } from "../../hooks/useAuth";

export default function StaffSidebar() {
  const { user } = useAuth();

  const filteredGroups = useMemo(() => filterStaffNavGroups({ permissions: user?.permissions, role: user?.role }), [user?.permissions, user?.role]);

  const allHrefs = useMemo(() => new Set(filteredGroups.flatMap((g) => g.items.map((i) => i.href))), [filteredGroups]);

  return <SidebarShell navGroups={filteredGroups} allHrefs={allHrefs} homeHref="/staff/dashboard" />;
}
