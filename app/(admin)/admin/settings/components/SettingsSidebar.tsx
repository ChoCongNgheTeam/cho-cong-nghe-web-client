"use client";

import { Bell, SlidersHorizontal, UserCircle } from "lucide-react";
import type { ElementType } from "react";
import { useNotifications } from "@/contexts/NotificationContext";

export type SettingsKey = "profile" | "notifications" | "system";

type SettingsItem = {
  key: SettingsKey;
  label: string;
  desc: string;
  icon: ElementType;
};

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    key: "profile",
    label: "Hồ sơ",
    desc: "Thông tin & mật khẩu",
    icon: UserCircle,
  },
  {
    key: "notifications",
    label: "Thông báo",
    desc: "Kênh & lịch sử",
    icon: Bell,
  },
  {
    key: "system",
    label: "Giao diện",
    desc: "Theme hiển thị",
    icon: SlidersHorizontal,
  },
];

type Props = {
  active: SettingsKey;
  onSelect: (key: SettingsKey) => void;
};

export default function SettingsSidebar({ active, onSelect }: Props) {
  const { notifications } = useNotifications();

  const orderUnreadCount = notifications.reduce((total, item) => {
    if (!item.isRead && item.type === "ORDER_STATUS") return total + 1;
    return total;
  }, 0);
  const notificationBadge = orderUnreadCount > 99 ? "99+" : orderUnreadCount > 0 ? `${orderUnreadCount}` : "";

  return (
    <div className="rounded-2xl border border-neutral bg-neutral-light px-4 py-4 shadow-sm">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {SETTINGS_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          const showBadge = item.key === "notifications" && notificationBadge;

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition shrink-0 whitespace-nowrap",
                isActive ? "border-accent/30 bg-accent/10 text-accent" : "border-neutral bg-neutral-light hover:bg-neutral-light-active text-primary",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <div className="flex items-center gap-2 leading-tight">
                <p className="text-xs font-semibold">{item.label}</p>
                {showBadge ? <span className="inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">{notificationBadge}</span> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
