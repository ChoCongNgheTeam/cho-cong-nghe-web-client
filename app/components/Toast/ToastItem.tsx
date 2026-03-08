"use client";

import React, { useEffect, useState, useRef } from "react";
import { Toast } from "./types";

interface ToastItemProps {
   toast: Toast;
   dismiss: (id: string) => void;
}

export default function ToastItem({ toast, dismiss }: ToastItemProps) {
   const [isVisible, setIsVisible] = useState(false);
   const [isLeaving, setIsLeaving] = useState(false);
   const [isPaused, setIsPaused] = useState(false);
   const [progress, setProgress] = useState(100);
   const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const startTimeRef = useRef<number>(0);
   const remainingTimeRef = useRef<number>(toast.duration);

   useEffect(() => {
      requestAnimationFrame(() => {
         setIsVisible(true);
      });
   }, []);

   // Progress bar & auto dismiss
   useEffect(() => {
      if (toast.duration <= 0 || toast.type === "loading") return;

      const startTimer = () => {
         startTimeRef.current = Date.now();
         const duration = remainingTimeRef.current;

         // Progress animation
         const progressInterval = setInterval(() => {
            if (!isPaused) {
               const elapsed = Date.now() - startTimeRef.current;
               const remaining = Math.max(0, duration - elapsed);
               const progressPercent = (remaining / duration) * 100;
               setProgress(progressPercent);

               if (remaining <= 0) {
                  clearInterval(progressInterval);
               }
            }
         }, 16); // ~60fps

         // Auto dismiss
         timerRef.current = setTimeout(() => {
            if (!isPaused) {
               handleDismiss();
            }
         }, duration);

         return () => {
            clearInterval(progressInterval);
            if (timerRef.current) clearTimeout(timerRef.current);
         };
      };

      return startTimer();
   }, [toast.duration, toast.type, isPaused]);

   // Pause on hover
   const handleMouseEnter = () => {
      if (toast.pauseOnHover && toast.duration > 0) {
         setIsPaused(true);
         if (timerRef.current) {
            clearTimeout(timerRef.current);
            const elapsed = Date.now() - startTimeRef.current;
            remainingTimeRef.current = Math.max(
               0,
               remainingTimeRef.current - elapsed,
            );
         }
      }
   };

   const handleMouseLeave = () => {
      if (toast.pauseOnHover && toast.duration > 0) {
         setIsPaused(false);
         startTimeRef.current = Date.now();

         timerRef.current = setTimeout(() => {
            handleDismiss();
         }, remainingTimeRef.current);
      }
   };

   const handleDismiss = () => {
      setIsLeaving(true);
      setTimeout(() => {
         dismiss(toast.id);
         toast.onDismiss?.();
      }, 300);
   };

   const handleClick = () => {
      if (toast.onClick) {
         toast.onClick();
         handleDismiss();
      }
   };

   const getIcon = () => {
      if (toast.icon) return toast.icon;

      const icons = {
         success: (
            <svg
               className="w-5 h-5"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
               />
            </svg>
         ),
         error: (
            <svg
               className="w-5 h-5"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
               />
            </svg>
         ),
         warning: (
            <svg
               className="w-5 h-5"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
               />
            </svg>
         ),
         info: (
            <svg
               className="w-5 h-5"
               fill="none"
               viewBox="0 0 24 24"
               stroke="currentColor"
            >
               <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
               />
            </svg>
         ),
         loading: (
            <svg
               className="w-5 h-5 animate-spin"
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
         ),
      };

      return icons[toast.type];
   };

   const getStyles = () => {
      const baseStyles =
         "relative flex flex-col min-w-[320px] max-w-md rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto transition-all duration-300 overflow-hidden";

      const typeStyles = {
         success: "bg-white border border-green-200",
         error: "bg-white border border-red-200",
         warning: "bg-white border border-yellow-200",
         info: "bg-white border border-blue-200",
         loading: "bg-white border border-gray-200",
      };

      const animationStyles = isLeaving
         ? "opacity-0 translate-y-2 scale-95"
         : isVisible
           ? "opacity-100 translate-y-0 scale-100"
           : "opacity-0 -translate-y-2 scale-95";

      const clickableStyles = toast.onClick
         ? "cursor-pointer hover:shadow-xl"
         : "";

      return `${baseStyles} ${typeStyles[toast.type]} ${animationStyles} ${clickableStyles}`;
   };

   const getIconContainerStyle = () => {
      const colors = {
         success: "bg-green-100 text-green-600",
         error: "bg-red-100 text-red-600",
         warning: "bg-yellow-100 text-yellow-600",
         info: "bg-blue-100 text-blue-600",
         loading: "bg-gray-100 text-gray-600",
      };
      return colors[toast.type];
   };

   const getProgressBarColor = () => {
      const colors = {
         success: "bg-green-500",
         error: "bg-red-500",
         warning: "bg-yellow-500",
         info: "bg-blue-500",
         loading: "bg-gray-500",
      };
      return colors[toast.type];
   };

   const getButtonVariantStyle = (
      variant: "primary" | "secondary" | "ghost" = "primary",
   ) => {
      const variants = {
         primary: "bg-gray-900 text-white hover:bg-gray-800",
         secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200",
         ghost: "text-gray-700 hover:bg-gray-100",
      };
      return variants[variant];
   };

   return (
      <div
         className={getStyles()}
         role="alert"
         onMouseEnter={handleMouseEnter}
         onMouseLeave={handleMouseLeave}
         onClick={toast.onClick ? handleClick : undefined}
      >
         {/* Main Content */}
         <div className="flex items-start gap-3 p-4">
            {/* Icon */}
            <div
               className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconContainerStyle()}`}
            >
               {getIcon()}
            </div>

            {/* Text Content */}
            <div className="flex-1 min-w-0 pt-0.5">
               {toast.title && (
                  <div className="font-semibold text-sm text-gray-900 mb-1">
                     {toast.title}
                  </div>
               )}
               {toast.description && (
                  <div className="text-sm text-gray-600">
                     {toast.description}
                  </div>
               )}

               {/* Buttons */}
               {toast.buttons && toast.buttons.length > 0 && (
                  <div className="flex gap-2 mt-3">
                     {toast.buttons.map((button, index) => (
                        <button
                           key={index}
                           onClick={(e) => {
                              e.stopPropagation();
                              button.onClick();
                              handleDismiss();
                           }}
                           className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${getButtonVariantStyle(button.variant)}`}
                        >
                           {button.label}
                        </button>
                     ))}
                  </div>
               )}
            </div>

            {/* Close Button */}
            {toast.dismissible && (
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     handleDismiss();
                  }}
                  className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
               >
                  <svg
                     className="w-4 h-4"
                     fill="none"
                     viewBox="0 0 24 24"
                     stroke="currentColor"
                  >
                     <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                     />
                  </svg>
               </button>
            )}
         </div>

         {/* Progress Bar */}
         {toast.showProgress &&
            toast.duration > 0 &&
            toast.type !== "loading" && (
               <div className="h-1 bg-gray-100">
                  <div
                     className={`h-full transition-all ${getProgressBarColor()}`}
                     style={{
                        width: `${progress}%`,
                        transition: isPaused ? "none" : "width 16ms linear",
                     }}
                  />
               </div>
            )}
      </div>
   );
}
