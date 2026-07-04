"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { NavGroup } from "./types";
import { isGroupActive, isItemActive } from "./utils";

interface NavContentProps {
  navGroups: NavGroup[];
  allHrefs: Set<string>;
  pathname: string;
  openGroups: Record<string, boolean>;
  toggleGroup: (label: string) => void;
  dark?: boolean;
}

export function NavContent({ navGroups, allHrefs, pathname, openGroups, toggleGroup, dark = false }: NavContentProps) {
  return (
    <nav className={`flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-0.5 ${dark ? "sidebar-nav-dark-scrollbar" : ""}`}>
      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        const isOpen = openGroups[group.label] ?? false;
        const groupActive = isGroupActive(group, pathname, allHrefs);

        return (
          <div key={group.label} className="mb-0.5">
            <button
              onClick={() => toggleGroup(group.label)}
              className={[
                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-left transition-all duration-150 cursor-pointer",
                isOpen ? "sticky -top-2 z-10 backdrop-blur-sm" : "",
                dark
                  ? isOpen
                    ? "bg-[#2e3548]/95 text-white/90"
                    : groupActive
                      ? "bg-white/15 text-white font-semibold"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  : isOpen
                    ? "bg-neutral-light/95 text-primary"
                    : groupActive
                      ? "bg-accent/10 text-accent font-semibold"
                      : "text-primary hover:bg-neutral-light-active",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              <GroupIcon size={16} className={dark ? (groupActive && !isOpen ? "text-white" : "text-white/50") : groupActive && !isOpen ? "text-accent" : "text-primary"} />
              <span className="flex-1 text-[12px] font-semibold uppercase tracking-wider">{group.label}</span>
              {isOpen ? <ChevronDown size={13} className={dark ? "text-white/40" : "text-primary"} /> : <ChevronRight size={13} className={dark ? "text-white/40" : "text-primary"} />}
            </button>

            {isOpen && (
              <div className={`ml-2 pl-2 mt-0.5 space-y-0.5 border-l ${dark ? "border-white/10" : "border-neutral"}`}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(pathname, item.href, allHrefs);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
                        active ? "bg-accent text-white font-medium shadow-sm" : dark ? "text-white/70 hover:bg-white/10 hover:text-white" : "text-primary hover:bg-neutral-light-active"
                      }`}
                    >
                      <Icon size={15} className={active ? "text-white" : dark ? "text-white/50" : "text-primary"} />
                      <span className="text-[13px]">{item.title}</span>
                      {item.badge && <span className="ml-auto text-[10px] bg-promotion text-white rounded-full px-1.5 py-0.5 font-semibold">{item.badge}</span>}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
