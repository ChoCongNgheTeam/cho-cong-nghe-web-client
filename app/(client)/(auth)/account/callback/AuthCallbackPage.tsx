"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import apiRequest, { performRefresh } from "@/lib/api";

export default function AuthCallbackPage() {
   const router = useRouter();
   const params = useSearchParams();
   const { login } = useAuth();
   useEffect(() => {
      if (window.location.hash) {
         window.history.replaceState(
            null,
            "",
            window.location.href.split("#")[0],
         );
      }

      const returnUrl = params.get("returnUrl") || "/";
      const error = params.get("error");

      if (error === "facebook_cancelled") {
         router.replace("/login");
         return;
      }

      const handleCallback = async () => {
         try {
            const refreshed = await performRefresh();

            if (!refreshed) {
               router.replace("/account");
               return;
            }
            const response = await apiRequest.get<any>("/users/me", {
               noRedirectOn401: true,
            });

            const user = response?.data ?? response;
            const { getAccessToken } = await import("@/lib/api");
            const accessToken = getAccessToken()!;

            await login(user, accessToken);

            const redirectPath =
               user.role === "ADMIN" ? "/admin/dashboard" : returnUrl;
            router.replace(redirectPath);
         } catch {
            router.replace("/account");
         }
      };

      handleCallback();
   }, []);

   return (
      <main className="min-h-screen bg-neutral-light">
         <style>{`
            @keyframes shimmer {
               0% { background-position: -700px 0; }
               100% { background-position: 700px 0; }
            }
            .sk {
               background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
               background-size: 700px 100%;
               animation: shimmer 1.4s infinite linear;
               border-radius: 8px;
            }
         `}</style>

         {/* HomeSlider skeleton */}
         <div className="relative w-full overflow-hidden aspect-video md:aspect-21/8 bg-slate-950">
            <div className="relative z-10 grid grid-cols-2 items-center h-full px-[6%] gap-[4%]">
               {/* Left text */}
               <div className="flex flex-col gap-3">
                  <div className="sk h-6 w-24 rounded-full opacity-40" />
                  <div className="sk h-10 w-4/5 opacity-40" />
                  <div className="sk h-10 w-3/5 opacity-30" />
                  <div className="sk h-4 w-2/3 opacity-25" />
                  <div className="sk h-4 w-1/2 opacity-20" />
                  <div className="sk h-10 w-32 rounded-full opacity-35 mt-2" />
               </div>
               {/* Right image */}
               <div className="sk h-[78%] opacity-20 rounded-2xl" />
            </div>
         </div>

         {/* BannersTop skeleton */}
         <section className="py-6 md:py-8">
            <div className="container px-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[0, 1].map((i) => (
                     <div key={i} className="sk rounded-3xl aspect-16/6" />
                  ))}
               </div>
            </div>
         </section>

         {/* FeaturedCategories skeleton */}
         <section className="py-6 md:py-8">
            <div className="container px-4">
               <div className="sk h-7 w-48 mb-6 rounded" />
               <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="flex flex-col items-center gap-2">
                        <div className="sk w-16 h-16 rounded-full" />
                        <div className="sk h-3 w-14 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* HotSaleOnline skeleton */}
         <section className="py-6 md:py-8 bg-slate-50">
            <div className="container px-4">
               <div className="flex items-center gap-4 mb-6">
                  <div className="sk h-8 w-48 rounded" />
                  <div className="sk h-8 w-32 rounded-full" />
               </div>
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex flex-col gap-2">
                        <div className="sk aspect-square rounded-xl" />
                        <div className="sk h-3 w-full rounded" />
                        <div className="sk h-3 w-3/4 rounded" />
                        <div className="sk h-5 w-1/2 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* FeaturedProducts skeleton */}
         <section className="py-6 md:py-8">
            <div className="container px-4">
               <div className="sk h-7 w-56 mb-6 rounded" />
               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                     <div key={i} className="flex flex-col gap-2">
                        <div className="sk aspect-square rounded-xl" />
                        <div className="sk h-3 w-full rounded" />
                        <div className="sk h-3 w-2/3 rounded" />
                        <div className="sk h-5 w-1/3 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* BestSellers skeleton */}
         <section className="py-6 md:py-8 bg-slate-50">
            <div className="container px-4">
               <div className="sk h-7 w-44 mb-6 rounded" />
               <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                     <div key={i} className="flex flex-col gap-2">
                        <div className="sk aspect-square rounded-xl" />
                        <div className="sk h-3 w-full rounded" />
                        <div className="sk h-5 w-1/2 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* SeasonalSale / BannersSection1 skeleton */}
         <section className="py-6 md:py-8">
            <div className="container px-4">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                     <div key={i} className="sk rounded-2xl h-48" />
                  ))}
               </div>
            </div>
         </section>

         {/* BlogSection skeleton */}
         <section className="py-6 md:py-8">
            <div className="container px-4">
               <div className="sk h-7 w-36 mb-6 rounded" />
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[0, 1, 2].map((i) => (
                     <div key={i} className="flex flex-col gap-3">
                        <div className="sk aspect-video rounded-xl" />
                        <div className="sk h-3 w-24 rounded" />
                        <div className="sk h-4 w-full rounded" />
                        <div className="sk h-4 w-3/4 rounded" />
                        <div className="sk h-3 w-1/2 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>

         {/* TrustBadges skeleton */}
         <section className="py-6 md:py-8 bg-slate-50">
            <div className="container px-4">
               <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[0, 1, 2, 3].map((i) => (
                     <div key={i} className="flex flex-col items-center gap-2">
                        <div className="sk w-12 h-12 rounded-full" />
                        <div className="sk h-3 w-24 rounded" />
                        <div className="sk h-3 w-20 rounded" />
                     </div>
                  ))}
               </div>
            </div>
         </section>
      </main>
   );
}
