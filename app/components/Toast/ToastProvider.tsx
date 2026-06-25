"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";
import { Toast, ToastOptions, ToastContextType } from "./types";
import ToastContainer from "./ToastContainer";

// ── Tách thành 2 context ──────────────────────────────────────────────────────
// ActionsContext: stable, không thay đổi khi toast xuất hiện/mất
// StateContext: chỉ ToastContainer cần, consumer khác không subscribe

type ToastActionsType = Omit<ToastContextType, "toasts">;

const ToastyActionsContext = createContext<ToastActionsType | undefined>(undefined);
const ToastyStateContext = createContext<Toast[]>([]);

// ── Provider ──────────────────────────────────────────────────────────────────

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
    setToasts((prev) => [...prev.filter((t) => t.id !== id), newToast]);
    return id;
  }, []);

  const success = useCallback((message: string, options?: Partial<ToastOptions>) => toast({ ...options, type: "success", description: message }), [toast]);

  const error = useCallback((message: string, options?: Partial<ToastOptions>) => toast({ ...options, type: "error", description: message }), [toast]);

  const warning = useCallback((message: string, options?: Partial<ToastOptions>) => toast({ ...options, type: "warning", description: message }), [toast]);

  const info = useCallback((message: string, options?: Partial<ToastOptions>) => toast({ ...options, type: "info", description: message }), [toast]);

  const loading = useCallback((message: string, options?: Partial<ToastOptions>) => toast({ ...options, type: "loading", description: message, duration: 0 }), [toast]);

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

  const promiseToast = useCallback(
    async <T,>(
      promise: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((err: unknown) => string);
      },
    ): Promise<T> => {
      const id = loading(options.loading);
      try {
        const data = await promise;
        const message = typeof options.success === "function" ? options.success(data) : options.success;
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, type: "success", description: message, duration: 4000 } : t)));
        setTimeout(() => dismiss(id), 4000);
        return data;
      } catch (err) {
        const message = typeof options.error === "function" ? options.error(err) : options.error;
        setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, type: "error", description: message, duration: 4000 } : t)));
        setTimeout(() => dismiss(id), 4000);
        throw err;
      }
    },
    [loading, dismiss],
  );

  // actions object chỉ thay đổi khi callback thay đổi (không bao giờ xảy ra)
  // → consumer của useToasty() sẽ KHÔNG re-render khi toasts thay đổi
  const actions = useMemo<ToastActionsType>(
    () => ({
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
    }),
    [toast, success, error, warning, info, loading, promiseToast, dismiss, dismissAll, update],
  );

  return (
    <ToastyActionsContext.Provider value={actions}>
      {children}
      {/* ToastyStateContext chỉ bọc ToastContainer, không bọc children */}
      <ToastyStateContext.Provider value={toasts}>
        <ToastContainer toasts={toasts} dismiss={dismiss} />
      </ToastyStateContext.Provider>
    </ToastyActionsContext.Provider>
  );
}

// ── Hooks ─────────────────────────────────────────────────────────────────────

/** Dùng ở mọi nơi cần gọi toast — KHÔNG re-render khi toast xuất hiện/mất */
export function useToasty() {
  const context = useContext(ToastyActionsContext);
  if (!context) throw new Error("useToasty must be used within ToastyProvider");
  return context;
}

/** Chỉ dùng nội bộ nếu cần đọc danh sách toasts (ToastContainer đã nhận props) */
export function useToastState() {
  return useContext(ToastyStateContext);
}
