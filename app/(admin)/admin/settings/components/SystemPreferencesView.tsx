"use client";

import { Globe, Moon, Palette, SlidersHorizontal, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { useAdminPreferences } from "@/contexts/AdminPreferencesContext";

const LOCALE_OPTIONS = [
  { value: "vi-VN", label: "Tiếng Việt" },
  { value: "en-US", label: "English" },
  { value: "ja-JP", label: "日本語" },
] as const;

const TIMEZONE_OPTIONS = [
  { value: "Asia/Ho_Chi_Minh", label: "GMT+07:00 (Asia/Ho_Chi_Minh)" },
  { value: "Asia/Singapore", label: "GMT+08:00 (Asia/Singapore)" },
  { value: "Asia/Tokyo", label: "GMT+09:00 (Asia/Tokyo)" },
] as const;

export default function SystemPreferencesView() {
  const { isDark, toggleTheme, mounted: themeMounted } = useTheme();
  const {
    locale,
    timeZone,
    setLocale,
    setTimeZone,
    mounted: preferencesMounted,
  } = useAdminPreferences();

  const mounted = themeMounted && preferencesMounted;

  const themeCards = [
    {
      key: "light",
      label: "Sáng",
      description: "Giao diện nền sáng",
      icon: Sun,
      active: mounted ? !isDark : true,
      disabled: !mounted,
      onClick: () => {
        if (!mounted || !isDark) return;
        toggleTheme();
      },
    },
    {
      key: "dark",
      label: "Tối",
      description: "Giảm chói cho mắt",
      icon: Moon,
      active: mounted ? isDark : false,
      disabled: !mounted,
      onClick: () => {
        if (!mounted || isDark) return;
        toggleTheme();
      },
    },
    {
      key: "system",
      label: "Tự động",
      description: "Theo hệ thống (sắp có)",
      icon: SlidersHorizontal,
      active: false,
      disabled: true,
      onClick: () => undefined,
    },
  ] as const;

  const preview = mounted
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "short",
        timeZone,
      }).format(new Date())
    : "";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center gap-2 text-accent">
            <Palette className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">Giao diện</h2>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
            Tùy chỉnh theme và hiển thị cho trang quản trị
          </p>
        </div>
        <div className="px-6 py-6 grid gap-4 sm:grid-cols-3">
          {themeCards.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                disabled={item.disabled}
                className={[
                  "flex flex-col items-start gap-2 rounded-xl border px-4 py-3 text-left transition",
                  item.active
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-neutral bg-neutral-light-active text-neutral-dark hover:bg-neutral-light",
                  item.disabled ? "opacity-60 cursor-not-allowed" : "",
                ].join(" ")}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-semibold text-primary">
                  {item.label}
                </span>
                <span className="text-xs text-neutral-dark/70">
                  {item.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center gap-2 text-accent">
            <Globe className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">
              Ngôn ngữ & múi giờ
            </h2>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
            Thiết lập ngôn ngữ hiển thị và định dạng thời gian
          </p>
        </div>
        <div className="px-6 py-6 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2 text-sm text-neutral-dark">
            Ngôn ngữ
            <select
              className="w-full rounded-lg border border-neutral bg-neutral-light px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={locale}
              onChange={(event) =>
                setLocale(event.target.value as typeof locale)
              }
              disabled={!mounted}
            >
              {LOCALE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm text-neutral-dark">
            Múi giờ
            <select
              className="w-full rounded-lg border border-neutral bg-neutral-light px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
              value={timeZone}
              onChange={(event) =>
                setTimeZone(event.target.value as typeof timeZone)
              }
              disabled={!mounted}
            >
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="px-6 pb-6">
          <div className="rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 text-xs text-neutral-dark">
            {mounted ? `Xem trước: ${preview}` : "Đang tải thiết lập..."}
          </div>
        </div>
      </section>
    </div>
  );
}
