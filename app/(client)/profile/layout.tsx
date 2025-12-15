import Link from "next/link";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-2 rounded-lg border p-4">
          <h2 className="mb-4 text-lg font-semibold">Tài khoản</h2>

          <NavLink href="/profile">Tổng quan</NavLink>
          <NavLink href="/profile/orders">Đơn hàng</NavLink>
          <NavLink href="/profile/notifications">Thông báo</NavLink>
          <NavLink href="/profile/settings">Cài đặt</NavLink>
        </aside>

        {/* Content */}
        <main className="rounded-lg border p-6">{children}</main>
      </div>
    </section>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded px-3 py-2 text-gray-700 hover:bg-gray-100 hover:text-black"
    >
      {children}
    </Link>
  );
}
