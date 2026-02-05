// components/shared/SectionTitle.tsx
"use client";

import React from 'react';

interface SectionTitleProps {
  title: string;
  actionText?: string;
  onActionClick?: () => void;
}

export default function SectionTitle({ title, actionText, onActionClick }: SectionTitleProps) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-primary">{title}</h2>
      {actionText && (
        <button 
          onClick={onActionClick}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
        >
          {actionText} →
        </button>
      )}
    </div>
  );
}