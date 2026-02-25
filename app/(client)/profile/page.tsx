"use client";

import { useAuth } from "@/hooks/useAuth";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-4">Đang tải...</div>;
  if (!user) return <div className="p-4">Bạn chưa đăng nhập</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 mt-2">
        Thông tin cá nhân
      </h1>

      <div className="px-4 py-10 bg-white">
        <div className="w-full max-w-md mx-auto">
          <div className="overflow-hidden">
            {/* Avatar */}
            <div className="relative flex justify-center pt-8">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-orange-200/40 blur-xl" />
                <div className="relative w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                  <img
                    src={user.avatarImage || "/images/avatar.png"}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-8 space-y-6">
              <InfoRow label="Họ và tên" value={user.fullName || "Chưa có"} />
              <InfoRow label="Email" value={user.email} />
              <InfoRow label="Số điện thoại" value={user.phone || "Chưa có"} />
              <InfoRow
                label="Ngày sinh"
                value={
                  user.dateOfBirth
                    ? new Date(user.dateOfBirth).toLocaleDateString("vi-VN")
                    : "Chưa có"
                }
              />
              <InfoRow
                label="Giới tính"
                value={
                  user.gender === "MALE"
                    ? "Nam"
                    : user.gender === "FEMALE"
                      ? "Nữ"
                      : user.gender === "OTHER"
                        ? "Khác"
                        : "Chưa cập nhật"
                }
              />

              <div className="pt-4">
                <Link href="/profile/editProfile">
                  <button
                    className="w-full flex items-center justify-center gap-2
                  bg-red-600 hover:bg-red-700 text-white font-semibold
                  py-3 rounded-xl shadow-md hover:shadow-lg
                  transition-all active:scale-95 cursor-pointer"
                  >
                    <Pencil size={18} />
                    Chỉnh sửa thông tin
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-3">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
