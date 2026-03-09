"use client";
import { useState, useCallback } from "react";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useToasty } from "@/components/Toast";
import Link from "next/link";
import { handleLoginSubmit } from "./loginHandler";
import { SocialLoginButtons } from "./SocialLoginButtons";
import type { User as AuthUser } from "./types";
import { useGoogleLogin } from "@/hooks/useGoogleLogin";

const LoginForm = () => {
   const { login } = useAuth();
   const router = useRouter();
   const toast = useToasty();

   const [showPassword, setShowPassword] = useState(false);
   const [userName, setUsername] = useState("");
   const [password, setPassword] = useState("");
   const [rememberMe, setRememberMe] = useState(false);
   const [loading, setLoading] = useState(false);
   const [googleLoading, setGoogleLoading] = useState(false);
   const [error, setError] = useState("");

   const handleLoginSuccess = useCallback(
      async (user: AuthUser, accessToken: string) => {
         const redirectPath = user.role === "ADMIN" ? "/admin/dashboard" : "/";
         toast.success("Đăng nhập thành công 👋", {
            duration: 1000,
            id: "login-success",
         });
         await login(user, accessToken);
         router.push(redirectPath);
      },
      [login, router, toast],
   );

   const { prompt: googlePrompt, buttonRef } = useGoogleLogin({
      onSuccess: handleLoginSuccess,
      onError: (msg) => setError(msg),
      onLoadingChange: setGoogleLoading,
   });

   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError("");
      setLoading(true);
      try {
         await handleLoginSubmit({
            userName,
            password,
            rememberMe,
            onSuccess: handleLoginSuccess,
            onError: setError,
         });
      } finally {
         setLoading(false);
      }
   };

   // Hiện skeleton ngay lập tức khi đang redirect — không có khoảng trắng

   const isAnyLoading = loading || googleLoading;

   return (
      <div className="sm:pr-0 md:pr-8 lg:pr-10 lg:px-0">
         <h1 className="text-2xl mb-3 text-primary text-center">Đăng nhập</h1>
         <p className="text-base text-neutral-darker mb-5 md:hidden lg:block">
            Chào mừng bạn đã trở lại. Đăng nhập để nhận thêm các ưu đãi và các
            phần thưởng hấp dẫn khác
         </p>

         {error && (
            <div className="mb-4 p-2.5 bg-promotion-light border border-promotion text-promotion-dark rounded-lg text-base">
               {error}
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-4 md:mt-4">
            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Tên đăng nhập *
               </label>
               <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type="text"
                     value={userName}
                     onChange={(e) => setUsername(e.target.value)}
                     placeholder="Vui lòng nhập tên đăng nhập hoặc số điện thoại"
                     className="w-full pl-10 pr-3 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                     required
                     disabled={isAnyLoading}
                     autoComplete="username"
                  />
               </div>
            </div>

            <div>
               <label className="block mb-1.5 text-primary text-base">
                  Mật khẩu *
               </label>
               <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-dark" />
                  <input
                     type={showPassword ? "text" : "password"}
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="Mật khẩu"
                     className="w-full pl-10 pr-11 py-3 text-base border border-neutral rounded-lg focus:outline-none focus:ring-accent focus:border-accent bg-neutral-light text-primary dark:placeholder:text-neutral-dark"
                     required
                     disabled={isAnyLoading}
                     autoComplete="current-password"
                  />
                  <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-primary cursor-pointer"
                     disabled={isAnyLoading}
                     aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                     {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </div>

            <div className="flex sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
               <label className="flex items-center cursor-pointer">
                  <input
                     type="checkbox"
                     checked={rememberMe}
                     onChange={(e) => setRememberMe(e.target.checked)}
                     className="mr-2 w-4 h-4 accent-accent cursor-pointer"
                     disabled={isAnyLoading}
                  />
                  <span className="text-base text-primary">Nhớ mật khẩu</span>
               </label>
               <Link
                  href="/forgot-password"
                  className="text-base text-primary hover:text-primary-hover hover:underline"
               >
                  Quên mật khẩu?
               </Link>
            </div>

            <button
               type="submit"
               disabled={isAnyLoading}
               className="w-full bg-primary-dark text-neutral-light py-3 rounded-lg font-medium hover:bg-primary-hover transition cursor-pointer text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
               {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            <div className="relative my-5">
               <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral" />
               </div>
               <div className="relative flex justify-center text-base">
                  <span className="px-2 bg-neutral-light text-neutral-darker">
                     Hoặc
                  </span>
               </div>
            </div>
            <div ref={buttonRef} className="hidden" aria-hidden="true" />
            <SocialLoginButtons
               onGoogleLogin={googlePrompt}
               onFacebookLogin={() => console.log("TODO: Facebook login")}
               onAppleLogin={() => console.log("TODO: Apple login")}
               googleLoading={googleLoading}
               disabled={isAnyLoading}
            />
         </form>
      </div>
   );
};

export default LoginForm;
