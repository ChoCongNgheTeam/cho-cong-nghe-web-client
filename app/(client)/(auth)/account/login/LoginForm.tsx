"use client";
import React, { useState } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import apiRequest, { tokenManager } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
interface User {
   id: string;
   email: string;
   userName: string;
   fullName: string;
   role: string;
}

interface LoginResponse {
   data: {
      user: User;
      token: string;
   };
   message?: string;
   success?: boolean;
}

const LoginForm = () => {
   const [showPassword, setShowPassword] = useState(false);
   const [userName, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState("");

   const { login } = useAuth();

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
         const response = await apiRequest.post<LoginResponse>(
            "/auth/login",
            {
               userName,
               password,
            },
            { noAuth: true }
         );
         if (response?.data?.user && response?.data?.token) {
            tokenManager.setToken(response.data.token);
            await login(response.data.user);
         } else {
            setError("Dữ liệu đăng nhập không hợp lệ");
         }
      } catch (err: any) {
         console.error("Login Error:", err);
         setError(err.message || "Đăng nhập thất bại");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="sm:pr-0 md:pr-8 lg:pr-10 lg:px-0">
         <h1 className="text-2xl sm:text-3xl mb-2">Đăng nhập</h1>
         <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
            Chào mừng bạn đã trở lại. Đăng nhập để nhận thêm các ưu đãi và các
            phần thưởng hấp dẫn khác
         </p>
         {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
               {error}
            </div>
         )}
         <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
               <label className="block mb-2">Tên đăng nhập *</label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type="text"
                     value={userName}
                     onChange={(e) => setUsername(e.target.value)}
                     placeholder="Vui lòng nhập tên đăng nhập hoặc số điện thoại"
                     className="w-full pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-warning"
                     required
                     disabled={loading}
                  />
               </div>
            </div>

            <div>
               <label className="block mb-2">Mật khẩu *</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Mật khẩu"
                     className="w-full pl-10 pr-12 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-warning"
                     required
                     disabled={loading}
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 cursor-pointer"
                     disabled={loading}
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
               <label className="flex items-center cursor-pointer">
                  <input
                     type="checkbox"
                     className="mr-2 w-4 h-4"
                     disabled={loading}
                  />
                  <span className="text-sm">Nhớ mật khẩu</span>
               </label>
               <a href="#" className="text-sm text-blue-600 hover:underline">
                  Quên mật khẩu?
               </a>
            </div>

            <button
               type="submit"
               disabled={loading}
               className="w-full bg-gray-900 text-white py-2.5 sm:py-3 rounded-lg font-medium hover:bg-gray-800 transition cursor-pointer text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative my-6">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
               </div>
               <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-600">Hoặc</span>
               </div>
            </div>

            <div className="flex justify-center flex-col gap-3 sm:gap-4">
               <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  disabled={loading}
               >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                     />
                     <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                     />
                     <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                     />
                     <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                     />
                  </svg>
                  <span>Đăng nhập với Google</span>
               </button>
               <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  disabled={loading}
               >
                  <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                     <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>Đăng nhập với Facebook</span>
               </button>
               <button
                  type="button"
                  className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                  disabled={loading}
               >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 sm:w-6 sm:h-6">
                     <path
                        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
                        fill="#000"
                     />
                  </svg>
                  <span>Đăng nhập với Apple</span>
               </button>
            </div>
         </form>
      </div>
   );
};

export default LoginForm;
