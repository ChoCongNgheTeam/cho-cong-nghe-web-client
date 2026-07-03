"use client";

import { useEffect, useState } from "react";
import type { Toast } from "./types";
import { useToastTimer } from "./hooks/useToastTimer";
import { getToastIcon } from "./utils/toastIcons";
import { getButtonVariantStyle, getIconContainerStyle, getProgressBarColor, getToastClassName } from "./utils/toastStyles";

interface ToastItemProps {
  toast: Toast;
  dismiss: (id: string) => void;
}

export default function ToastItem({ toast, dismiss }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleDismiss = () => {
    setIsLeaving(true);
    setTimeout(() => {
      dismiss(toast.id);
      toast.onDismiss?.();
    }, 300);
  };

  // Progress bar + auto-dismiss — 1 nguồn timer duy nhất, không còn isPaused state
  const { progressBarRef, pause, resume } = useToastTimer({
    duration: toast.duration,
    isLoading: toast.type === "loading",
    pauseOnHover: toast.pauseOnHover,
    onExpire: handleDismiss,
  });

  const handleClick = () => {
    if (toast.onClick) {
      toast.onClick();
      handleDismiss();
    }
  };

  const showProgressBar = toast.showProgress && toast.duration > 0 && toast.type !== "loading";

  return (
    <div
      className={getToastClassName({ type: toast.type, isVisible, isLeaving, clickable: !!toast.onClick })}
      role="alert"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onClick={toast.onClick ? handleClick : undefined}
    >
      {/* Nội dung chính */}
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getIconContainerStyle(toast.type)}`}>{getToastIcon(toast.type, toast.icon)}</div>

        {/* Nội dung text */}
        <div className="flex-1 min-w-0 pt-0.5">
          {toast.title && <div className="font-semibold text-sm text-gray-900 mb-1">{toast.title}</div>}
          {toast.description && <div className="text-sm text-gray-600">{toast.description}</div>}

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

        {/* Nút đóng */}
        {toast.dismissible && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Progress bar — width cập nhật trực tiếp qua ref trong useToastTimer, không setState */}
      {showProgressBar && (
        <div className="h-1 bg-gray-100">
          <div ref={progressBarRef} className={`h-full ${getProgressBarColor(toast.type)}`} style={{ width: "100%" }} />
        </div>
      )}
    </div>
  );
}
