"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import apiRequest, { ApiError } from "@/lib/api";
import Link from "next/link";
import { useToasty } from "@/components/Toast";
import {
   BackendErrorResponse,
   FormData,
   FormErrors,
   RegisterResponse,
} from "./types";
import {
   validateUserName,
   validatePassword,
   validateConfirmPassword,
   validateEmail,
   validatePhone,
   VALIDATION_MESSAGES,
} from "../validators";

const RegisterForm: React.FC = () => {
   const toast = useToasty();
   const [showPassword, setShowPassword] = useState<boolean>(false);
   const [showConfirmPassword, setShowConfirmPassword] =
      useState<boolean>(false);
   const [agreeTerms, setAgreeTerms] = useState<boolean>(false);
   const [loading, setLoading] = useState<boolean>(false);
   const [formData, setFormData] = useState<FormData>({
      userName: "",
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      phone: "",
   });
   const [errors, setErrors] = useState<FormErrors>({});

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      let newValue = value;
      if (name === "phone") {
         const cleaned = value.replace(/[^0-9+]/g, "");
         const maxLen = cleaned.startsWith("+84") ? 12 : 10;
         newValue = cleaned.slice(0, maxLen);
      }
      setFormData((prev) => ({ ...prev, [name]: newValue }));
      if (errors[name as keyof FormErrors]) {
         setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name as keyof FormErrors];
            return newErrors;
         });
      }
   };

   const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      const userNameError = validateUserName(formData.userName);
      if (userNameError) newErrors.userName = userNameError;

      const emailError = validateEmail(formData.email);
      if (emailError) newErrors.email = emailError;

      const passwordError = validatePassword(formData.password);
      if (passwordError) newErrors.password = passwordError;

      const confirmPasswordError = validateConfirmPassword(
         formData.password,
         formData.confirmPassword,
      );
      if (confirmPasswordError)
         newErrors.confirmPassword = confirmPasswordError;

      const phoneError = validatePhone(formData.phone);
      if (phoneError) newErrors.phone = phoneError;

      if (!agreeTerms) newErrors.terms = VALIDATION_MESSAGES.terms.required;

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
      e?.preventDefault();
      setErrors({});

      if (!validateForm()) return;

      setLoading(true);
      try {
         const registerData = {
            userName: formData.userName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim() || undefined,
            phone: formData.phone.trim() || undefined,
         };

         const response = await apiRequest.post<RegisterResponse>(
            "/auth/register",
            registerData,
            { noAuth: true },
         );

         if (!response.data) throw new Error("Dữ liệu phản hồi không hợp lệ");

         toast.success("Đăng ký thành công!", {
            title: "Chào mừng bạn!",
            description: `Tài khoản ${response.data.userName} đã được tạo thành công. Đang chuyển hướng...`,
            duration: 5000,
            showProgress: true,
            pauseOnHover: true,
         });

         setFormData({
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: "",
         });
         setAgreeTerms(false);
      } catch (error) {
         if (error instanceof ApiError) {
            const errorData = error.data as BackendErrorResponse | undefined;
            const message = errorData?.message;

            if (error.status === 400) {
               if (errorData?.errors) {
                  const backendErrors: FormErrors = {};
                  Object.entries(errorData.errors).forEach(([key, value]) => {
                     if (value && key in formData) {
                        backendErrors[key as keyof FormErrors] = value;
                     }
                  });
                  setErrors(backendErrors);
               }
               toast.error(message || "Dữ liệu không hợp lệ", {
                  title: "Lỗi xác thực",
                  duration: 4000,
                  showProgress: true,
               });
            } else if (error.status === 409) {
               toast.error(
                  message || "Email hoặc tên đăng nhập đã được sử dụng",
                  {
                     title: "Tài khoản đã tồn tại",
                     duration: 4000,
                     showProgress: true,
                  },
               );
            } else if (error.status >= 500) {
               toast.error(message || "Lỗi máy chủ. Vui lòng thử lại sau!", {
                  title: "Lỗi hệ thống",
                  duration: 5000,
                  showProgress: true,
               });
            } else {
               toast.error(message || "Đã có lỗi xảy ra. Vui lòng thử lại!", {
                  title: "Có lỗi xảy ra",
                  duration: 4000,
               });
            }
         } else {
            const msg =
               error instanceof Error
                  ? error.message
                  : "Đã có lỗi không xác định";
            toast.error(
               msg.includes("network") || msg.includes("kết nối")
                  ? "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!"
                  : msg,
               { title: "Lỗi", duration: 5000, showProgress: true },
            );
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="sm:pl-0 md:pl-8 lg:pl-10 lg:px-0">
         <h1 className="text-2xl mb-3 text-primary text-center">Đăng ký</h1>
         <p className="text-base text-neutral-darker mb-5 md:hidden lg:block">
            Tạo tài khoản mới dành riêng cho bạn để có những trải nghiệm tốt
            nhất.
         </p>

         {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
               {errors.general}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-4 md:mt-4 p-4">
            <div>
               <label
                  htmlFor="userName"
                  className="block mb-1.5 text-primary text-base"
               >
                  Tên đăng nhập *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="userName"
                     type="text"
                     name="userName"
                     value={formData.userName}
                     onChange={handleChange}
                     placeholder="Tên đăng nhập"
                     autoComplete="username"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.userName && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.userName}
                  </p>
               )}
            </div>

            <div>
               <label
                  htmlFor="fullName"
                  className="block mb-1.5 text-primary text-base"
               >
                  Họ và tên *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="fullName"
                     type="text"
                     name="fullName"
                     value={formData.fullName}
                     onChange={handleChange}
                     placeholder="Nguyễn Văn A"
                     autoComplete="name"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
            </div>

            <div>
               <label
                  htmlFor="email"
                  className="block mb-1.5 text-primary text-base"
               >
                  Email *
               </label>
               <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="email"
                     type="email"
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     placeholder="Địa chỉ Email"
                     autoComplete="email"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.email && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.email}
                  </p>
               )}
            </div>

            <div>
               <label
                  htmlFor="password"
                  className="block mb-1.5 text-primary text-base"
               >
                  Mật khẩu của bạn *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="password"
                     type={showPassword ? "text" : "password"}
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
                     placeholder="Mật khẩu của bạn"
                     autoComplete="new-password"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
               {errors.password && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.password}
                  </p>
               )}
            </div>

            <div>
               <label
                  htmlFor="confirmPassword"
                  className="block mb-1.5 text-primary text-base"
               >
                  Nhập lại mật khẩu *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="confirmPassword"
                     type={showConfirmPassword ? "text" : "password"}
                     name="confirmPassword"
                     value={formData.confirmPassword}
                     onChange={handleChange}
                     placeholder="Nhập lại mật khẩu"
                     autoComplete="new-password"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
                  <button
                     type="button"
                     onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                     }
                     aria-label={
                        showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
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
               {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.confirmPassword}
                  </p>
               )}
            </div>

            <div>
               <label
                  htmlFor="phone"
                  className="block mb-1.5 text-primary text-base"
               >
                  Số điện thoại
               </label>
               <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     id="phone"
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleChange}
                     placeholder="Số điện thoại"
                     autoComplete="tel"
                     className="w-full pl-10 pr-10 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.phone && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.phone}
                  </p>
               )}
            </div>

            <div>
               <label className="flex items-start cursor-pointer gap-2">
                  <input
                     id="agreeTerms"
                     type="checkbox"
                     checked={agreeTerms}
                     onChange={(e) => setAgreeTerms(e.target.checked)}
                     className="mt-0.5 w-4 h-4 shrink-0 accent-accent"
                  />
                  <span className="text-base text-neutral-darker">
                     Bạn đồng ý với tất cả{" "}
                     <Link
                        href="/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-accent hover:text-accent-hover hover:underline"
                     >
                        điều khoản
                     </Link>
                     .
                  </span>
               </label>
               {errors.terms && (
                  <p className="mt-1 text-sm text-promotion" role="alert">
                     {errors.terms}
                  </p>
               )}
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-primary-dark text-neutral-light py-3 rounded-lg font-medium hover:bg-primary-hover transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
         </form>
      </div>
   );
};

export default RegisterForm;
