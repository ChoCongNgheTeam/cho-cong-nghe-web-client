"use client";

import { ReactNode } from "react";

export default function FloatingDock({ children }: { children: ReactNode }) {
  return <div className="fixed z-50 flex flex-col items-end gap-2 bottom-25 right-2 md:bottom-6 md:right-4">{children}</div>;
}
