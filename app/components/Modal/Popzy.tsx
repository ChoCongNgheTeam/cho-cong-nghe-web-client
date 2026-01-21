"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PopzyOptions, PopzyButtonConfig } from "./types";

interface PopzyProps extends PopzyOptions {
   isOpen: boolean;
   onClose: () => void;
   footerButtons?: PopzyButtonConfig[];
   footerContent?: string | React.ReactNode;
}

export default function Popzy({
   isOpen,
   onClose,
   content,
   enableScrollLock = true,
   footer = false,
   cssClass = "",
   closeMethods = ["button", "overlay", "escape"],
   scrollLockTarget = () => document.body,
   onOpen,
   footerButtons = [],
   footerContent,
}: PopzyProps) {
   const [mounted, setMounted] = useState(false);
   const [isVisible, setIsVisible] = useState(false);
   const backdropRef = useRef<HTMLDivElement>(null);
   const scrollbarWidthRef = useRef<number>(0);

   const allowButtonClose = closeMethods.includes("button");
   const allowBackdropClose = closeMethods.includes("overlay");
   const allowEscapeClose = closeMethods.includes("escape");

   // Mount/unmount
   useEffect(() => {
      setMounted(true);
      return () => setMounted(false);
   }, []);

   // Handle open/close animation
   useEffect(() => {
      if (isOpen) {
         setIsVisible(true);
         const timer = setTimeout(() => {
            onOpen?.();
         }, 300);
         return () => clearTimeout(timer);
      } else {
         setIsVisible(false);
      }
   }, [isOpen, onOpen]);

   // Scroll lock
   useEffect(() => {
      if (!isOpen || !enableScrollLock) return;

      const target = scrollLockTarget();
      const hasScrollbar =
         target === document.body || target === document.documentElement
            ? document.documentElement.scrollHeight >
                 document.documentElement.clientHeight ||
              document.body.scrollHeight > document.body.clientHeight
            : target.scrollHeight > target.clientHeight;

      if (hasScrollbar) {
         // Calculate scrollbar width
         const div = document.createElement("div");
         div.style.overflow = "scroll";
         div.style.position = "absolute";
         div.style.top = "-9999px";
         document.body.appendChild(div);
         scrollbarWidthRef.current = div.offsetWidth - div.clientWidth;
         document.body.removeChild(div);

         // Apply scroll lock
         const currentPadding = parseFloat(
            getComputedStyle(target).paddingRight,
         );
         target.classList.add("overflow-hidden");
         target.style.paddingRight = `${
            currentPadding + scrollbarWidthRef.current
         }px`;
      }

      return () => {
         if (hasScrollbar) {
            target.classList.remove("overflow-hidden");
            target.style.paddingRight = "";
         }
      };
   }, [isOpen, enableScrollLock, scrollLockTarget]);

   // ESC key handler
   useEffect(() => {
      if (!isOpen || !allowEscapeClose) return;

      const handleEscape = (e: KeyboardEvent) => {
         if (e.key === "Escape") {
            onClose();
         }
      };

      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
   }, [isOpen, allowEscapeClose, onClose]);

   const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (allowBackdropClose && e.target === backdropRef.current) {
         onClose();
      }
   };

   if (!mounted || !isOpen) return null;

   return createPortal(
      <div
         ref={backdropRef}
         onClick={handleBackdropClick}
         className={`
                fixed inset-0 z-9999 flex items-center justify-center
                bg-black/70 transition-opacity duration-300
                ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
            `}
      >
         <div
            className={`
                    relative w-[min(600px,90%)] p-5 rounded-md bg-white
                    transition-transform duration-300
                    ${isVisible ? "scale-100" : "scale-50"}
                    ${cssClass}
                `}
         >
            {/* Close Button */}
            {allowButtonClose && (
               <button
                  onClick={onClose}
                  className="
                            absolute top-2.5 right-2.5 w-7.5 h-7.5
                            rounded-full bg-gray-200 text-gray-600
                            text-3xl leading-none border-none outline-none
                            hover:text-gray-800 hover:cursor-pointer
                            flex items-center justify-center
                        "
                  aria-label="Close"
               >
                  &times;
               </button>
            )}

            {/* Content */}
            <div className="max-h-[80vh] overflow-y-auto">
               {typeof content === "string" ? (
                  <div dangerouslySetInnerHTML={{ __html: content }} />
               ) : (
                  content
               )}
            </div>

            {/* Footer */}
            {footer && (
               <div className="flex justify-end gap-2 pt-5">
                  {footerContent &&
                     (typeof footerContent === "string" ? (
                        <div
                           dangerouslySetInnerHTML={{
                              __html: footerContent,
                           }}
                        />
                     ) : (
                        footerContent
                     ))}
                  {footerButtons.map((button, index) => (
                     <button
                        key={index}
                        onClick={button.onClick}
                        className={button.className}
                     >
                        {button.title}
                     </button>
                  ))}
               </div>
            )}
         </div>
      </div>,
      document.body,
   );
}
