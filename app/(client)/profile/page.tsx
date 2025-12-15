import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";

export const metadata: Metadata = {
  title: "Tài khoản của tôi | ChoCongNghe",
  alternates: {
    canonical: `${SITE_URL}/profile`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Xin chào 👋</h1>
      <p className="text-gray-600">Quản lý thông tin tài khoản, đơn hàng và cài đặt cá nhân.</p>
    </>
  );
}
