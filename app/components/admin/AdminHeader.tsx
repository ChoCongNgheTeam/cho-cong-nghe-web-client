// components/admin/AdminHeader.tsx
"use client";
import { Search, Bell, Settings2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import UserAvatar from "../ui/UserAvatar";

interface AdminHeaderProps {
   title: string;
}

export default function AdminHeader({ title }: AdminHeaderProps) {
   const { user } = useAuth();

   return (
      <div className="bg-neutral-light border-b border-neutral px-6 py-3.5 flex items-center justify-between sticky top-0 z-30">
         {/* Page title */}
         <h1 className="text-2xl font-bold text-primary tracking-tight">
            {title}
         </h1>

         {/* Right side */}
         <div className="flex items-center gap-2">
            {/* Search bar */}
            <div className="relative">
               <input
                  type="text"
                  placeholder="Tìm kiếm sản phẩm, đơn hàng, tố cáo,..."
                  className="w-72 pl-4 pr-10 py-2 text-[13px] border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-neutral-light-active text-primary placeholder:text-neutral-dark transition-all duration-150"
               />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-accent transition-colors">
                  <Search size={15} />
               </button>
            </div>

            {/* Divider */}
            <div className="w-px h-6 bg-neutral mx-1" />

            {/* Notification bell */}
            <button className="relative w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all duration-150">
               <Bell size={17} />
            </button>

            {/* Settings */}
            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active transition-all duration-150">
               <Settings2 size={17} />
            </button>

            {/* Avatar */}
            {user && (
               <button className="ring-2 ring-neutral hover:ring-accent transition-all duration-150 rounded-full">
                  <UserAvatar
                     avatarImage={user.avatarImage}
                     fullName={user.fullName}
                     size={32}
                  />
               </button>
            )}
         </div>
      </div>
   );
}
