"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailContent() {
  const params = useSearchParams();
  const router = useRouter();
  const status = params.get("status"); // "success" | "invalid" | null

  const isSuccess = status === "success";

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-neutral-light">
      <div className="w-full max-w-md bg-[rgb(var(--neutral-light))] rounded-2xl shadow-lg p-8 text-center">
        {/* Icon */}
        <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isSuccess ? "bg-green-100 border border-green-200" : "bg-red-100 border border-red-200"}`}>
          {isSuccess ? (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" />
            </svg>
          )}
        </div>

        {/* Heading */}
        <h1 className="text-2xl font-bold text-primary mb-2">{isSuccess ? "Xác nhận email thành công! 🎉" : "Liên kết không hợp lệ"}</h1>

        <p className="text-neutral-darker text-sm leading-relaxed mb-6">
          {isSuccess ? "Tài khoản của bạn đã được kích hoạt. Bạn có thể đăng nhập ngay bây giờ." : "Liên kết xác nhận đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu gửi lại email xác nhận."}
        </p>

        {/* CTA */}
        {isSuccess ? (
          <Link href="/account?login" className="inline-block w-full py-3 bg-accent hover:bg-accent-hover text-neutral-light font-semibold rounded-xl transition-colors text-sm">
            Đăng nhập ngay
          </Link>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/account?login" className="inline-block w-full py-3 bg-accent hover:bg-accent-hover text-neutral-light font-semibold rounded-xl transition-colors text-sm">
              Quay về đăng nhập
            </Link>
            {/* 
              Optional: nếu muốn cho user resend ngay tại đây 
              thì gọi POST /auth/resend-verification với email
              Nhưng ở trang này không có email → redirect về login
              rồi user nhập email để resend là đủ
            */}
          </div>
        )}
      </div>
    </div>
  );
}
