"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Mail, Lock, Phone } from "lucide-react";
import apiRequest, { ApiError, tokenManager } from "@/lib/api";

interface FormData {
   userName: string;
   email: string;
   password: string;
   confirmPassword: string;
   fullName: string;
   phone: string;
}

interface FormErrors {
   userName?: string;
   email?: string;
   password?: string;
   confirmPassword?: string;
   phone?: string;
   terms?: string;
   general?: string;
}

interface RegisterResponse {
   message: string;
   data?: {
      user: {
         id: string;
         userName: string;
         email: string;
         fullName: string;
         phone: string;
         role: string;
         createdAt: string;
      };
      accessToken: string;
   };
   errors?: {
      email?: string;
      password?: string;
      phone?: string;
      name?: string;
      categoryImage?: string;
   };
}

const RegisterForm: React.FC = () => {
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
   const [successMessage, setSuccessMessage] = useState<string>("");

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
      if (errors[name as keyof FormErrors]) {
         setErrors((prev) => ({
            ...prev,
            [name]: "",
         }));
      }
   };

   const validateForm = (): boolean => {
      const newErrors: FormErrors = {};

      if (!formData.userName.trim()) {
         newErrors.userName = "Tên đăng nhập là bắt buộc";
      } else if (formData.userName.length < 3) {
         newErrors.userName = "Tên đăng nhập phải có ít nhất 3 ký tự";
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!formData.email.trim()) {
         newErrors.email = "Email là bắt buộc";
      } else if (!emailRegex.test(formData.email)) {
         newErrors.email = "Email không hợp lệ";
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
      if (!formData.password) {
         newErrors.password = "Mật khẩu là bắt buộc";
      } else if (!passwordRegex.test(formData.password)) {
         newErrors.password =
            "Mật khẩu phải có chữ hoa, số và không chứa ký tự có dấu";
      } else if (formData.password.length < 6) {
         newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      }

      if (!formData.confirmPassword) {
         newErrors.confirmPassword = "Vui lòng nhập lại mật khẩu";
      } else if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = "Mật khẩu không khớp";
      }

      if (formData.phone && formData.phone.trim()) {
         const phoneRegex = /^(0|\+84)[0-9]{9}$/;
         if (!phoneRegex.test(formData.phone.replace(/\s/g, ""))) {
            newErrors.phone = "Số điện thoại không hợp lệ";
         }
      }

      if (!agreeTerms) {
         newErrors.terms = "Bạn phải đồng ý với điều khoản";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (): Promise<void> => {
      setSuccessMessage("");

      if (!validateForm()) {
         return;
      }

      setLoading(true);

      try {
         const registerData = {
            userName: formData.userName.trim(),
            email: formData.email.trim(),
            password: formData.password,
            fullName: formData.fullName.trim(),
            phone: formData.phone.trim(),
         };

         const data = await apiRequest.post<RegisterResponse>(
            "/auth/register",
            registerData,
            { noAuth: true },
         );

         setSuccessMessage("Đăng ký thành công!");

         if (data.data?.accessToken) {
            tokenManager.setToken(data.data.accessToken);
            console.log("✅ Đăng ký thành công, token đã được lưu");

            // Redirect sau khi đăng ký thành công
            // window.location.href = "/dashboard";
            // hoặc dùng Next.js router:
            // router.push('/dashboard');
         }

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
         console.error("Registration error:", error);

         if (error instanceof ApiError) {
            if (error.status === 400) {
               if (error.data?.errors) {
                  setErrors(error.data.errors as FormErrors);
               } else {
                  setErrors({
                     general: error.message || "Dữ liệu không hợp lệ",
                  });
               }
            } else if (error.status === 409) {
               setErrors({
                  general:
                     error.message ||
                     "Email hoặc tên đăng nhập đã được sử dụng",
               });
            } else {
               setErrors({
                  general:
                     error.message || "Đã có lỗi xảy ra. Vui lòng thử lại!",
               });
            }
         } else {
            setErrors({
               general:
                  "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng!",
            });
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="sm:pl-0 md:pl-8 lg:pl-10 lg:px-0">
         <h1 className="text-2xl mb-3 text-primary-darker text-center">
            Đăng ký
         </h1>
         <p className="text-base text-neutral-darker mb-5 md:hidden lg:block">
            Tạo tài khoản mới dành riêng cho bạn để có những trải nghiệm tốt
            nhất.
         </p>

         {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
               {errors.general}
            </div>
         )}

         {successMessage && (
            <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg text-sm">
               {successMessage}
            </div>
         )}

         <div className="space-y-4 md:mt-4">
            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Tên đăng nhập *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="text"
                     name="userName"
                     value={formData.userName}
                     onChange={handleChange}
                     placeholder="Tên đăng nhập"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.userName && (
                  <p className="mt-1 text-sm text-red-600">{errors.userName}</p>
               )}
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Họ và tên
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="text"
                     name="fullName"
                     value={formData.fullName}
                     onChange={handleChange}
                     placeholder="Nguyễn Văn A"
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
                     name="email"
                     value={formData.email}
                     onChange={handleChange}
                     placeholder="Địa chỉ Email"
                     className="w-full pl-10 pr-12 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
               )}
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Mật khẩu của bạn *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showPassword ? "text" : "password"}
                     name="password"
                     value={formData.password}
                     onChange={handleChange}
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
               {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
               )}
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Nhập lại mật khẩu *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showConfirmPassword ? "text" : "password"}
                     name="confirmPassword"
                     value={formData.confirmPassword}
                     onChange={handleChange}
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
               {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                     {errors.confirmPassword}
                  </p>
               )}
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Số điện thoại
               </label>
               <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-dark" />
                  <input
                     type="tel"
                     name="phone"
                     value={formData.phone}
                     onChange={handleChange}
                     placeholder="Số điện thoại"
                     className="w-full pl-9 pr-10 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                  />
               </div>
               {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
               )}
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
            {errors.terms && (
               <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
            )}

            <button
               type="button"
               onClick={handleSubmit}
               disabled={loading}
               className="w-full bg-accent text-primary-darker py-3 rounded-lg font-medium hover:bg-accent-hover active:bg-accent-active transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
         </div>
      </div>
   );
};

export default RegisterForm;
