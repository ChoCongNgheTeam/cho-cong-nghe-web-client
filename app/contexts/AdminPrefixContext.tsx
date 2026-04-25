"use client";

import { createContext, useContext } from "react";

const AdminPrefixContext = createContext<string>("/admin");

export function AdminPrefixProvider({ prefix, children }: { prefix: string; children: React.ReactNode }) {
  return <AdminPrefixContext.Provider value={prefix}>{children}</AdminPrefixContext.Provider>;
}

export function useAdminPrefix() {
  return useContext(AdminPrefixContext);
}
