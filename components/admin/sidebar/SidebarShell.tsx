"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { PanelLeftClose, PanelLeftOpen, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { NavGroup } from "./types";
import { isGroupActive } from "./utils";
import { NavContent } from "./NavContent";
import { NavSearchInput } from "./NavSearchInput";
import { useNavFilter } from "./hooks/useNavFilter";
import { CollapsedFlyout } from "./CollapsedFlyout";
import { UserFooter } from "./UserFooter";
import UserAvatar from "@/components/ui/UserAvatar";

// Gradient xanh đen — #121222 làm màu chủ đạo, thêm 2 sắc độ nhạt/đậm hơn cho có chiều sâu
const SIDEBAR_BG = "linear-gradient(180deg, #0c0c18 0%, #121222 35%, #1c1c36 100%)";

interface SidebarShellProps {
  navGroups: NavGroup[];
  allHrefs: Set<string>;
  homeHref: string;
  storeHref?: string;
}

export function SidebarShell({ navGroups, allHrefs, homeHref, storeHref }: SidebarShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    navGroups.forEach((g) => {
      if (g.defaultOpen || isGroupActive(g, pathname, allHrefs)) init[g.label] = true;
    });
    return init;
  });

  const [flyout, setFlyout] = useState<{ group: NavGroup; anchorY: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { filteredGroups, isFiltering } = useNavFilter(navGroups, searchQuery);

  // Khi đang filter, ép mở hết group có kết quả — bỏ qua trạng thái mở/đóng thủ công của user
  const effectiveOpenGroups = isFiltering ? Object.fromEntries(filteredGroups.map((g) => [g.label, true])) : openGroups;

  // Đóng mobile drawer + xoá filter khi đổi route — điều chỉnh state ngay trong render thay vì
  // dùng effect (đây là pattern React khuyến nghị cho "reset state khi prop đổi",
  // tránh setState trong effect gây cascading render không cần thiết)
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
    setSearchQuery("");
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const toggleGroup = (label: string) => setOpenGroups((prev) => ({ ...prev, [label]: !prev[label] }));

  const handleIconClick = (e: React.MouseEvent<HTMLButtonElement>, group: NavGroup) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFlyout((prev) => (prev?.group.label === group.label ? null : { group, anchorY: rect.top }));
  };

  const handleLogout = async () => {
    await logout?.();
    router.replace("/account");
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 w-9 h-9 flex items-center justify-center rounded-xl bg-neutral-light border border-neutral shadow-sm text-primary hover:bg-neutral-light-active transition-all"
        aria-label="Mở menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && <div className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" onClick={() => setMobileOpen(false)} />}

      {/* Mobile drawer — nền sáng */}
      <div
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-neutral-light border-r border-neutral flex flex-col shadow-2xl transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-neutral flex items-center justify-between px-3 py-3 shrink-0">
          <Link href={homeHref} onClick={() => setMobileOpen(false)}>
            <Image src="/logo.png" alt="Logo" width={140} height={40} className="h-9 w-auto object-contain" priority />
          </Link>
          <button onClick={() => setMobileOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-primary hover:bg-neutral-light-active transition-all">
            <X size={16} />
          </button>
        </div>

        <NavSearchInput value={searchQuery} onChange={setSearchQuery} dark={false} />
        <NavContent navGroups={filteredGroups} allHrefs={allHrefs} pathname={pathname} openGroups={effectiveOpenGroups} toggleGroup={toggleGroup} dark={false} />

        {user && <UserFooter user={user} storeHref={storeHref} onLogout={handleLogout} dark={false} />}
      </div>

      {/* Desktop sidebar — nền tối navy */}
      <div className={`hidden md:flex ${collapsed ? "w-14" : "w-64"} h-full flex-col transition-all duration-300 relative z-40 border-r border-white/10`} style={{ background: SIDEBAR_BG }}>
        <style>{`
          .sidebar-nav-dark-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.25) transparent;
          }
          .scrollbar-thin.sidebar-nav-dark-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.25);
            border-radius: 9999px;
          }
          .scrollbar-thin.sidebar-nav-dark-scrollbar::-webkit-scrollbar-thumb:hover {
            background-color: rgba(255, 255, 255, 0.4);
          }
          .scrollbar-thin.sidebar-nav-dark-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
        `}</style>
        {/* Logo area */}
        <div className={`border-b border-white/10 flex items-center justify-between ${collapsed ? "px-2 py-3" : "px-3 py-3"} shrink-0`}>
          {!collapsed && (
            <Link href={homeHref} className="flex-1 min-w-0">
              <Image src="/logo-ccn.png" alt="Logo" width={140} height={40} className="h-9 w-auto object-contain" priority />
            </Link>
          )}
          {collapsed && (
            <Link href={homeHref} className="mx-auto">
              <Image src="/logo-ccn.png" alt="Logo" width={32} height={32} className="h-7 w-auto object-contain" priority />
            </Link>
          )}
          <button
            onClick={() => {
              setCollapsed(true);
              setFlyout(null);
              setSearchQuery("");
            }}
            className={`text-white/60 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10 cursor-pointer shrink-0 ${collapsed ? "hidden" : "ml-1"}`}
          >
            <PanelLeftClose size={16} />
          </button>
        </div>

        {collapsed && (
          <button
            onClick={() => {
              setCollapsed(false);
              setFlyout(null);
            }}
            className="mx-auto mt-1.5 mb-0.5 text-white/60 hover:text-white transition-colors p-1.5 rounded-md hover:bg-white/10 cursor-pointer"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}

        {/* Desktop nav */}
        {collapsed ? (
          <nav className="flex-1 overflow-y-auto scrollbar-thin sidebar-nav-dark-scrollbar px-2 py-2 space-y-0.5">
            {navGroups.map((group) => {
              const GroupIcon = group.icon;
              const groupActive = isGroupActive(group, pathname, allHrefs);
              const isFlyoutOpen = flyout?.group.label === group.label;
              return (
                <button
                  key={group.label}
                  onClick={(e) => handleIconClick(e, group)}
                  title={group.label}
                  className={`w-full flex justify-center items-center py-2.5 px-1.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    groupActive || isFlyoutOpen ? "bg-accent text-white shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <GroupIcon size={20} />
                </button>
              );
            })}
          </nav>
        ) : (
          <>
            <NavSearchInput value={searchQuery} onChange={setSearchQuery} dark={true} />
            <NavContent navGroups={filteredGroups} allHrefs={allHrefs} pathname={pathname} openGroups={effectiveOpenGroups} toggleGroup={toggleGroup} dark={true} />
          </>
        )}

        {/* Desktop user footer */}
        {user && !collapsed && <UserFooter user={user} storeHref={storeHref} onLogout={handleLogout} dark={true} />}
        {user && collapsed && (
          <div className="border-t border-white/10 px-2 py-3 flex justify-center shrink-0">
            <UserAvatar avatarImage={user.avatarImage} fullName={user.fullName} size={32} />
          </div>
        )}
      </div>

      {/* Desktop flyout — nền sáng để nổi bật */}
      {collapsed && flyout && <CollapsedFlyout group={flyout.group} anchorY={flyout.anchorY} pathname={pathname} allHrefs={allHrefs} onClose={() => setFlyout(null)} />}
    </>
  );
}
