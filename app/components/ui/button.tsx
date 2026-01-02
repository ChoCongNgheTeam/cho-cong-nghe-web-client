"use client";

import { useState } from "react";
import clsx from "clsx";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "yellow" | "primary";
  clickSymbol?: string;
  notificationMessage?: string;
  className?: string;
};

export default function Button({
  children,
  variant = "primary",
  clickSymbol,
  notificationMessage,
  className = "",
}: ButtonProps) {
  const [clicked, setClicked] = useState(false);

  const handleClick = () => {
    if (clickSymbol) {
      setClicked(true);
      setTimeout(() => setClicked(false), 1200);
    }

    if (notificationMessage) {
      alert(notificationMessage);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={clsx(
        // base
        "cursor-pointer transition-all flex items-center justify-center gap-2",
        "px-4 py-2 text-sm font-semibold rounded-lg",
        "active:scale-95",

        // variant
        variant === "yellow" &&
          "bg-[#f5d142] hover:bg-[#ebc530] text-gray-900",
        variant === "primary" &&
          "bg-blue-600 hover:bg-blue-700 text-white",

        // custom
        className
      )}
    >
      {clicked && clickSymbol}
      <span>{children}</span>
    </button>
  );
}
