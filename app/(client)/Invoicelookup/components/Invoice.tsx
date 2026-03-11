"use client";

import { Invoice, StatusConfig } from "../Invoice.types";
import { fmt, STATUS_CONFIG, subtotalOf } from "../Invoice.data";

/* ── Row ── */
interface RowProps {
  label: string;
  val: string;
  mono?: boolean;
}

export function Row({ label, val, mono = false }: RowProps) {
  return (
    <div className="flex gap-2 items-start">
      <span className="text-xs text-slate-400 w-24 shrink-0 pt-0.5">{label}</span>
      <span className={`text-xs text-slate-700 leading-relaxed ${mono ? "font-mono" : ""}`}>{val}</span>
    </div>
  );
}

/* ── TotalRow ── */
interface TotalRowProps {
  label: string;
  val: string;
  accent?: boolean;
}

export function TotalRow({ label, val, accent = false }: TotalRowProps) {
  return (
    <div className="flex justify-between items-center w-52">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`font-mono ${accent ? "text-cyan-600 font-bold text-base" : "text-sm text-slate-700"}`}>{val}</span>
    </div>
  );
}

/* ── StatusBanner ── */
interface StatusBannerProps {
  invoice: Invoice;
  onReset: () => void;
}

export function StatusBanner({ invoice, onReset }: StatusBannerProps) {
  const sc: StatusConfig = STATUS_CONFIG[invoice.status];
  return (
    <div className={`${sc.bg} ${sc.border} border rounded-2xl px-5 py-4 flex items-center gap-4`}>
      <div className={`w-9 h-9 rounded-xl ${sc.badge} flex items-center justify-center font-bold shrink-0`}>
        {sc.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`font-semibold text-sm ${sc.text}`}>{sc.label}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${sc.badge}`}>{invoice.id}</span>
        </div>
        <p className={`text-xs mt-0.5 opacity-70 ${sc.text}`}>
          {invoice.status === "paid"      && `Đã thanh toán ngày ${invoice.paidDate}`}
          {invoice.status === "pending"   && `Hạn thanh toán: ${invoice.dueDate}`}
          {invoice.status === "cancelled" && `Hoá đơn bị huỷ ngày ${invoice.date}`}
        </p>
      </div>
      <button onClick={onReset}
        className="text-xs text-slate-500 hover:text-slate-800 border border-slate-300 hover:border-slate-400 px-3 py-1.5 rounded-lg transition-colors shrink-0 bg-white">
        Tra cứu khác
      </button>
    </div>
  );
}

/* ── InvoiceCard ── */
interface InvoiceCardProps {
  invoice: Invoice;
}

export function InvoiceCard({ invoice }: InvoiceCardProps) {
  const sub = subtotalOf(invoice.items);
  const tax = Math.round((sub - invoice.discount) * invoice.tax / 100);
  const tot = sub - invoice.discount + tax;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">

      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-start gap-4 bg-slate-50/60">
        <div>
          <p className="text-[11px] text-slate-400 tracking-widest uppercase mb-1">Hoá đơn GTGT điện tử</p>
          <p className="font-bold text-xl font-mono text-slate-900">{invoice.id}</p>
          <p className="text-xs text-slate-400 mt-1.5">
            Ký hiệu <span className="text-slate-600">{invoice.template}</span>
            <span className="mx-2 opacity-30">|</span>
            Serial <span className="text-slate-600">{invoice.serial}</span>
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] text-slate-400 mb-1">Ngày phát hành</p>
          <p className="text-sm font-semibold text-slate-800">{invoice.date}</p>
        </div>
      </div>

      {/* Customer */}
      <div className="px-6 py-5 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <p className="text-[11px] text-slate-400 tracking-widest uppercase mb-3">Thông tin khách hàng</p>
          <div className="space-y-2">
            <Row label="Họ tên"     val={invoice.customer} />
            <Row label="Email"      val={invoice.email} />
            <Row label="Điện thoại" val={invoice.phone} />
            {invoice.taxCode && <Row label="MST" val={invoice.taxCode} mono />}
          </div>
        </div>
        <div>
          <p className="text-[11px] text-slate-400 tracking-widest uppercase mb-3">Địa chỉ</p>
          <p className="text-xs text-slate-600 leading-relaxed">{invoice.address}</p>
        </div>
      </div>

      {/* Items table */}
      <div className="px-6 py-5 border-b border-slate-100">
        <p className="text-[11px] text-slate-400 tracking-widest uppercase mb-4">Hàng hoá / Dịch vụ</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                {["#", "Tên hàng hoá / dịch vụ", "SL", "ĐVT", "Đơn giá", "Thành tiền"].map((h, i) => (
                  <th key={i} className={`text-[11px] text-slate-400 font-semibold pb-3 ${
                    i === 0 ? "text-left w-6" : i === 1 ? "text-left" : i < 4 ? "text-center" : "text-right"
                  }`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {invoice.items.map((item, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 text-slate-300 text-xs">{i + 1}</td>
                  <td className="py-3 text-slate-700 text-sm">{item.name}</td>
                  <td className="py-3 text-center text-slate-600 text-sm">{item.qty}</td>
                  <td className="py-3 text-center text-slate-400 text-xs">{item.unit}</td>
                  <td className="py-3 text-right text-slate-500 font-mono text-xs">{fmt(item.price)}</td>
                  <td className="py-3 text-right text-slate-800 font-mono text-xs font-semibold">{fmt(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="px-6 py-5 border-b border-slate-100 flex justify-end bg-slate-50/40">
        <div className="space-y-2">
          <TotalRow label="Tạm tính" val={fmt(sub)} />
          {invoice.discount > 0 && (
            <div className="flex justify-between items-center w-52">
              <span className="text-xs text-slate-400">Giảm giá</span>
              <span className="text-sm font-mono text-emerald-600">- {fmt(invoice.discount)}</span>
            </div>
          )}
          <TotalRow label={`Thuế GTGT (${invoice.tax}%)`} val={fmt(tax)} />
          <div className="pt-2 border-t border-slate-200">
            <TotalRow label="Tổng cộng" val={fmt(tot)} accent />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-white">
        <p className="text-xs text-slate-400">Phát hành: {invoice.date}</p>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 text-xs bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            In hoá đơn
          </button>
          <button className="flex items-center gap-1.5 text-xs bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Tải PDF
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── SearchCard ── */
interface SearchCardProps {
  code: string;
  phase: string;
  err: string;
  sampleKeys: string[];
  onChange: (val: string) => void;
  onSearch: () => void;
  onPickSample: (key: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

export function SearchCard({ code, phase, err, sampleKeys, onChange, onSearch, onPickSample, inputRef }: SearchCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm">
      <label className="block text-[11px] font-semibold text-slate-400 tracking-[0.15em] uppercase mb-3">
        Mã hoá đơn
      </label>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <input
            ref={inputRef}
            value={code}
            onChange={e => onChange(e.target.value)}
            onKeyDown={e => e.key === "Enter" && onSearch()}
            placeholder="VD: HD-2024-001234"
            className={`w-full bg-slate-50 border rounded-xl pl-10 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-mono tracking-wide ${
              err
                ? "border-red-400 focus:ring-red-400 bg-red-50"
                : "border-slate-200 focus:border-cyan-500 focus:ring-cyan-400/30"
            }`}
          />
        </div>
        <button
          onClick={onSearch}
          disabled={phase === "loading"}
          className="bg-cyan-600 hover:bg-cyan-700 active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 text-white font-semibold text-sm px-5 rounded-xl transition-all shrink-0 flex items-center gap-2"
        >
          {phase === "loading" ? (
            <>
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Đang tìm
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Tra cứu
            </>
          )}
        </button>
      </div>

      {err && (
        <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
          <span>⚠</span> {err}
        </p>
      )}

      <div className="mt-4 pt-4 border-t border-slate-100">
        <p className="text-[11px] text-slate-400 mb-2">Thử với mã mẫu:</p>
        <div className="flex flex-wrap gap-2">
          {sampleKeys.map(k => (
            <button key={k} onClick={() => onPickSample(k)}
              className="text-xs font-mono bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-cyan-600 border border-slate-200 px-3 py-1 rounded-lg transition-colors">
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}