import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thông báo",
  robots: { index: false, follow: false },
};

export default function NotificationsPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Thông báo</h1>

      <ul className="space-y-3">
        <li className="rounded border p-3 text-sm">🎉 Đơn hàng #ORD001 đang được giao</li>
      </ul>
    </>
  );
}
