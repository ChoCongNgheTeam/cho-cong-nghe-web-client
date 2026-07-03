"use client";

import React from "react";
import { Toast, ToastPosition } from "./types";
import ToastItem from "./ToastItem";

interface ToastContainerProps {
  toasts: Toast[];
  dismiss: (id: string) => void;
}

const POSITIONS: ToastPosition[] = ["top-left", "top-center", "top-right", "bottom-left", "bottom-center", "bottom-right"];

const POSITION_BASE_CLASS = "fixed z-9999 flex flex-col gap-3 p-4 pointer-events-none";

const POSITION_CLASSES: Record<ToastPosition, string> = {
  "top-left": `${POSITION_BASE_CLASS} top-16 left-0`,
  "top-center": `${POSITION_BASE_CLASS} top-16 left-1/2 -translate-x-1/2`,
  "top-right": `${POSITION_BASE_CLASS} top-16 right-0`,
  "bottom-left": `${POSITION_BASE_CLASS} bottom-0 left-0`,
  "bottom-center": `${POSITION_BASE_CLASS} bottom-0 left-1/2 -translate-x-1/2`,
  "bottom-right": `${POSITION_BASE_CLASS} bottom-0 right-0`,
};

export default function ToastContainer({ toasts, dismiss }: ToastContainerProps) {
  return (
    <>
      {POSITIONS.map((position) => {
        const positionToasts = toasts.filter((t) => t.position === position);
        if (positionToasts.length === 0) return null;

        return (
          <div key={position} className={POSITION_CLASSES[position]}>
            {positionToasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} dismiss={dismiss} />
            ))}
          </div>
        );
      })}
    </>
  );
}
