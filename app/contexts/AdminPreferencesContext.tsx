"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_ADMIN_LOCALE,
  DEFAULT_ADMIN_TIMEZONE,
} from "@/helpers";

export type AdminLocale = "vi-VN" | "en-US" | "ja-JP";
export type AdminTimeZone =
  | "Asia/Ho_Chi_Minh"
  | "Asia/Singapore"
  | "Asia/Tokyo";

interface AdminPreferencesContextType {
  locale: AdminLocale;
  timeZone: AdminTimeZone;
  setLocale: (value: AdminLocale) => void;
  setTimeZone: (value: AdminTimeZone) => void;
  mounted: boolean;
}

const AdminPreferencesContext =
  createContext<AdminPreferencesContextType | undefined>(undefined);

const sanitizeLocale = (value: string | null): AdminLocale => {
  if (value === "en-US" || value === "ja-JP" || value === "vi-VN") return value;
  return DEFAULT_ADMIN_LOCALE as AdminLocale;
};

const sanitizeTimeZone = (value: string | null): AdminTimeZone => {
  if (
    value === "Asia/Ho_Chi_Minh" ||
    value === "Asia/Singapore" ||
    value === "Asia/Tokyo"
  ) {
    return value;
  }
  return DEFAULT_ADMIN_TIMEZONE as AdminTimeZone;
};

export function AdminPreferencesProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocale] = useState<AdminLocale>(
    DEFAULT_ADMIN_LOCALE as AdminLocale,
  );
  const [timeZone, setTimeZone] = useState<AdminTimeZone>(
    DEFAULT_ADMIN_TIMEZONE as AdminTimeZone,
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const storedLocale = sanitizeLocale(
      localStorage.getItem("app.locale") || localStorage.getItem("admin.locale"),
    );
    const storedTimeZone = sanitizeTimeZone(
      localStorage.getItem("app.timeZone") ||
        localStorage.getItem("admin.timeZone"),
    );
    setLocale(storedLocale);
    setTimeZone(storedTimeZone);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("admin.locale", locale);
    localStorage.setItem("admin.timeZone", timeZone);
    localStorage.setItem("app.locale", locale);
    localStorage.setItem("app.timeZone", timeZone);

    const html = document.documentElement;
    html.dataset.adminLocale = locale;
    html.dataset.adminTimezone = timeZone;
    html.dataset.locale = locale;
    html.dataset.timezone = timeZone;
    html.lang = locale;
  }, [locale, timeZone, mounted]);

  useEffect(() => {
    return () => {
      const html = document.documentElement;
      delete html.dataset.adminLocale;
      delete html.dataset.adminTimezone;
      delete html.dataset.locale;
      delete html.dataset.timezone;
    };
  }, []);

  const value = useMemo(
    () => ({ locale, timeZone, setLocale, setTimeZone, mounted }),
    [locale, timeZone, mounted],
  );

  return (
    <AdminPreferencesContext.Provider value={value}>
      {children}
    </AdminPreferencesContext.Provider>
  );
}

export function useAdminPreferences() {
  const context = useContext(AdminPreferencesContext);
  if (!context) {
    throw new Error(
      "useAdminPreferences must be used within AdminPreferencesProvider",
    );
  }
  return context;
}
