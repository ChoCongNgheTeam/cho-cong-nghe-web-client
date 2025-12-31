"use client";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import LoginForm from "./login/LoginForm";
import RegisterForm from "./register/RegisterForm";

const AuthPage = () => {
   const searchParams = useSearchParams();
   const tabParam = searchParams.get("tab");

   const [activeTab, setActiveTab] = useState<"login" | "register">(
      tabParam === "register" ? "register" : "login"
   );

   // Sync với URL params khi thay đổi
   useEffect(() => {
      if (tabParam === "register" || tabParam === "login") {
         setActiveTab(tabParam);
      }
   }, [tabParam]);

   return (
      <div className="container py-4 sm:py-6 lg:py-8">
         <div className="flex items-center justify-between pb-4 sm:pb-6">
            <div className="flex gap-2 sm:gap-3 text-sm sm:text-base">
               <Link
                  href="/"
                  className="text-gray-600 hover:text-gray-900 hover:underline"
               >
                  Trang chủ
               </Link>
               <span className="text-gray-400">/</span>
               <span className="font-medium">Tài khoản</span>
            </div>
         </div>
         <div className="md:hidden mb-6">
            <div className="relative flex border-b border-gray-200">
               {/* Animated underline */}
               <div
                  className="absolute bottom-0 h-0.5 bg-warning transition-all duration-300 ease-in-out"
                  style={{
                     width: "50%",
                     left: activeTab === "login" ? "0%" : "50%",
                  }}
               />

               <button
                  onClick={() => setActiveTab("login")}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                     activeTab === "login"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
               >
                  Đăng nhập
               </button>
               <button
                  onClick={() => setActiveTab("register")}
                  className={`flex-1 py-3 text-center font-medium transition-colors ${
                     activeTab === "register"
                        ? "text-gray-900"
                        : "text-gray-500 hover:text-gray-700"
                  }`}
               >
                  Đăng ký
               </button>
            </div>
         </div>
         <div className="md:hidden">
            {activeTab === "login" ? <LoginForm /> : <RegisterForm />}
         </div>
         <div className="hidden md:grid md:grid-cols-2 gap-0">
            {/* Login Form */}
            <div className="border-r border-gray-200">
               <LoginForm />
            </div>
            <div>
               <RegisterForm />
            </div>
         </div>
      </div>
   );
};

export default AuthPage;
