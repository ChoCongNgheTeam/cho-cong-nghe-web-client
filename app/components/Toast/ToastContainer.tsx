"use client";

import React from "react";
import { Toast, ToastPosition } from "./types";
import ToastItem from "./ToastItem";

interface ToastContainerProps {
   toasts: Toast[];
   dismiss: (id: string) => void;
}

export default function ToastContainer({
   toasts,
   dismiss,
}: ToastContainerProps) {
   const positions: ToastPosition[] = [
      "top-left",
      "top-center",
      "top-right",
      "bottom-left",
      "bottom-center",
      "bottom-right",
   ];

   const getPositionClasses = (position: ToastPosition) => {
      const base = "fixed z-9999 flex flex-col gap-3 p-4 pointer-events-none";
      const classes: Record<ToastPosition, string> = {
         "top-left": `${base} top-0 left-0`,
         "top-center": `${base} top-0 left-1/2 -translate-x-1/2`,
         "top-right": `${base} top-0 right-0`,
         "bottom-left": `${base} bottom-0 left-0`,
         "bottom-center": `${base} bottom-0 left-1/2 -translate-x-1/2`,
         "bottom-right": `${base} bottom-0 right-0`,
      };
      return classes[position];
   };

   return (
      <>
         {positions.map((position) => {
            const positionToasts = toasts.filter(
               (t) => t.position === position,
            );
            if (positionToasts.length === 0) return null;

            return (
               <div key={position} className={getPositionClasses(position)}>
                  {positionToasts.map((toast) => (
                     <ToastItem
                        key={toast.id}
                        toast={toast}
                        dismiss={dismiss}
                     />
                  ))}
               </div>
            );
         })}
      </>
   );
}
