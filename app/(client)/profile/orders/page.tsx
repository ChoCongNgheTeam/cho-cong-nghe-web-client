import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn hàng của tôi",
  robots: { index: false, follow: false },
};

export default function OrdersPage() {
  return (
    <>
      <h1 className="mb-6 text-2xl font-semibold">Đơn hàng của tôi</h1>

      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <p className="font-medium">#ORD001</p>
          <p className="text-sm text-gray-600">Trạng thái: Đang giao</p>
        </div>
      </div>
    </>
  );
}
