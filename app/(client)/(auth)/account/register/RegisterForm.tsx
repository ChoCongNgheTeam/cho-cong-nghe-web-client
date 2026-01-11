"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";

const RegisterForm = () => {
   const [showPassword, setShowPassword] = useState(false);
   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
   const [agreeTerms, setAgreeTerms] = useState(false);

   return (
      <div className="sm:pl-0 md:pl-8 lg:pl-10 lg:px-0">
         <h1 className="text-2xl mb-3 text-primary-darker text-center">
            Đăng ký
         </h1>
         <p className="text-base text-neutral-darker mb-5 md:hidden lg:block">
            Tạo tài khoản mới dành riêng cho bạn để có những trải nghiệm tốt
            nhất.
         </p>

         <form className="space-y-4 md:mt-4">
            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Tên đăng nhập *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="text"
                     placeholder="Tên đăng nhập"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Email *
               </label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="email"
                     placeholder="Địa chỉ Email"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Mật khẩu của bạn *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showPassword ? "text" : "password"}
                     placeholder="Mật khẩu của bạn"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
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
               <label className="block mb-1.5 text-primary text-base">
                  Nhập lại mật khẩu *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Nhập lại mật khẩu"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
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
               <label className="block mb-1.5 text-primary text-base">
                  Số điện thoại
               </label>
               <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
                  <input
                     type="tel"
                     placeholder="Số điện thoại"
                     className="w-full pl-9 pr-10 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <label className="flex items-start cursor-pointer">
               <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 mr-2 w-4 h-4 shrink-0 accent-accent"
               />
               <span className="text-base text-neutral-darker">
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
            <button className="w-full bg-accent text-primary-darker py-3 rounded-lg font-medium hover:bg-accent-hover active:bg-accent-active transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed">
               Đăng ký
            </button>
         </form>
      </div>
   );
};

export default RegisterForm;
