"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { NavGroup } from "./types";
import { isItemActive } from "./utils";

interface CollapsedFlyoutProps {
  group: NavGroup;
  anchorY: number;
  pathname: string;
  allHrefs: Set<string>;
  onClose: () => void;
}

export function CollapsedFlyout({ group, anchorY, pathname, allHrefs, onClose }: CollapsedFlyoutProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  const flyoutHeight = group.items.length * 36 + 48;
  const maxTop = typeof window !== "undefined" ? window.innerHeight - flyoutHeight - 8 : anchorY;
  const top = Math.min(anchorY, maxTop);

  return (
    <div ref={ref} style={{ top, left: 56 }} className="fixed z-50 w-52 border border-neutral rounded-xl shadow-lg py-1.5 overflow-hidden bg-neutral-light">
      <div className="px-3 py-2 text-[11px] font-bold text-primary uppercase tracking-widest border-b border-neutral mb-1">{group.label}</div>
      {group.items.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(pathname, item.href, allHrefs);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={`flex items-center gap-2.5 mx-1.5 px-2.5 py-2 rounded-lg text-[13px] transition-all duration-150 ${
              active ? "bg-accent text-white font-medium" : "text-primary hover:bg-neutral-light-active"
            }`}
          >
            <Icon size={15} className={active ? "text-white" : "text-primary"} />
            {item.title}
          </Link>
        );
      })}
    </div>
  );
}
