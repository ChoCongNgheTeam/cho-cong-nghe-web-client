"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Pencil, ChevronDown } from "lucide-react";
import apiRequest from "@/lib/api";

export default function ProfileForm() {
   const { user, loading } = useAuth();
   const [formData, setFormData] = useState({
      fullName: "",
      phone: "",
      gender: "",
      email: "",
      dateOfBirth: "",
      avatarImage: "",
   });

   useEffect(() => {
      if (user) {
         setFormData({
            fullName: user.fullName || "",
            phone: user.phone || "",
            gender: user.gender ? user.gender.toUpperCase() : "",
            email: user.email || "",
            dateOfBirth: user.dateOfBirth
               ? new Date(user.dateOfBirth).toISOString().split("T")[0]
               : "",
            avatarImage: user.avatarImage || "",
         });
      }
   }, [user]);

   const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
   ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         // Chỉ gửi các field backend cho phép, không gửi email hay phone
         const updateData: Record<string, any> = {
            fullName: formData.fullName,
         };

         // Chỉ thêm gender nếu có giá trị
         if (formData.gender) {
            updateData.gender = formData.gender;
         }

         // Chỉ thêm dateOfBirth nếu có giá trị
         if (formData.dateOfBirth) {
            updateData.dateOfBirth = new Date(
               formData.dateOfBirth,
            ).toISOString();
         }

         console.log("Sending data:", JSON.stringify(updateData));

         const data = await apiRequest.patch("/users/me", updateData);
         console.log("Update thành công:", data);
         alert("Cập nhật thành công");
      } catch (error: any) {
         console.error("Full error:", error);
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

         <form onSubmit={handleSubmit}>
            <div className="px-4 py-10 bg-white">
               <div className="w-full max-w-md mx-auto">
                  <div className="overflow-hidden">
                     {/* Avatar */}
                     <div className="relative flex justify-center pt-8">
                        <div className="relative w-28 h-28 rounded-full bg-white p-1 shadow-lg flex">
                           <img
                              src={formData.avatarImage || "/images/avatar.png"}
                              alt="Avatar"
                              className="w-full h-full rounded-full object-cover"
                           />
                           <button
                              type="button"
                              className="absolute bottom-0 right-0 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700"
                           >
                              <Pencil size={14} />
                           </button>
                        </div>
                     </div>

                     {/* Info */}
                     <div className="px-6 py-8 space-y-6">
                        <div>
                           <label className="text-sm text-gray-500">
                              Họ và tên
                           </label>
                           <input
                              name="fullName"
                              value={formData.fullName}
                              onChange={handleChange}
                              className="w-full mt-1 px-3 py-2 border-gray-300 border rounded text-sm"
                           />
                        </div>

                        {/* Phone: disabled, không submit */}
                        <div>
                           <label className="text-sm text-gray-500">
                              Số điện thoại
                           </label>
                           <input
                              value={formData.phone}
                              disabled
                              className="w-full mt-1 px-3 py-2 rounded bg-gray-100 text-sm cursor-not-allowed"
                           />
                        </div>

                        <div>
                           <label className="text-sm text-gray-500">
                              Giới tính
                           </label>
                           <div className="relative">
                              <select
                                 name="gender"
                                 value={formData.gender}
                                 onChange={handleChange}
                                 className="w-full mt-1 px-3 py-2 pr-10 border-gray-300 border rounded text-sm appearance-none cursor-pointer"
                              >
                                 <option value="">Chọn giới tính</option>
                                 <option value="MALE">Nam</option>
                                 <option value="FEMALE">Nữ</option>
                                 <option value="OTHER">Khác</option>
                              </select>
                              <ChevronDown
                                 size={18}
                                 className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                              />
                           </div>
                        </div>

                        <div>
                           <label className="text-sm text-gray-500">
                              Ngày sinh
                           </label>
                           <input
                              type="date"
                              name="dateOfBirth"
                              value={formData.dateOfBirth}
                              onChange={handleChange}
                              className="w-full mt-1 px-3 py-2 border-gray-300 border rounded text-sm"
                           />
                        </div>

                        {/* Email: disabled, không submit */}
                        <div>
                           <label className="text-sm text-gray-500">
                              Email
                           </label>
                           <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="w-full mt-1 px-3 py-2 rounded bg-gray-100 text-sm cursor-not-allowed"
                           />
                        </div>

                        <div className="pt-4">
                           <button
                              type="submit"
                              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                           >
                              <Pencil size={18} />
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
