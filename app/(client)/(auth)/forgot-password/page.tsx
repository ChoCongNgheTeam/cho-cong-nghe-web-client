import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Quên mật khẩu | NhaMayMan",
  description: "Nhập email để nhận liên kết đặt lại mật khẩu.",
  alternates: {
    canonical: `${SITE_URL}/forgot-password`,
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 text-2xl font-semibold">Quên mật khẩu</h1>
        <p className="mb-6 text-sm text-gray-600">
          Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật khẩu.
        </p>

        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email của bạn"
            className="w-full rounded-md border px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-md bg-black py-3 text-white hover:bg-gray-800"
          >
            Gửi liên kết đặt lại mật khẩu
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link href="/login" className="text-gray-600 hover:underline">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </section>
  );
}
