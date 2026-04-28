"use client";

import { useState } from "react";
import SettingsSidebar, { SettingsKey } from "./components/SettingsSidebar";
import ProfileSettingsView from "./components/ProfileSettingsView";
import NotificationSettingsView from "./components/NotificationSettingsView";
import SecuritySettingsView from "./components/SecuritySettingsView";
import GeneralSettingsView from "./components/GeneralSettingsView";
import SeoSettingsView from "./components/SeoSettingsView";
import EcommerceSettingsView from "./components/EcommerceSettingsView";
import PermissionsSettingsView from "./components/PermissionsSettingsView";
import AuditLogView from "./components/AuditLogView";

const TITLES: Record<SettingsKey, { title: string; desc: string }> = {
  profile: {
    title: "Hồ sơ cá nhân",
    desc: "Quản lý ảnh đại diện và thông tin cá nhân",
  },
  notifications: {
    title: "Thông báo",
    desc: "Tùy chọn kênh nhận thông báo và xem lịch sử",
  },
  security: {
    title: "Bảo mật",
    desc: "Đổi mật khẩu, thiết bị đăng nhập và lịch sử hoạt động",
  },
  general: {
    title: "Hệ thống chung",
    desc: "Nhận diện thương hiệu, logo, favicon và chế độ bảo trì",
  },
  seo: {
    title: "SEO & Analytics",
    desc: "Meta tags, OG image, Google Analytics và Facebook Pixel",
  },
  ecommerce: {
    title: "E-commerce",
    desc: "Cài đặt sản phẩm, thanh toán, đơn hàng, ví, hóa đơn và thuế",
  },
  permissions: {
    title: "Phân quyền & Vai trò",
    desc: "Quản lý RBAC — gán quyền truy cập theo vai trò và nhóm người dùng",
  },
  auditlog: {
    title: "Nhật ký hoạt động",
    desc: "Audit trail toàn hệ thống — Who · When · Where · What",
  },
};

export default function AdminSettingsPage() {
  const [active, setActive] = useState<SettingsKey>("profile");
  const header = TITLES[active];

  return (
    <div className="min-h-screen bg-neutral-light text-primary">
      <div className="p-6 space-y-6">
        <SettingsSidebar active={active} onSelect={setActive} />

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{header.title}</h1>
            <p className="text-neutral-dark mt-2">{header.desc}</p>
          </div>

          {active === "profile" && <ProfileSettingsView />}
          {active === "notifications" && <NotificationSettingsView />}
          {active === "security" && <SecuritySettingsView />}
          {active === "general" && <GeneralSettingsView />}
          {active === "seo" && <SeoSettingsView />}
          {active === "ecommerce" && <EcommerceSettingsView />}
          {active === "permissions" && <PermissionsSettingsView />}
          {active === "auditlog" && <AuditLogView />}
        </div>
      </div>
    </div>
  );
}
