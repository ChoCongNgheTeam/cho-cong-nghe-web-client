"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // ✅ Khởi tạo state từ localStorage
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  // ✅ Chỉ sync DOM + localStorage (KHÔNG setState)
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => {
    setDark((prev) => !prev);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative w-14 h-8 rounded-full bg-gray-300 dark:bg-gray-700 transition-colors"
    >
      {/* Nút tròn */}
      <span
        className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${
          dark ? "translate-x-6" : ""
        }`}
      />

      {/* Icon */}
      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs">
        🌞
      </span>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs">
        🌙
      </span>
    </button>
  );
}
