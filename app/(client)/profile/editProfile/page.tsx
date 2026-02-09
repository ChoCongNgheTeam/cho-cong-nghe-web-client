"use client";

import { useContext, useEffect, useState } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { Pencil } from "lucide-react";
import Link from "next/link";
import apiRequest from "@/lib/api";

export default function ProfileForm() {
  const auth = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    gender: "",
    email: "",
    dateOfBirth: "",
  });

  if (!auth) {
    throw new Error("ProfileForm must be used within AuthProvider");
  }

  const { user, loading } = auth;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        phone: user.phone || "",
        gender: user.gender || "",
        email: user.email || "",
        dateOfBirth: user.dateOfBirth || "",
      });
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const updateData = {
      fullName: formData.fullName,
      gender: formData.gender,
    };

    console.log("📤 Gửi lên:", updateData);

    const data = await apiRequest.patch("/users/me", updateData);

    console.log("✅ Update thành công:", data);
    alert("Cập nhật thành công");

  } catch (error: any) {
    console.error("❌ Full error:", error);
    alert(error?.message || "Cập nhật thất bại");
  }
};

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

      <form action="" onSubmit={handleSubmit}>
        <div className="px-4 py-10 bg-white">
          <div className="w-full max-w-md mx-auto">
            <div className="overflow-hidden">
              {/* Avatar */}
              <div className="relative flex justify-center pt-8">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-orange-200/40 blur-xl" />
                  <div className="relative w-28 h-28 rounded-full bg-white p-1 shadow-lg flex">
                    <img
                      src={
                        user.avatarImage ||
                        "https://img.freepik.com/vector-mien-phi/vong-tron-mau-xanh-voi-nguoi-dung-mau-trang_78370-4707.jpg?semt=ais_hybrid&w=740&q=80"
                      }
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
                    name="fullName"
                    onChange={handleChange}
                    value={formData.fullName}
                    className="w-full mt-1 px-3 py-2  border-gray-300 border rounded text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-500">Số điện thoại</label>
                  <input
                    value={formData.phone}
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
                    <select
                      className="w-full mt-1 px-3 py-2 border-gray-300 border rounded text-sm"
                      value={formData.gender}
                      onChange={handleChange}
                      name="gender"
                    >
                      <option value="male">Nam</option>
                      <option value="female">Nữ</option>
                      <option value="other">Khác</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                    name="dateOfBirth"
                    className="w-full mt-1 px-3 py-2 border-gray-300 border rounded text-sm"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-3 rounded-xl"
                  >
                    Cập nhật thông tin
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
