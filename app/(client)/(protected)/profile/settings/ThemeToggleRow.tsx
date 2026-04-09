"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggleRow() {
  const { isDark, toggleTheme, mounted } = useTheme();
  if (!mounted) return null;

  const Icon = isDark ? Sun : Moon;

  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 bg-neutral-light border-t sm:border-t-0 border-neutral">
      {/* LEFT: icon + text */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="p-2 bg-accent-light rounded-lg shrink-0">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
        </div>

        <div>
          <p className="text-sm sm:text-base font-medium text-primary">Giao diện</p>
          <p className="text-xs sm:text-sm text-neutral-dark">{isDark ? "Chế độ tối" : "Chế độ sáng"}</p>
        </div>
      </div>

      {/* RIGHT: switch */}
      <button onClick={toggleTheme} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isDark ? "bg-accent" : "bg-neutral"}`}>
        <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${isDark ? "translate-x-5" : "translate-x-1"}`} />
      </button>
    </div>
  );
}
