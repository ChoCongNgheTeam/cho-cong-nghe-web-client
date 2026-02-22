"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { useToasty } from "@/components/Toast";
import apiRequest from "@/lib/api";
import { AuthContext } from "@/contexts/AuthContext";
import Breadcrumb from "@/components/layout/Breadcrumb/Breadcrumb";

type ErrorType =
   | "token_expired"
   | "token_used"
   | "invalid_token"
   | "missing_token"
   | "server_error";

const ERROR_MESSAGES: Record<ErrorType, string> = {
   token_expired: "Link đã hết hạn. Vui lòng yêu cầu lại.",
   token_used: "Link đã được sử dụng. Vui lòng yêu cầu link mới.",
   invalid_token: "Link không hợp lệ.",
   missing_token: "Không tìm thấy token.",
   server_error: "Đã có lỗi xảy ra. Vui lòng thử lại sau.",
};

export default function ResetPasswordPage() {
   const searchParams = useSearchParams();
   const router = useRouter();
   const toast = useToasty();
   const auth = useContext(AuthContext);

   const token = searchParams.get("token");
   const error = searchParams.get("error");

   const [newPassword, setNewPassword] = useState("");
   const [confirmPassword, setConfirmPassword] = useState("");
   const [loading, setLoading] = useState(false);

   useEffect(() => {
      if (!auth?.loading && auth?.isAuthenticated) {
         router.replace("/");
      }
   }, [auth?.loading, auth?.isAuthenticated, router]);

   useEffect(() => {
      if (error) {
         toast.error(ERROR_MESSAGES[error as ErrorType] || "Có lỗi xảy ra", {
            title: "Link không hợp lệ",
         });
      }
   }, [error]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!token) {
         toast.error("Token không hợp lệ");
         return;
      }

      if (newPassword !== confirmPassword) {
         toast.error("Mật khẩu không khớp");
         return;
      }

      if (newPassword.length < 6) {
         toast.error("Mật khẩu phải có ít nhất 6 ký tự");
         return;
      }

      setLoading(true);

      try {
         await apiRequest.post(
            "/auth/reset-password",
            { token, password: newPassword, confirmPassword },
            { noAuth: true },
         );

         toast.success("Mật khẩu đã được đặt lại thành công!", {
            title: "Thành công",
         });

         setTimeout(() => {
            router.push("/account?login");
         }, 2000);
      } catch (error) {
         const errorMessage =
            (error as any)?.data?.message ||
            (error as any)?.message ||
            "Không thể đặt lại mật khẩu. Vui lòng thử lại.";

         toast.error(errorMessage, { title: "Lỗi" });
      } finally {
         setLoading(false);
      }
   };

   if (auth?.loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-neutral-light">
            <div className="animate-spin h-8 w-8 rounded-full border-4 border-primary border-t-transparent" />
         </div>
      );
   }

   if (!token || error) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-neutral-light">
            <div className="max-w-md w-full p-8 bg-neutral-light border border-neutral rounded-lg shadow-lg">
               <Breadcrumb
                  items={[
                     { label: "Trang chủ", href: "/" },
                     { label: "Quên mật khẩu", href: "/forgot-password" },
                     { label: "Đặt lại mật khẩu" },
                  ]}
               />
               <h1 className="text-2xl font-bold text-promotion mb-4">
                  Link không hợp lệ
               </h1>
               <p className="text-primary-light mb-6">
                  Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
               </p>
               <button
                  onClick={() => router.push("/forgot-password")}
                  className="w-full bg-primary text-neutral-light py-3 rounded-lg hover:bg-primary-hover transition-colors duration-200"
               >
                  Yêu cầu link mới
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
         <div className="max-w-md w-full p-8 bg-neutral-light border border-neutral rounded-lg shadow-lg">
            <Breadcrumb
               items={[
                  { label: "Trang chủ", href: "/" },
                  { label: "Quên mật khẩu", href: "/forgot-password" },
                  { label: "Đặt lại mật khẩu" },
               ]}
            />
            <h1 className="text-2xl font-bold text-primary mb-6">
               Đặt lại mật khẩu
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
               <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                     Mật khẩu mới
                  </label>
                  <input
                     type="password"
                     value={newPassword}
                     onChange={(e) => setNewPassword(e.target.value)}
                     className="w-full px-4 py-3 border border-neutral rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                     placeholder="Nhập mật khẩu mới"
                     required
                  />
               </div>

               <div>
                  <label className="block mb-2 text-sm font-medium text-primary">
                     Xác nhận mật khẩu
                  </label>
                  <input
                     type="password"
                     value={confirmPassword}
                     onChange={(e) => setConfirmPassword(e.target.value)}
                     className="w-full px-4 py-3 border border-neutral rounded-lg bg-neutral-light text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200"
                     placeholder="Nhập lại mật khẩu"
                     required
                  />
               </div>

               <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-neutral-light py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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
                     "Đặt lại mật khẩu"
                  )}
               </button>
            </form>

            <div className="mt-4 p-3 bg-accent-light border border-accent-light-active rounded-lg">
               <p className="text-xs text-primary-light">
                  <span className="font-semibold text-primary">
                     Yêu cầu mật khẩu:
                  </span>
                  <br />
                  <span className="text-primary"> • Tối thiểu 6 ký tự</span>
                  <br />
                  <span className="text-primary">
                     {" "}
                     • Nên bao gồm chữ hoa, chữ thường và số
                  </span>
               </p>
            </div>
         </div>
      </div>
   );
}
