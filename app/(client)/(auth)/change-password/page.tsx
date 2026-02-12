"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react";

export default function ChangePasswordPage() {
   const router = useRouter();
   const toast = useToasty();

   const [formData, setFormData] = useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
   });

   const [showPassword, setShowPassword] = useState({
      current: false,
      new: false,
      confirm: false,
   });

   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState<Record<string, string>>({});

   // Password validation
   const validatePassword = (password: string) => {
      const validations = {
         length: password.length >= 8,
         uppercase: /[A-Z]/.test(password),
         lowercase: /[a-z]/.test(password),
         number: /[0-9]/.test(password),
         special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      };

      return validations;
   };

   const passwordStrength = validatePassword(formData.newPassword);
   const strengthScore = Object.values(passwordStrength).filter(Boolean).length;

   const getStrengthColor = () => {
      if (strengthScore <= 2) return "bg-promotion";
      if (strengthScore <= 3) return "bg-accent";
      if (strengthScore <= 4) return "bg-accent";
      return "bg-green-500";
   };

   const getStrengthText = () => {
      if (strengthScore <= 2) return "Yếu";
      if (strengthScore <= 3) return "Trung bình";
      if (strengthScore <= 4) return "Khá";
      return "Mạnh";
   };

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Clear error for this field
      if (errors[name]) {
         setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
         });
      }
   };

   const validateForm = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!formData.currentPassword) {
         newErrors.currentPassword = "Vui lòng nhập mật khẩu hiện tại";
      }

      if (!formData.newPassword) {
         newErrors.newPassword = "Vui lòng nhập mật khẩu mới";
      } else if (formData.newPassword.length < 8) {
         newErrors.newPassword = "Mật khẩu phải có ít nhất 8 ký tự";
      } else if (formData.newPassword === formData.currentPassword) {
         newErrors.newPassword = "Mật khẩu mới phải khác mật khẩu hiện tại";
      }

      if (!formData.confirmPassword) {
         newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
      } else if (formData.newPassword !== formData.confirmPassword) {
         newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      setLoading(true);

      try {
         await apiRequest.post("/auth/change-password", {
            currentPassword: formData.currentPassword,
            newPassword: formData.newPassword,
            confirmPassword: formData.confirmPassword,
         });

         toast.success("Mật khẩu đã được thay đổi thành công!", {
            title: "Thành công",
         });

         // Reset form
         setFormData({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
         });

         // Optionally redirect after success
         setTimeout(() => {
            router.push("/account");
         }, 2000);
      } catch (error) {
         console.error("❌ Lỗi đổi mật khẩu:", error);

         const errorMessage =
            (error as { data?: { message?: string }; message?: string })?.data
               ?.message ||
            (error as { message?: string })?.message ||
            "Không thể đổi mật khẩu. Vui lòng thử lại.";

         toast.error(errorMessage, {
            title: "Lỗi",
         });

         // If current password is wrong, highlight that field
         if (errorMessage.toLowerCase().includes("mật khẩu hiện tại")) {
            setErrors({ currentPassword: "Mật khẩu hiện tại không đúng" });
         }
      } finally {
         setLoading(false);
      }
   };

   const toggleShowPassword = (field: "current" | "new" | "confirm") => {
      setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
   };

   return (
      <div className="min-h-screen bg-neutral-light py-12">
         <div className="container max-w-2xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
               <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-primary hover:text-primary transition-colors mb-4 cursor-pointer"
               >
                  <svg
                     className="w-5 h-5"
                     fill="none"
                     stroke="currentColor"
                     viewBox="0 0 24 24"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                     />
                  </svg>
                  Quay lại
               </button>
               <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent-light rounded-lg">
                     <Lock className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-primary">
                        Đổi mật khẩu
                     </h1>
                     <p className="text-sm text-primary mt-1">
                        Cập nhật mật khẩu để bảo mật tài khoản của bạn
                     </p>
                  </div>
               </div>
            </div>

            {/* Main Form Card */}
            <div className="bg-neutral-light border border-neutral rounded-lg shadow-lg p-8">
               <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Current Password */}
                  <div>
                     <label
                        htmlFor="currentPassword"
                        className="block mb-2 text-sm font-medium text-primary"
                     >
                        Mật khẩu hiện tại
                     </label>
                     <div className="relative">
                        <input
                           type={showPassword.current ? "text" : "password"}
                           id="currentPassword"
                           name="currentPassword"
                           value={formData.currentPassword}
                           onChange={handleChange}
                           className={`w-full px-4 py-3 pr-12 border rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 ${
                              errors.currentPassword
                                 ? "border-promotion"
                                 : "border-neutral"
                           }`}
                           placeholder="Nhập mật khẩu hiện tại"
                        />
                        <button
                           type="button"
                           onClick={() => toggleShowPassword("current")}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
                        >
                           {showPassword.current ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>
                     {errors.currentPassword && (
                        <p className="mt-1 text-sm text-promotion">
                           {errors.currentPassword}
                        </p>
                     )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-neutral"></div>

                  {/* New Password */}
                  <div>
                     <label
                        htmlFor="newPassword"
                        className="block mb-2 text-sm font-medium text-primary"
                     >
                        Mật khẩu mới
                     </label>
                     <div className="relative">
                        <input
                           type={showPassword.new ? "text" : "password"}
                           id="newPassword"
                           name="newPassword"
                           value={formData.newPassword}
                           onChange={handleChange}
                           className={`w-full px-4 py-3 pr-12 border rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 ${
                              errors.newPassword
                                 ? "border-promotion"
                                 : "border-neutral"
                           }`}
                           placeholder="Nhập mật khẩu mới"
                        />
                        <button
                           type="button"
                           onClick={() => toggleShowPassword("new")}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
                        >
                           {showPassword.new ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>
                     {errors.newPassword && (
                        <p className="mt-1 text-sm text-promotion">
                           {errors.newPassword}
                        </p>
                     )}

                     {/* Password Strength Indicator */}
                     {formData.newPassword && (
                        <div className="mt-3">
                           <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-primary-light">
                                 Độ mạnh mật khẩu
                              </span>
                              <span
                                 className={`text-xs font-medium ${
                                    strengthScore <= 2
                                       ? "text-promotion"
                                       : strengthScore <= 3
                                         ? "text-accent"
                                         : strengthScore <= 4
                                           ? "text-accent"
                                           : "text-green-500"
                                 }`}
                              >
                                 {getStrengthText()}
                              </span>
                           </div>
                           <div className="flex gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map((level) => (
                                 <div
                                    key={level}
                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                       level <= strengthScore
                                          ? getStrengthColor()
                                          : "bg-neutral"
                                    }`}
                                 />
                              ))}
                           </div>

                           {/* Password Requirements */}
                           <div className="space-y-1.5">
                              <PasswordRequirement
                                 met={passwordStrength.length}
                                 text="Ít nhất 8 ký tự"
                              />
                              <PasswordRequirement
                                 met={passwordStrength.uppercase}
                                 text="Chứa chữ hoa (A-Z)"
                              />
                              <PasswordRequirement
                                 met={passwordStrength.lowercase}
                                 text="Chứa chữ thường (a-z)"
                              />
                              <PasswordRequirement
                                 met={passwordStrength.number}
                                 text="Chứa số (0-9)"
                              />
                              <PasswordRequirement
                                 met={passwordStrength.special}
                                 text="Chứa ký tự đặc biệt (!@#$...)"
                              />
                           </div>
                        </div>
                     )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                     <label
                        htmlFor="confirmPassword"
                        className="block mb-2 text-sm font-medium text-primary"
                     >
                        Xác nhận mật khẩu mới
                     </label>
                     <div className="relative">
                        <input
                           type={showPassword.confirm ? "text" : "password"}
                           id="confirmPassword"
                           name="confirmPassword"
                           value={formData.confirmPassword}
                           onChange={handleChange}
                           className={`w-full px-4 py-3 pr-12 border rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 ${
                              errors.confirmPassword
                                 ? "border-promotion"
                                 : "border-neutral"
                           }`}
                           placeholder="Nhập lại mật khẩu mới"
                        />
                        <button
                           type="button"
                           onClick={() => toggleShowPassword("confirm")}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary transition-colors"
                        >
                           {showPassword.confirm ? (
                              <EyeOff className="w-5 h-5" />
                           ) : (
                              <Eye className="w-5 h-5" />
                           )}
                        </button>
                     </div>
                     {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-promotion">
                           {errors.confirmPassword}
                        </p>
                     )}
                  </div>

                  {/* Security Notice */}
                  <div className="flex gap-3 p-4 bg-accent-light border border-accent-light-active rounded-lg">
                     <ShieldCheck className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                     <div className="text-sm text-primary-light">
                        <p className="font-medium text-primary mb-1">
                           Lưu ý bảo mật
                        </p>
                        <ul className="space-y-1 text-xs">
                           <li className="text-primary">
                              • Không chia sẻ mật khẩu với bất kỳ ai
                           </li>
                           <li className="text-primary">
                              • Sử dụng mật khẩu khác nhau cho mỗi tài khoản
                           </li>
                           <li className="text-primary">
                              • Thay đổi mật khẩu định kỳ để bảo mật tốt hơn
                           </li>
                        </ul>
                     </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                     <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 px-6 py-3 border border-neutral text-primary rounded-lg font-medium hover:bg-neutral-light-hover transition-colors duration-200 cursor-pointer"
                     >
                        Hủy
                     </button>
                     <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-6 py-3 bg-primary text-neutral-light rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 cursor-pointer"
                     >
                        {loading ? (
                           <span className="flex items-center justify-center gap-2">
                              <svg
                                 className="animate-spin h-5 w-5"
                                 xmlns="http://www.w3.org/2000/svg"
                                 fill="none"
                                 viewBox="0 0 24 24"
                              >
                                 <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                 />
                                 <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                 />
                              </svg>
                              Đang xử lý...
                           </span>
                        ) : (
                           "Đổi mật khẩu"
                        )}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
}

function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
   return (
      <div className="flex items-center gap-2">
         <div
            className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
               met ? "bg-green-500" : "bg-neutral"
            }`}
         >
            {met && (
               <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     strokeWidth={3}
                     d="M5 13l4 4L19 7"
                  />
               </svg>
            )}
         </div>
         <span
            className={`text-xs transition-colors ${
               met ? "text-primary" : "text-primary-light"
            }`}
         >
            {text}
         </span>
      </div>
   );
}
