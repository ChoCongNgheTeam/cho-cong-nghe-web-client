"use client";

import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Pencil } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("ProfilePage must be used within AuthProvider");
  }

  const { user, loading } = auth;

  if (loading) {
    return <div className="p-4">Đang tải...</div>;
  }

  if (!user) {
    return <div className="p-4">Bạn chưa đăng nhập</div>;
  }

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
                <div className="relative w-28 h-28 rounded-full bg-white p-1 shadow-lg flex">
                  <img
                    src={user.avatarImage || "https://i.pravatar.cc/300"}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                  <button className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700">
                    <Pencil size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-8 space-y-6">
              <div>
                <label className="text-sm text-gray-500">Họ và tên</label>
                <input
                disabled
                  value={user.fullName || "Chưa có"}
                  className="w-full mt-1 px-3 py-2  border-gray-300 border rounded text-sm"
                />
              </div>

              <div>
                <label className="text-sm text-gray-500">Số điện thoại</label>
                <input
                  value={user.phone}
                  disabled
                  className="w-full mt-1 px-3 py-2  rounded bg-gray-100 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Số điện thoại không thể thay đổi sau khi đăng ký
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Giới tính </label>
                <div>
                  <select className="w-full mt-1 px-3 py-2 border-gray-300 border rounded text-sm">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                    <option value="other">Khác</option>
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <Link href="/profile/editProfile">
                  <button
                    className="w-full flex items-center justify-center gap-2
                  bg-red-600 hover:bg-red-700 text-white font-semibold
                  py-3 rounded-xl shadow-md hover:shadow-lg
                  transition-all active:scale-95 cursor-pointer"
                  >
                    Cập nhật thông tin
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
