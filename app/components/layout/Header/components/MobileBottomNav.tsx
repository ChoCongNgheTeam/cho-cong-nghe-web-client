"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingBag, Bell, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/contexts/NotificationContext";
import MobileCategorySheet from "./MobileCategorySheet";
import MobileNotificationSheet from "./MobileNotificationSheet";

type SheetType = "category" | "notification" | null;

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [openSheet, setOpenSheet] = useState<SheetType>(null);

  const closeSheet = () => setOpenSheet(null);

  const tabs = [
    { key: "home", href: "/", icon: Home, label: "Trang chủ" },
    { key: "category", icon: LayoutGrid, label: "Danh mục", onTap: () => setOpenSheet((s) => (s === "category" ? null : "category")) },
    { key: "store", href: "/category/dien-thoai", icon: ShoppingBag, label: "Cửa hàng" },
    {
      key: "notification",
      icon: Bell,
      label: "Thông báo",
      badge: isAuthenticated ? unreadCount : 0,
      onTap: () => (isAuthenticated ? setOpenSheet((s) => (s === "notification" ? null : "notification")) : (window.location.href = "/account")),
    },
    { key: "account", href: isAuthenticated ? "/profile" : "/account", icon: User, label: "Tài khoản" },
  ];

  const commonClass = "flex-1 flex flex-col items-center justify-center gap-0.5 relative select-none active:scale-90 transition-transform duration-100 cursor-pointer";

  return (
    <>
      <MobileCategorySheet isOpen={openSheet === "category"} onClose={closeSheet} />
      <MobileNotificationSheet isOpen={openSheet === "notification"} onClose={closeSheet} />

      {/* Spacer */}
      {/* <div className="md:hidden h-[60px]" aria-hidden="true" /> */}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[90] bg-neutral-light/95 backdrop-blur-md border-t border-neutral" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="flex items-stretch h-[60px]">
          {tabs.map((tab) => {
            const isActive =
              "href" in tab && tab.href
                ? tab.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(tab.href)
                : tab.key === "category"
                  ? openSheet === "category"
                  : tab.key === "notification"
                    ? openSheet === "notification"
                    : false;

            const Icon = tab.icon;
            const badge = (tab as any).badge ?? 0;

            const inner = (
              <>
                {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-7 h-[3px] rounded-b-full bg-accent" />}
                <span className="relative">
                  <Icon className={["w-[22px] h-[22px] transition-colors duration-150", isActive ? "text-accent" : "text-neutral-darker"].join(" ")} strokeWidth={isActive ? 2.2 : 1.8} />
                  {!!badge && (
                    <span className="absolute -right-1.5 -top-1 min-w-[15px] h-[15px] px-[3px] flex items-center justify-center rounded-full bg-accent text-[9px] font-bold text-white ring-[1.5px] ring-neutral-light">
                      {badge > 99 ? "99+" : badge}
                    </span>
                  )}
                </span>
                <span className={["text-[10px] font-medium leading-none transition-colors duration-150", isActive ? "text-accent" : "text-neutral-darker"].join(" ")}>{tab.label}</span>
              </>
            );

            if ((tab as any).onTap) {
              return (
                <button key={tab.key} onClick={(tab as any).onTap} className={commonClass}>
                  {inner}
                </button>
              );
            }

            return (
              <Link key={tab.key} href={(tab as any).href} className={commonClass}>
                {inner}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
