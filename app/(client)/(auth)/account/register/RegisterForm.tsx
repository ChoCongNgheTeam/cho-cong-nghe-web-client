"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";

const RegisterForm = () => {
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [agreeTerms, setAgreeTerms] = useState(false);

   return (
      <div className="sm:pl-0 md:pl-8 lg:pl-10 lg:px-0">
         <h1 className="text-3xl mb-3 text-primary-darker md:text-2xl text-center">
            Đăng ký
         </h1>
         <p className="text-base sm:text-lg text-neutral-darker mb-6 sm:mb-8 md:hidden lg:block">
            Tạo tài khoản mới dành riêng cho bạn để có những trải nghiệm tốt
            nhất.
         </p>

         <form className="space-y-5 sm:space-y-6 md:mt-4">
            <div>
               <label className="block mb-2 text-primary text-base sm:text-lg">
                  Tên đăng nhập *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="text"
                     placeholder="Tên đăng nhập"
                     className="w-full pl-10 pr-12 py-3 sm:py-3.5 text-base sm:text-lg border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-2 text-primary text-base sm:text-lg">
                  Email *
               </label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="email"
                     placeholder="Địa chỉ Email"
                     className="w-full pl-10 pr-12 py-3 sm:py-3.5 text-base sm:text-lg border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-2 text-primary text-base sm:text-lg">
                  Mật khẩu của bạn *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showPassword ? "text" : "password"}
                     placeholder="Mật khẩu của bạn"
                     className="w-full pl-10 pr-12 py-3 sm:py-3.5 text-base sm:text-lg border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </div>

            <div>
               <label className="block mb-2 text-primary text-base sm:text-lg">
                  Nhập lại mật khẩu *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Nhập lại mật khẩu"
                     className="w-full pl-10 pr-12 py-3 sm:py-3.5 text-base sm:text-lg border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
                  <button
                     type="button"
                     onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                     }
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
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
               <label className="block mb-2 text-primary text-base sm:text-lg">
                  Số điện thoại
               </label>
               <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="tel"
                     placeholder="Số điện thoại"
                     className="w-full pl-10 pr-12 py-3 sm:py-3.5 text-base sm:text-lg border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
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
               <span className="text-sm sm:text-base text-neutral-darker">
                  Bạn đồng ý với tất cả{" "}
                  <a
                     href="#"
                     className="text-accent hover:text-accent-hover hover:underline"
                  >
                     điều khoản
                  </a>
                  .
               </span>
            </label>

            <button className="w-full bg-primary dark:bg-accent text-white dark:text-primary-darker py-3 sm:py-3.5 rounded-lg font-medium hover:bg-primary-hover dark:hover:bg-accent-hover active:bg-primary-dark dark:active:bg-accent-active transition cursor-pointer text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed">
               Đăng ký
            </button>
         </form>
      </div>
   );
};

export default RegisterForm;
