"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastOptions, ToastContextType } from "./types";
import ToastContainer from "./ToastContainer";

const ToastyContext = createContext<ToastContextType | undefined>(undefined);

let toastId = 0;
const generateId = () => `toast-${++toastId}-${Date.now()}`;

export function ToastyProvider({ children }: { children: React.ReactNode }) {
   const [toasts, setToasts] = useState<Toast[]>([]);

   const dismiss = useCallback((id: string) => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
   }, []);

   const dismissAll = useCallback(() => {
      setToasts([]);
   }, []);

   const toast = useCallback((options: ToastOptions): string => {
      const id = options.id || generateId();

      const newToast: Toast = {
         id,
         type: options.type || "info",
         title: options.title || "",
         description: options.description || "",
         duration: options.duration ?? 4000,
         position: options.position || "top-right",
         dismissible: options.dismissible ?? true,
         pauseOnHover: options.pauseOnHover ?? true,
         showProgress: options.showProgress ?? true,
         icon: options.icon,
         buttons: options.buttons,
         onDismiss: options.onDismiss,
         onClick: options.onClick,
         createdAt: Date.now(),
      };

      setToasts((prev) => {
         const filtered = prev.filter((t) => t.id !== id);
         return [...filtered, newToast];
      });

      return id;
   }, []);

   const success = useCallback(
      (message: string, options?: Partial<ToastOptions>) => {
         return toast({
            ...options,
            type: "success",
            description: message,
         });
      },
      [toast],
   );

   const error = useCallback(
      (message: string, options?: Partial<ToastOptions>) => {
         return toast({
            ...options,
            type: "error",
            description: message,
         });
      },
      [toast],
   );

   const warning = useCallback(
      (message: string, options?: Partial<ToastOptions>) => {
         return toast({
            ...options,
            type: "warning",
            description: message,
         });
      },
      [toast],
   );

   const info = useCallback(
      (message: string, options?: Partial<ToastOptions>) => {
         return toast({
            ...options,
            type: "info",
            description: message,
         });
      },
      [toast],
   );

   const loading = useCallback(
      (message: string, options?: Partial<ToastOptions>) => {
         return toast({
            ...options,
            type: "loading",
            description: message,
            duration: 0,
         });
      },
      [toast],
   );

   const promiseToast = useCallback(
      async <T,>(
         promise: Promise<T>,
         options: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
         },
      ): Promise<T> => {
         const id = loading(options.loading);

         try {
            const data = await promise;
            const message =
               typeof options.success === "function"
                  ? options.success(data)
                  : options.success;

            setToasts((prev) =>
               prev.map((t) =>
                  t.id === id
                     ? {
                          ...t,
                          type: "success",
                          description: message,
                          duration: 4000,
                       }
                     : t,
               ),
            );

            setTimeout(() => dismiss(id), 4000);
            return data;
         } catch (err) {
            const message =
               typeof options.error === "function"
                  ? options.error(err)
                  : options.error;

            setToasts((prev) =>
               prev.map((t) =>
                  t.id === id
                     ? {
                          ...t,
                          type: "error",
                          description: message,
                          duration: 4000,
                       }
                     : t,
               ),
            );

            setTimeout(() => dismiss(id), 4000);
            throw err;
         }
      },
      [loading, dismiss],
   );

   const update = useCallback((id: string, options: Partial<ToastOptions>) => {
      setToasts((prev) =>
         prev.map((t) =>
            t.id === id
               ? {
                    ...t,
                    ...options,
                    type: options.type || t.type,
                    title: options.title || t.title,
                    description: options.description || t.description,
                    duration: options.duration ?? t.duration,
                 }
               : t,
         ),
      );
   }, []);

   return (
      <ToastyContext.Provider
         value={{
            toasts,
            toast,
            success,
            error,
            warning,
            info,
            loading,
            promise: promiseToast,
            dismiss,
            dismissAll,
            update,
         }}
      >
         {children}
         <ToastContainer toasts={toasts} dismiss={dismiss} />
      </ToastyContext.Provider>
   );
}

export function useToasty() {
   const context = useContext(ToastyContext);
   if (!context) {
      throw new Error("useToasty must be used within ToastyProvider");
   }
   return context;
}
