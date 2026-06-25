"use client";
import { createContext, useState, useEffect, ReactNode, useCallback, useMemo } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
  mounted: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") === "dark" || (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    return false; // Mặc định cho phía Server
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Vì isDark đã chuẩn rồi, Effect bây giờ KHÔNG CẦN gọi setIsDark nữa
    // Chỉ bọc setMounted vào microtask để báo hiệu hệ thống đã sẵn sàng an toàn
    queueMicrotask(() => {
      setMounted(true);
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => {
      const newIsDark = !prev;
      const html = document.documentElement;
      if (newIsDark) {
        html.classList.add("dark");
        html.style.colorScheme = "dark";
        localStorage.setItem("theme", "dark");
      } else {
        html.classList.remove("dark");
        html.style.colorScheme = "light";
        localStorage.setItem("theme", "light");
      }
      return newIsDark;
    });
  }, []);

  const value = useMemo(() => ({ isDark, toggleTheme, mounted }), [isDark, toggleTheme, mounted]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
