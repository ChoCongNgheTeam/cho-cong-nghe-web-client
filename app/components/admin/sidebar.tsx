import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "📊"
  },
  {
    title: "Products",
    href: "/admin/products",
    icon: "📦"
  },
  {
    title: "Categories",
    href: "/admin/categories",
    icon: "📂"
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: "🛒"
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: "👥"
  },
  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: "⭐"
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: "⚙️"
  }
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-800 text-white h-full">
      <div className="p-6">
        <h2 className="text-xl font-bold">Admin Panel</h2>
      </div>
      <nav className="mt-6">
        <div className="px-6">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center px-4 py-3 mb-2 rounded-lg transition-colors ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }`}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
