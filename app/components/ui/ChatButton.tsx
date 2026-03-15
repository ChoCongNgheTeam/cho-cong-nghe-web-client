"use client";

import { MessageCircle, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function ChatButton() {
   const [open, setOpen] = useState(false);
   const ref = useRef<HTMLDivElement>(null);

   useEffect(() => {
      if (!open) return;
      const handler = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target as Node)) {
            setOpen(false);
         }
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open]);

   return (
      <div
         ref={ref}
         className="hidden md:flex fixed bottom-20 right-4 sm:right-6 z-50 flex-col items-end gap-3"
      >
         {open && (
            <div className="rounded-2xl border border-neutral bg-neutral-light shadow-xl overflow-hidden w-72">
               <div className="bg-accent px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <MessageCircle size={15} className="text-white" />
                     </div>
                     <div>
                        <p className="text-white text-[13px] font-semibold leading-tight">
                           Hỗ trợ trực tuyến
                        </p>
                        <p className="text-white/70 text-[11px]">
                           Thường trả lời trong vài phút
                        </p>
                     </div>
                  </div>
                  <button
                     onClick={() => setOpen(false)}
                     className="text-white/70 hover:text-white transition-colors cursor-pointer"
                  >
                     <X size={16} />
                  </button>
               </div>

               <div className="h-56 flex flex-col items-center justify-center gap-2 bg-neutral-light-hover px-6 text-center">
                  <MessageCircle size={28} className="text-neutral-dark" />
                  <p className="text-[13px] text-neutral-dark">
                     Tính năng chat sẽ sớm ra mắt
                  </p>
               </div>

               <div className="px-3 py-3 border-t border-neutral flex items-center gap-2">
                  <input
                     disabled
                     placeholder="Nhập tin nhắn..."
                     className="flex-1 text-[13px] px-3 py-2 rounded-lg bg-neutral-light-active text-neutral-dark placeholder:text-neutral-dark border border-neutral focus:outline-none cursor-not-allowed"
                  />
                  <button
                     disabled
                     className="w-8 h-8 rounded-lg bg-accent/40 flex items-center justify-center cursor-not-allowed shrink-0"
                  >
                     <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-white rotate-45"
                     >
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                     </svg>
                  </button>
               </div>
            </div>
         )}

         <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Chat support"
            className="relative w-12 h-12 rounded-2xl bg-accent hover:bg-accent-hover active:bg-accent-active text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer"
         >
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-neutral-light" />
            {open ? (
               <X size={20} strokeWidth={2} />
            ) : (
               <MessageCircle size={20} strokeWidth={2} />
            )}
         </button>
      </div>
   );
}
