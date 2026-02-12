"use client";

import { useState } from "react";

type ButtonProps = {
  children: React.ReactNode;
  variant?: "yellow-outline" | "primary";
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

  // Build class string theo điều kiện
  let buttonClass = 
    "cursor-pointer transition-all flex items-center justify-center gap-2 " +
    "px-4 py-2 text-sm font-semibold rounded-lg " +
    "active:scale-95 ";

  if (variant === "yellow-outline") {
    buttonClass += "bg-[#3b82f6] hover:bg-[#2563eb] text-white ";
  } else if (variant === "primary") {
    buttonClass += "bg-blue-600 hover:bg-blue-700 text-white ";
  }

  // Thêm class tuỳ biến từ props
  buttonClass += className;

  return (
    <button type="button" onClick={handleClick} className={buttonClass}>
      {clicked && clickSymbol}
      <span>{children}</span>
    </button>
  );
}
