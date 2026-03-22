import type { Metadata } from "next";
import { SITE_URL } from "@/config/site.config";
import Link from "next/link";
import ForgotPasswordForm from "./ForgotPasswordForm";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

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
      <section className="container px-4 py-8">
         <Breadcrumb
            items={[
               { label: "Trang chủ", href: "/" },
               { label: "Tài khoản", href: "/account" },
               { label: "Quên mật khẩu" },
            ]}
         />

         {/* Form căn giữa */}
         <div className="mt-7 w-full max-w-sm mx-auto">
            <div className="my-8">
               <h1 className="text-xl font-semibold text-primary tracking-tight mb-1">
                  Quên mật khẩu?
               </h1>
               <p className="text-sm text-primary leading-relaxed">
                  Nhập email đã đăng ký — chúng tôi sẽ gửi link đặt lại ngay.
               </p>
            </div>
            <ForgotPasswordForm />

            <div className="mt-5 text-center">
               <Link
                  href="/account?login"
                  className="inline-flex items-center gap-1.5 text-sm text-primary transition-colors"
               >
                  <svg
                     className="w-3.5 h-3.5"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                     strokeWidth={2}
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                     />
                  </svg>
                  Quay lại đăng nhập
               </Link>
            </div>
         </div>
      </section>
   );
}
