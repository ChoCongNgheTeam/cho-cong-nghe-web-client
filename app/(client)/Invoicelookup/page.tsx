"use client";

import { useState, useRef } from "react";
import { Invoice } from "./Invoice.types";
import { MOCK_INVOICES } from "./Invoice.data";
import { SearchCard, StatusBanner, InvoiceCard } from "./components/Invoice";

type Phase = "idle" | "loading" | "found" | "notfound";

export default function InvoiceLookupPage() {
  const [code, setCode] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [err, setErr] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const search = async () => {
    const q = code.trim().toUpperCase();
    if (!q) {
      setErr("Vui lòng nhập mã hoá đơn");
      return;
    }
    setErr("");
    setPhase("loading");
    setInvoice(null);
    await new Promise((r) => setTimeout(r, 1100));
    const hit = MOCK_INVOICES[q];
    if (hit) {
      setInvoice(hit);
      setPhase("found");
    } else setPhase("notfound");
  };

  const reset = () => {
    setCode("");
    setInvoice(null);
    setPhase("idle");
    setErr("");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    setErr("");
  };

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-800"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      {/* Top glow */}
      <div
        className="fixed top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(6,182,212,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-2xl mx-auto px-5 py-14">
        {/* ── Header ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 border border-cyan-300 bg-cyan-50 text-cyan-600 text-xs tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
            Cổng tra cứu điện tử
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-3 leading-tight text-slate-900">
            Tra cứu{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{
                backgroundImage: "linear-gradient(135deg, #0891b2, #3b82f6)",
              }}
            >
              Hoá đơn
            </span>
          </h1>
          <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed">
            Nhập mã hoá đơn để xem thông tin chi tiết, trạng thái và tải bản
            PDF.
          </p>
        </div>

        {/* ── Search Card ── */}
        <SearchCard
          code={code}
          phase={phase}
          err={err}
          sampleKeys={Object.keys(MOCK_INVOICES)}
          onChange={handleCodeChange}
          onSearch={search}
          onPickSample={(k) => {
            setCode(k);
            setErr("");
          }}
          inputRef={inputRef}
        />

        {/* ── Not Found ── */}
        {phase === "notfound" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mx-auto mb-4">
              🔍
            </div>
            <h3 className="font-semibold mb-2 text-slate-800">
              Không tìm thấy hoá đơn
            </h3>
            <p className="text-slate-400 text-sm mb-5">
              Mã{" "}
              <span className="text-slate-600 font-mono">
                {code.trim().toUpperCase()}
              </span>{" "}
              không tồn tại. Kiểm tra lại hoặc liên hệ hỗ trợ.
            </p>
            <button
              onClick={reset}
              className="text-sm text-cyan-600 hover:text-cyan-700 border border-cyan-300 hover:border-cyan-400 px-5 py-2 rounded-xl transition-colors"
            >
              ← Thử lại
            </button>
          </div>
        )}

        {/* ── Result ── */}
        {phase === "found" && invoice && (
          <div className="space-y-3">
            <StatusBanner invoice={invoice} onReset={reset} />
            <InvoiceCard invoice={invoice} />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-12 text-center space-y-2">
          <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
            {[
              "🔒 SSL 256-bit",
              "📋 Mã hoá end-to-end",
              "✓ Chuẩn TCVN 11-2021",
            ].map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            © 2024 Hệ thống hoá đơn điện tử · Hotline: 1800 0000
          </p>
        </div>
      </div>
    </div>
  );
}
