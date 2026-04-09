import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Bell, ShieldAlert, ChevronRight } from "lucide-react";
import { ThemeToggleRow } from "./ThemeToggleRow";

export const metadata: Metadata = {
  title: "Cài đặt tài khoản",
  robots: { index: false, follow: false },
};

const settingGroups = [
  {
    label: "Bảo mật",
    items: [
      {
        href: "/profile/settings/change-password",
        icon: Lock,
        title: "Đổi mật khẩu",
        desc: "Cập nhật mật khẩu để bảo mật tài khoản",
      },
    ],
  },
  {
    label: "Tùy chọn",
    items: [
      {
        href: "/profile/settings/notifications",
        icon: Bell,
        title: "Thông báo",
        desc: "Quản lý thông báo email",
      },
      {
        href: "/profile/settings/privacy",
        icon: ShieldAlert,
        title: "Quyền riêng tư",
        desc: "Kiểm soát dữ liệu cá nhân của bạn",
      },
    ],
  },
];

export default function SettingsPage() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <h1 className="mb-6 text-xl sm:text-2xl font-semibold text-primary">Cài đặt</h1>

      <div className="space-y-6">
        {settingGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-dark px-1">{group.label}</p>
            <div className="border border-neutral rounded-xl overflow-hidden">
              {group.items.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      "flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4",
                      "bg-neutral-light hover:bg-neutral-light-hover transition-colors",
                      idx !== 0 ? "border-t border-neutral" : "",
                    ].join(" ")}
                  >
                    <div className="p-2 bg-accent-light rounded-lg shrink-0">
                      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-primary">{item.title}</p>
                      <p className="text-xs sm:text-sm text-neutral-dark truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-dark shrink-0" />
                  </Link>
                );
              })}
              {group.label === "Tùy chọn" && <ThemeToggleRow />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
