import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";

export const metadata: Metadata = {
   title: "Quên mật khẩu",
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
            <h1 className="mb-2 text-2xl font-semibold text-primary">
               Quên mật khẩu
            </h1>

            <p className="mb-6 text-sm text-primary">
               Nhập email bạn đã đăng ký. Chúng tôi sẽ gửi link đặt lại mật
               khẩu.
            </p>

            {/* Client Form */}
            <ForgotPasswordForm />

            <div className="mt-6 text-center text-sm">
               <Link
                  href="/account?login"
                  className="hover:underline text-primary"
               >
                  ← Quay lại đăng nhập
               </Link>
            </div>
         </div>
      </section>
   );
}
