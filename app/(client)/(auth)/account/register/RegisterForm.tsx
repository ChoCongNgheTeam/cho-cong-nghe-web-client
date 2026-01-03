"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";

const RegisterForm = () => {
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [agreeTerms, setAgreeTerms] = useState(false);

   return (
      <div className="sm:pl-0 md:pl-8 lg:pl-10 lg:px-0">
         <h1 className="text-2xl sm:text-3xl mb-2">Đăng ký</h1>
         <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Tạo tài khoản mới dành riêng cho bạn để có những trải nghiệm tốt
            nhất.
         </p>

         <form className="space-y-4 sm:space-y-6">
            <div>
               <label className="block mb-2">Tên đăng nhập *</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type="text"
                     placeholder="Tên đăng nhập"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-2">Email *</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type="email"
                     placeholder="Địa chỉ Email"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-2">Mật khẩu của bạn *</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type={showPassword ? "text" : "password"}
                     placeholder="Mật khẩu của bạn"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </div>

            <div>
               <label className="block mb-2">Nhập lại mật khẩu *</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Nhập lại mật khẩu"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
                  <button
                     type="button"
                     onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                     }
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                  >
                     {showConfirmPassword ? (
                        <EyeOff size={20} />
                     ) : (
                        <Eye size={20} />
                     )}
                  </button>
               </div>
            </div>

            <div>
               <label className="block mb-2">Số điện thoại</label>
               <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type="tel"
                     placeholder="Số điện thoại"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent"
                  />
               </div>
            </div>

            <label className="flex items-start cursor-pointer">
               <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 sm:mt-1 mr-2 w-4 h-4 shrink-0 accent-accent"
               />
               <span className="text-xs sm:text-sm text-gray-600">
                  Bạn đồng ý với tất cả{" "}
                  <a href="#" className="text-blue-600 hover:underline">
                     điều khoản
                  </a>
                  .
               </span>
            </label>

            <button className="w-full bg-primary text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-primary-hover active:bg-primary-dark transition cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed">
               Đăng ký
            </button>
         </form>
      </div>
   );
};

export default RegisterForm;
