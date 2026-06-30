"use client";

/**
 * Component upload file Excel/CSV để bulk import (update stock/price).
 * Tái sử dụng được cho bất kỳ trang nào cần import.
 *
 * Usage trong page admin products:
 *   <ImportButton
 *     onImport={(file) => importProducts(file)}
 *     onDownloadTemplate={() => downloadImportTemplate()}
 *   />
 */

import { useState, useRef } from "react";
import { Upload, FileDown, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";

interface ImportError {
  row: number;
  variantId: string;
  reason: string;
}

interface ImportResult {
  updated: number;
  skipped: number;
  errors: ImportError[];
}

interface ImportButtonProps {
  onImport: (file: File) => Promise<{ data: ImportResult; message: string }>;
  onDownloadTemplate: () => Promise<{ blob: Blob; filename: string }>;
  disabled?: boolean;
  onSuccess?: (result: ImportResult) => void;
}

export function ImportButton({ onImport, onDownloadTemplate, disabled, onSuccess }: ImportButtonProps) {
  const [state, setState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const triggerDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      const { blob, filename } = await onDownloadTemplate();
      triggerDownload(blob, filename);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Không thể tải template");
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input để có thể upload lại cùng file
    e.target.value = "";

    setState("uploading");
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await onImport(file);
      setResult(res.data);
      setState("done");
      onSuccess?.(res.data);
    } catch (e: any) {
      setErrorMsg(e?.message ?? "Import thất bại");
      setState("error");
    }
  };

  const reset = () => {
    setState("idle");
    setResult(null);
    setErrorMsg(null);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Template download */}
      <button
        onClick={handleTemplate}
        disabled={downloadingTemplate || disabled}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-all cursor-pointer disabled:opacity-50"
      >
        {downloadingTemplate ? <Loader2 size={14} className="animate-spin" /> : <FileDown size={14} />}
        File mẫu
      </button>

      {/* Upload trigger */}
      <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileChange} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={state === "uploading" || disabled}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-[12px] font-medium transition-all cursor-pointer
          ${state === "uploading" ? "border-neutral text-neutral-dark/50 bg-neutral-light-active opacity-60 cursor-not-allowed" : "border-accent/40 text-accent hover:bg-accent/5"}`}
      >
        {state === "uploading" ? (
          <>
            <Loader2 size={14} className="animate-spin" /> Đang import...
          </>
        ) : (
          <>
            <Upload size={14} /> Import Excel/CSV
          </>
        )}
      </button>

      {/* Result toast inline */}
      {state === "done" && result && (
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px]
          ${result.errors.length > 0 ? "border-amber-200 bg-amber-50 text-amber-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}
        >
          {result.errors.length === 0 ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
          <span>
            ✅ {result.updated} cập nhật
            {result.skipped > 0 && ` · ⏭ ${result.skipped} bỏ qua`}
            {result.errors.length > 0 && ` · ❌ ${result.errors.length} lỗi`}
          </span>
          <button onClick={reset} className="ml-1 hover:opacity-70 cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}

      {state === "error" && errorMsg && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 text-red-700 text-[12px]">
          <AlertCircle size={13} />
          {errorMsg}
          <button onClick={reset} className="ml-1 hover:opacity-70 cursor-pointer">
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
