"use client";

import { useState } from "react";
import SettingsSidebar, { SettingsKey } from "./components/SettingsSidebar";
import ProfileSettingsView from "./components/ProfileSettingsView";
import NotificationSettingsView from "./components/NotificationSettingsView";
import SystemPreferencesView from "./components/SystemPreferencesView";

const TITLES: Record<SettingsKey, { title: string; desc: string }> = {
  profile: {
    title: "Hồ sơ cá nhân",
    desc: "Quản lý ảnh đại diện, thông tin cá nhân và mật khẩu",
  },
  notifications: {
    title: "Thông báo",
    desc: "Tùy chọn kênh nhận thông báo và xem lịch sử",
  },
  system: {
    title: "Giao diện",
    desc: "Tùy chỉnh theme hiển thị cho trang quản trị",
  },
};

export default function AdminSettingsPage() {
  const [active, setActive] = useState<SettingsKey>("profile");

  const header = TITLES[active];

  return (
    <div className="min-h-screen bg-neutral-light text-primary">
      <div className="p-6 space-y-6">
        <SettingsSidebar active={active} onSelect={(key) => setActive(key)} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{header.title}</h1>
            <p className="text-neutral-dark mt-2">{header.desc}</p>
          </div>

          {active === "profile" && <ProfileSettingsView />}
          {active === "notifications" && <NotificationSettingsView />}
          {active === "system" && <SystemPreferencesView />}
        </div>
      </div>
    </div>
  );
}
