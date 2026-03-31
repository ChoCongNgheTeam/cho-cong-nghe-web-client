"use client";

import {
  Bell,
  KeyRound,
  ShieldCheck,
  SlidersHorizontal,
  User,
} from "lucide-react";
import type { ElementType } from "react";

export type SettingsKey =
  | "profile"
  | "security"
  | "permissions"
  | "notifications"
  | "system";

type SettingsItem = {
  key: SettingsKey;
  label: string;
  desc: string;
  icon: ElementType;
  group: "account" | "system";
};

const SETTINGS_ITEMS: SettingsItem[] = [
  {
    key: "profile",
    label: "Hồ sơ",
    desc: "Thông tin cá nhân, ảnh đại diện",
    icon: User,
    group: "account",
  },
  {
    key: "security",
    label: "Bảo mật",
    desc: "Mật khẩu, 2FA, thiết bị",
    icon: ShieldCheck,
    group: "account",
  },
  {
    key: "permissions",
    label: "Phân quyền",
    desc: "Quyền hạn, vai trò",
    icon: KeyRound,
    group: "account",
  },
  {
    key: "notifications",
    label: "Thông báo",
    desc: "Email, push, báo cáo",
    icon: Bell,
    group: "system",
  },
  {
    key: "system",
    label: "Tuỳ chọn hệ thống",
    desc: "Giao diện, ngôn ngữ, múi giờ",
    icon: SlidersHorizontal,
    group: "system",
  },
];

type Props = {
  active: SettingsKey;
  onSelect: (key: SettingsKey) => void;
};

export default function SettingsSidebar({ active, onSelect }: Props) {
  const accountItems = SETTINGS_ITEMS.filter((item) => item.group === "account");
  const systemItems = SETTINGS_ITEMS.filter((item) => item.group === "system");

  return (
    <div className="rounded-2xl border border-neutral bg-neutral-light px-4 py-4 shadow-sm">
      <div className="flex flex-nowrap items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {accountItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition shrink-0 whitespace-nowrap",
                isActive
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-neutral bg-neutral-light hover:bg-neutral-light-active text-primary",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <div className="leading-tight">
                <p className="text-xs font-semibold">{item.label}</p>
              </div>
            </button>
          );
        })}

        
        {systemItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onSelect(item.key)}
              className={[
                "flex items-center gap-2 rounded-xl border px-3 py-2 text-left transition shrink-0 whitespace-nowrap",
                isActive
                  ? "border-accent/30 bg-accent/10 text-accent"
                  : "border-neutral bg-neutral-light hover:bg-neutral-light-active text-primary",
              ].join(" ")}
            >
              <Icon className="h-4 w-4" />
              <div className="leading-tight">
                <p className="text-xs font-semibold">{item.label}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
