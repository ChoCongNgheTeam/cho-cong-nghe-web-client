"use client";
import Link from "next/link";
import { menuItems } from "./menuItems";
import { usePathname } from "next/navigation";

interface PolicySidebarProps {
  activeId: string;
}

export default function PolicySidebar({ activeId }: PolicySidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-80 lg:w-96 shrink-0">
      <div className="sticky top-24 pt-6">
        <h3 className="font-bold text-xl text-primary mb-6">Chính sách</h3>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`block px-4 py-3 rounded-xl transition-all group ${
                pathname === item.href || activeId === item.id
                  ? "bg-primary text-white shadow-lg"
                  : "text-stone-700 hover:bg-stone-100 hover:text-primary"
              }`}
            >
              <span className="font-medium">{item.label}</span>
              {(pathname === item.href || activeId === item.id) && (
                <div className="absolute inset-0 bg-primary opacity-10 rounded-xl -m-1" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
