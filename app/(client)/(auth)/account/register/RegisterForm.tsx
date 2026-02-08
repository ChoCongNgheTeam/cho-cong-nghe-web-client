"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import { useRouter } from "next/navigation";
import apiRequest, { ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { useToasty } from "@/components/Toast";
import {
   BackendErrorResponse,
   FormData,
   FormErrors,
   RegisterResponse,
} from "./types";

const RegisterForm: React.FC = () => {
   const { login } = useAuth();
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
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));

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

      const trimmedUserName = formData.userName.trim();
      if (!trimmedUserName) {
         newErrors.userName = "Tên đăng nhập là bắt buộc";
      } else if (trimmedUserName.length < 3) {
         newErrors.userName = "Tên đăng nhập phải có ít nhất 3 ký tự";
      } else if (!/^[a-zA-Z0-9_]+$/.test(trimmedUserName)) {
         newErrors.userName = "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới";
      }

      const trimmedEmail = formData.email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!trimmedEmail) {
         newErrors.email = "Email là bắt buộc";
      } else if (!emailRegex.test(trimmedEmail)) {
         newErrors.email = "Email không hợp lệ";
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
      if (!formData.password) {
         newErrors.password = "Mật khẩu là bắt buộc";
      } else if (formData.password.length < 6) {
         newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      } else if (!passwordRegex.test(formData.password)) {
         newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa và 1 số";
      }

      if (!formData.confirmPassword) {
         newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      } else if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = "Mật khẩu không khớp";
      }

      const trimmedPhone = formData.phone.trim();
      if (trimmedPhone) {
         const phoneRegex = /^(0|\+84)[0-9]{9}$/;
         const cleanPhone = trimmedPhone.replace(/\s/g, "");
         if (!phoneRegex.test(cleanPhone)) {
            newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
         }
      }

      if (!agreeTerms) {
         newErrors.terms = "Bạn phải đồng ý với điều khoản";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
      e?.preventDefault();
      setErrors({});

      if (!validateForm()) {
         return;
      }

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

         if (!response.data) {
            throw new Error("Dữ liệu phản hồi không hợp lệ");
         }

         toast.success("Đăng ký thành công!", {
            title: "Chào mừng bạn!",
            description: `Tài khoản ${response.data.userName} đã được tạo thành công. Đang chuyển hướng...`,
            duration: 5000,
            showProgress: true,
            pauseOnHover: true,
         });

         // Reset form
         setFormData({
            userName: "",
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            phone: "",
         });
         setAgreeTerms(false);
         await login({
            id: response.data.id,
            email: response.data.email,
            userName: response.data.userName,
            fullName: response.data.fullName,
            role: response.data.role,
            avatarImage: response.data.avatarImage,
         });
      } catch (error) {
         if (error instanceof ApiError) {
            const errorData = error.data as BackendErrorResponse | undefined;

            if (error.status === 400) {
               if (errorData?.errors) {
                  const backendErrors: FormErrors = {};
                  Object.entries(errorData.errors).forEach(([key, value]) => {
                     if (value && key in formData) {
                        backendErrors[key as keyof FormErrors] = value;
                     }
                  });

                  toast.error("Dữ liệu không hợp lệ", {
                     title: "Lỗi xác thực",
                     description: "Vui lòng kiểm tra lại thông tin đã nhập",
                     duration: 4000,
                     showProgress: true,
                  });
               } else {
                  toast.error(errorData?.message || "Dữ liệu không hợp lệ", {
                     title: "Lỗi xác thực",
                     duration: 4000,
                  });
               }
            } else if (error.status === 409) {
               const message =
                  errorData?.message ||
                  "Email hoặc tên đăng nhập đã được sử dụng";

               toast.error(message, {
                  title: "Tài khoản đã tồn tại",
                  duration: 4000,
                  showProgress: true,
               });
            } else if (error.status >= 500) {
               toast.error("Lỗi máy chủ. Vui lòng thử lại sau!", {
                  title: "Lỗi hệ thống",
                  duration: 5000,
                  showProgress: true,
               });
            } else {
               const message =
                  errorData?.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
               toast.error(message, {
                  title: "Có lỗi xảy ra",
                  duration: 4000,
               });
            }
         } else if (error instanceof Error) {
            let message =
               error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!";
            if (
               error.message.includes("kết nối") ||
               error.message.includes("network")
            ) {
               message =
                  "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!";
            }

            toast.error(message, {
               title: "Lỗi kết nối",
               duration: 5000,
               showProgress: true,
            });
         } else {
            toast.error("Đã có lỗi không xác định", {
               title: "Lỗi",
               description: "Vui lòng thử lại sau",
               duration: 4000,
            });
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

         <form onSubmit={handleSubmit} className="space-y-4 md:mt-4">
            {/* Username */}
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.userName}
                  </p>
               )}
            </div>

            {/* Full Name */}
            <div>
               <label
                  htmlFor="fullName"
                  className="block mb-1.5 text-primary text-base"
               >
                  Họ và tên
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

            {/* Email */}
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.email}
                  </p>
               )}
            </div>

            {/* Password */}
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.password}
                  </p>
               )}
            </div>

            {/* Confirm Password */}
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.confirmPassword}
                  </p>
               )}
            </div>

            {/* Phone */}
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.phone}
                  </p>
               )}
            </div>

            {/* Terms */}
            <div>
               <label
                  htmlFor="agreeTerms"
                  className="flex items-start cursor-pointer"
               >
                  <input
                     id="agreeTerms"
                     type="checkbox"
                     checked={agreeTerms}
                     onChange={(e) => setAgreeTerms(e.target.checked)}
                     className="mt-0.5 mr-2 w-4 h-4 shrink-0 accent-accent"
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
                  <p className="mt-1 text-sm text-red-600" role="alert">
                     {errors.terms}
                  </p>
               )}
            </div>

            {/* Submit Button */}
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
