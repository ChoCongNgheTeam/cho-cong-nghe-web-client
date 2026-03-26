"use client";

import { useAuth } from "@/hooks/useAuth";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4 text-primary">Đang tải...</div>;
  if (!user) return <div className="p-4 text-primary">Bạn chưa đăng nhập</div>;

  const genderLabel =
    user.gender === "MALE"
      ? "Nam"
      : user.gender === "FEMALE"
        ? "Nữ"
        : user.gender === "OTHER"
          ? "Khác"
          : "Chưa cập nhật";

  const dobLabel = user.dateOfBirth
    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
    : "Chưa có";

  return (
    <div>
      <h1 className="text-base sm:text-xl font-bold text-primary mb-3 sm:mb-4 mt-1 sm:mt-2">
        Thông tin cá nhân
      </h1>

      <div className="px-3 sm:px-6 py-6 sm:py-10 bg-neutral-light rounded-2xl">
        <div className="w-full max-w-md mx-auto">
          {/* Avatar */}
          <div className="flex justify-center pt-4 sm:pt-8 pb-6 sm:pb-8">
            <div className="relative">
              {/* Decorative ring */}
              <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-accent/30 to-primary/20 blur-sm" />
              <div className="relative w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-neutral-light p-1 shadow-lg ring-2 ring-neutral">
                <img
                  src={user.avatarImage || "/images/avatar.png"}
                  alt="Avatar"
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
            </div>
          </div>

          {/* Name below avatar on mobile */}
          <p className="text-center font-semibold text-primary text-sm sm:hidden mb-5">
            {user.fullName || "Người dùng"}
          </p>

          {/* Info rows */}
          <div className="space-y-0 divide-y divide-neutral">
            <InfoRow label="Họ và tên" value={user.fullName || "Chưa có"} />
            <InfoRow label="Số điện thoại" value={user.phone || "Chưa có"} />
            <InfoRow label="Giới tính" value={genderLabel} />
            <InfoRow label="Ngày sinh" value={dobLabel} />
            <InfoRow label="Email" value={user.email} />
          </div>

          {/* Edit button */}
          <div className="pt-6 sm:pt-8">
            <Link href="/profile/editProfile" className="block">
              <button
                className="
                w-full sm:w-auto sm:mx-auto sm:flex
                flex items-center justify-center gap-2
                bg-primary text-neutral-light
                hover:bg-primary-hover active:bg-primary-active
                font-semibold
                px-6 py-2.5 sm:py-3
                text-sm sm:text-base
                rounded-xl shadow-md hover:shadow-lg
                transition-all active:scale-95 cursor-pointer
              "
              >
                <Pencil size={16} className="sm:w-[18px] sm:h-[18px]" />
                Chỉnh sửa thông tin
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3 sm:py-3.5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-0.5 sm:gap-4">
      <span className="text-xs sm:text-sm text-primary opacity-60 sm:opacity-100 shrink-0">
        {label}
      </span>
      <span className="text-sm sm:text-sm text-primary font-medium sm:text-right break-all">
        {value}
      </span>
    </div>
  );
}
