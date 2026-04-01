"use client";

import { useState } from "react";
import SettingsSidebar, { SettingsKey } from "./components/SettingsSidebar";
import ProfileSettingsView from "./components/ProfileSettingsView";
import SecuritySettingsView from "./components/SecuritySettingsView";
import NotificationSettingsView from "./components/NotificationSettingsView";
import SystemPreferencesView from "./components/SystemPreferencesView";

const TITLES: Record<SettingsKey, { title: string; desc: string }> = {
  profile: {
    title: "Thiết lập hồ sơ",
    desc: "Quản lý thông tin cá nhân và cài đặt tài khoản",
  },
  security: {
    title: "Thiết lập bảo mật",
    desc: "Bảo mật tài khoản và thiết lập xác thực",
  },
  notifications: {
    title: "Thiết lập thông báo",
    desc: "Tùy chọn kênh nhận thông báo",
  },
  system: {
    title: "Tùy chọn hệ thống",
    desc: "Thiết lập giao diện, ngôn ngữ và múi giờ",
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
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {header.title}
            </h1>
            <p className="text-neutral-dark mt-2">{header.desc}</p>
          </div>

          {active === "profile" && <ProfileSettingsView />}
          {active === "security" && <SecuritySettingsView />}
          {active === "notifications" && <NotificationSettingsView />}
          {active === "system" && <SystemPreferencesView />}
        </div>
      </div>
    </div>
  );
}
