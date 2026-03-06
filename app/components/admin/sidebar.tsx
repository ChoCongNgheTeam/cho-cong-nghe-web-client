"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MenuItem = {
  title: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { title: "Tong quan he thong", href: "/admin" },
  { title: "Don hang", href: "/admin/orders" },
  { title: "Nguoi dung", href: "/admin/users" },
  { title: "Danh muc", href: "/admin/categories" },
  { title: "San pham", href: "/admin/products" },
  { title: "Blogs", href: "/admin/blog" },
  { title: "Cai dat he thong", href: "/admin/settings" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="h-full w-64 border-r border-neutral bg-neutral-light p-4">
      <p className="mb-4 text-xl font-semibold text-primary">ChoCongNghe</p>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-accent-light text-accent-dark"
                  : "text-primary-light hover:bg-neutral-light-active hover:text-primary"
              }`}
            >
              {item.title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
