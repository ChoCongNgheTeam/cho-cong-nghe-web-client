"use client";

import { Moon, Palette, SlidersHorizontal, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

export default function SystemPreferencesView() {
  const { isDark, toggleTheme, mounted } = useTheme();

  const themeCards = [
    {
      key: "light",
      label: "Sáng",
      description: "Giao diện nền sáng, dễ nhìn ban ngày",
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
      description: "Giảm mỏi mắt khi làm việc đêm",
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
      description: "Theo cài đặt hệ thống (sắp có)",
      icon: SlidersHorizontal,
      active: false,
      disabled: true,
      onClick: () => undefined,
    },
  ] as const;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm overflow-hidden">
        <div className="border-b border-neutral px-6 py-4 bg-neutral-light-active/40">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
              <Palette className="h-4 w-4 text-accent" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-primary">Giao diện</h2>
              <p className="text-xs text-neutral-dark mt-0.5">Tùy chỉnh theme hiển thị cho trang quản trị</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {themeCards.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  disabled={item.disabled}
                  className={[
                    "relative flex flex-col items-start gap-3 rounded-xl border px-4 py-4 text-left transition-all",
                    item.active ? "border-accent/40 bg-accent/10 shadow-sm" : "border-neutral bg-neutral-light-active hover:bg-neutral-light hover:border-neutral-dark/20",
                    item.disabled && !item.active ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                  ].join(" ")}
                >
                  {/* Active dot */}
                  {item.active && <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-accent" />}
                  <div className={["flex h-9 w-9 items-center justify-center rounded-lg", item.active ? "bg-accent/20" : "bg-neutral"].join(" ")}>
                    <Icon className={["h-5 w-5", item.active ? "text-accent" : "text-neutral-dark"].join(" ")} />
                  </div>
                  <div>
                    <p className={["text-sm font-semibold", item.active ? "text-accent" : "text-primary"].join(" ")}>{item.label}</p>
                    <p className="text-xs text-neutral-dark/70 mt-0.5 leading-relaxed">{item.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {!mounted && <p className="mt-4 text-xs text-neutral-dark/60 text-center">Đang tải thiết lập giao diện...</p>}
        </div>
      </section>
    </div>
  );
}
