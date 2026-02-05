// components/shared/CategoryIcon.tsx
"use client";

import React from 'react';

interface CategoryIconProps {
  icon: string;
  label: string;
  onClick?: () => void;
}

export default function CategoryIcon({ icon, label, onClick }: CategoryIconProps) {
  return (
    <div 
      onClick={onClick}
      className="flex flex-col items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 relative">
        <img 
          src={icon} 
          alt={label} 
          className="w-full h-full object-contain" 
        />
      </div>
      <span className="text-xs sm:text-sm text-center text-primary font-medium line-clamp-2">
        {label}
      </span>
    </div>
  );
}