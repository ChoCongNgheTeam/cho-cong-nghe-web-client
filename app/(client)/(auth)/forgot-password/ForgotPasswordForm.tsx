"use client";

import { useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import apiRequest, { ApiError } from "@/lib/api";
import { AuthContext } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";

export default function ForgotPasswordForm() {
   const [email, setEmail] = useState("");
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);

   const { isAuthenticated, loading: authLoading } = useAuth(); // ✅
   const router = useRouter();

   useEffect(() => {
      if (!authLoading && isAuthenticated) {
         router.replace("/");
      }
   }, [authLoading, isAuthenticated, router]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setMessage(null);

      if (!email) {
         setError("Vui lòng nhập email");
         return;
      }

      try {
         setLoading(true);

         const res = await apiRequest.post<{ message: string }>(
            "/auth/forgot-password",
            { email },
            { noAuth: true }, // endpoint public
         );

         // API luôn trả message chung để tránh lộ email tồn tại hay không
         setMessage(res.message);
      } catch (err) {
         if (err instanceof ApiError) {
            if (err.status === 400) {
               setError(err.data?.errors?.email || err.message);
            } else if (err.status === 429) {
               setError(err.message);
            } else {
               setError("Có lỗi xảy ra, vui lòng thử lại");
            }
         } else {
            setError("Không thể kết nối đến server");
         }
      } finally {
         setLoading(false);
      }
   };

   return (
      <form onSubmit={handleSubmit} className="space-y-4">
         <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn"
            className="w-full rounded-md border px-3 py-2 text-sm"
            disabled={loading}
         />

         {message && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
               {message}
            </div>
         )}

         {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
               {error}
            </div>
         )}

         <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-primary py-2.5 text-sm text-neutral hover:bg-primary-dark-hover disabled:opacity-50"
         >
            {loading ? "Đang gửi..." : "Gửi liên kết đặt lại mật khẩu"}
         </button>
      </form>
   );
}
