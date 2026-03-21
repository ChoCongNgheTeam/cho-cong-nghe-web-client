"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";

// CKEditor không hỗ trợ SSR — phải dynamic import
// Wrapper này giúp tái sử dụng ở cả new và edit page

interface CKEditorWrapperProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
}

// Dynamic import toàn bộ CKEditor component
const CKEditorClient = dynamic(() => import("./CKEditorClient"), {
  ssr: false,
  loading: () => (
    <div className="w-full border border-neutral rounded-xl bg-neutral-light animate-pulse" style={{ minHeight: 400 }}>
      <div className="h-10 border-b border-neutral rounded-t-xl bg-neutral-light-active" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-neutral-light-active rounded w-3/4" />
        <div className="h-4 bg-neutral-light-active rounded w-1/2" />
        <div className="h-4 bg-neutral-light-active rounded w-5/6" />
      </div>
    </div>
  ),
});

export function CKEditorWrapper({ value, onChange, placeholder, minHeight = 400 }: CKEditorWrapperProps) {
  return <CKEditorClient value={value} onChange={onChange} placeholder={placeholder} minHeight={minHeight} />;
}
