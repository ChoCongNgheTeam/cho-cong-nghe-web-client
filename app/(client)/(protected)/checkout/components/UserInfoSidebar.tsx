import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

interface UserInfo {
   id: number;
   full_name: string;
   email: string;
}

interface UserInfoSidebarProps {
   isOpen: boolean;
   onClose: () => void;
   userInfo: UserInfo | null;
   onUpdate: (data: { name: string; email: string }) => void;
}

export default function UserInfoSidebar({
   isOpen,
   onClose,
   userInfo,
   onUpdate,
}: UserInfoSidebarProps) {
   const [name, setName] = useState("");
   const [email, setEmail] = useState("");

   useEffect(() => {
      if (userInfo) {
         setName(userInfo.full_name);
         setEmail(userInfo.email);
      }
   }, [userInfo]);

   useEffect(() => {
      if (isOpen) {
         const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;
         document.body.style.paddingRight = `${scrollbarWidth}px`;
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      }

      return () => {
         document.body.style.paddingRight = "0px";
         document.body.style.overflow = "unset";
      };
   }, [isOpen]);

   const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!name) return;
      onUpdate({ name, email });
      onClose();
   };

   if (!isOpen) return null;

   return (
      <>
         <div
            className="fixed inset-0 z-40 transition-all cursor-pointer backdrop-blur-sm bg-neutral-light/70"
            onClick={onClose}
         />

         <div className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-[420px] bg-neutral-light shadow-2xl z-50 overflow-hidden">
            <div className="flex flex-col h-full">
               {/* Header */}
               <div className="flex items-center justify-between p-4 sm:p-5 border-b border-neutral shrink-0">
                  <h2 className="text-base sm:text-lg font-semibold text-primary">
                     Thông tin người đặt
                  </h2>
                  <button
                     type="button"
                     onClick={onClose}
                     className="text-neutral-dark hover:text-neutral-darker text-2xl w-8 h-8 flex items-center justify-center cursor-pointer transition-colors hover:bg-neutral rounded-full"
                  >
                     <X size={24} />
                  </button>
               </div>

               {/* Content */}
               <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                  <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-medium mb-2 text-primary">
                           Họ và tên <span className="text-promotion">*</span>
                        </label>
                        <input
                           type="text"
                           value={name}
                           onChange={(e) => setName(e.target.value)}
                           placeholder="Nhập họ và tên"
                           className="w-full px-3 py-2.5 text-sm border-2 border-neutral-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-primary"
                           required
                        />
                     </div>

                     <div>
                        <label className="block text-sm font-medium mb-2 text-primary">
                           Email
                        </label>
                        <input
                           type="email"
                           value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           placeholder="Nhập email (không bắt buộc)"
                           className="w-full px-3 py-2.5 text-sm border-2 border-neutral-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-primary"
                        />
                     </div>
                  </div>
               </div>

               {/* Footer */}
               <div className="p-4 sm:p-5 border-t border-neutral shrink-0">
                  <button
                     type="submit"
                     onClick={handleSubmit}
                     className="w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm transition-all cursor-pointer hover:shadow-md bg-primary hover:bg-primary-hover text-neutral-light"
                  >
                     Xác nhận
                  </button>
               </div>
            </div>
         </div>
      </>
   );
}