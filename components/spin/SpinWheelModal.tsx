"use client";

import { useMemo, useRef, useState } from "react";
import { X, Sparkles, Copy, Check } from "lucide-react";
import { useToasty } from "@/components/toast";
import { spinWheel, type SpinPrizePublic, type SpinResult } from "@/lib/api/spin.api";

const FALLBACK_COLORS = ["#F97316", "#3B82F6", "#22C55E", "#EC4899", "#A855F7", "#EAB308", "#EF4444", "#14B8A6"];

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  prizes: SpinPrizePublic[];
  canSpin: boolean;
  wonPrize: { label: string; voucherCode: string | null } | null;
}

export default function SpinWheelModal({ isOpen, onClose, prizes, canSpin, wonPrize }: SpinWheelModalProps) {
  const { error: toastError } = useToasty();

  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResult | null>(null);
  const [alreadyWon] = useState(wonPrize);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const n = prizes.length;
  const segmentAngle = n > 0 ? 360 / n : 0;

  const wheelBackground = useMemo(() => {
    if (n === 0) return "#e5e5e5";
    const stops = prizes.map((p, i) => `${p.colorHex || FALLBACK_COLORS[i % FALLBACK_COLORS.length]} ${i * segmentAngle}deg ${(i + 1) * segmentAngle}deg`);
    return `conic-gradient(${stops.join(", ")})`;
  }, [prizes, n, segmentAngle]);

  if (!isOpen) return null;

  const handleSpin = async () => {
    if (spinning || n === 0) return;
    setSpinning(true);
    try {
      const res = await spinWheel();
      const idx = prizes.findIndex((p) => p.id === res.data.prizeId);
      const safeIdx = idx >= 0 ? idx : 0;
      const mid = safeIdx * segmentAngle + segmentAngle / 2;
      const jitter = (Math.random() - 0.5) * segmentAngle * 0.5;
      const extraSpins = 5 * 360;
      const target = extraSpins + (360 - mid) + jitter;

      setRotation(target);

      timeoutRef.current = setTimeout(() => {
        setResult(res.data);
        setSpinning(false);
      }, 4200);
    } catch (err: unknown) {
      setSpinning(false);
      toastError((err as Error)?.message || "Không thể quay lúc này, vui lòng thử lại");
    }
  };

  const finalResult = result ?? alreadyWon;
  const showResult = !!finalResult;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={spinning ? undefined : onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-neutral-light rounded-2xl shadow-2xl w-full max-w-sm max-h-[92vh] overflow-y-auto p-5 relative">
          <button
            onClick={onClose}
            disabled={spinning}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-neutral-dark hover:bg-neutral-light-active transition-colors disabled:opacity-40"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-accent" />
            <h3 className="text-[16px] font-bold text-primary">Vòng quay may mắn</h3>
          </div>

          {n === 0 ? (
            <p className="text-[13px] text-neutral-dark text-center py-10">Chương trình hiện chưa sẵn sàng, vui lòng quay lại sau nhé!</p>
          ) : showResult ? (
            <SpinResultView result={finalResult} onClose={onClose} />
          ) : (
            <div className="flex flex-col items-center gap-5 py-2">
              <div className="relative w-full max-w-[260px] aspect-square mx-auto">
                {/* Con trỏ */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 z-10 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-promotion" />

                <div
                  className="w-full h-full rounded-full border-4 border-white shadow-lg relative overflow-hidden"
                  style={{
                    background: wheelBackground,
                    transform: `rotate(${rotation}deg)`,
                    transition: spinning ? "transform 4.2s cubic-bezier(0.17, 0.67, 0.16, 0.99)" : "none",
                  }}
                >
                  {prizes.map((p, i) => {
                    const mid = i * segmentAngle + segmentAngle / 2;
                    return (
                      <div key={p.id} className="absolute top-1/2 left-1/2 w-1/2 h-0 origin-left" style={{ transform: `rotate(${mid}deg)` }}>
                        {/* Xoay ngược lại đúng bằng mid (tính trong hệ toạ độ đã xoay của div cha)
                            → tổng góc xoay tuyệt đối = 0, chữ luôn nằm ngang dù ô ở vị trí nào trên vòng quay */}
                        <div className="absolute right-3 top-0 -translate-y-1/2" style={{ transform: `rotate(${-mid}deg)` }}>
                          <span className="block text-[10px] font-bold text-white drop-shadow whitespace-nowrap max-w-[64px] truncate">{p.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-white shadow flex items-center justify-center">
                  <Sparkles size={20} className="text-accent" />
                </div>
              </div>

              {canSpin ? (
                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="w-full py-3 bg-accent hover:bg-accent/90 disabled:opacity-60 text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer"
                >
                  {spinning ? "Đang quay..." : "QUAY NGAY"}
                </button>
              ) : (
                <p className="text-[12px] text-neutral-dark text-center">Bạn đã sử dụng lượt quay của mình rồi.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function SpinResultView({ result, onClose }: { result: { label: string; voucherCode: string | null }; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result.voucherCode) return;
    try {
      await navigator.clipboard.writeText(result.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard có thể bị chặn ở vài trình duyệt — bỏ qua, không chặn UX
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-6 text-center">
      <div className="w-16 h-16 rounded-full bg-accent-light flex items-center justify-center">
        <Sparkles size={28} className="text-accent" />
      </div>
      <div>
        <p className="text-[15px] font-bold text-primary mb-1">🎉 {result.label}</p>
        {result.voucherCode ? (
          <p className="text-[12px] text-neutral-dark">Mã voucher đã được lưu vào tài khoản của bạn</p>
        ) : (
          <p className="text-[12px] text-neutral-dark">Chúc bạn may mắn ở những lần sau!</p>
        )}
      </div>

      {result.voucherCode && (
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-accent rounded-xl text-accent font-mono font-bold text-[15px] cursor-pointer hover:bg-accent-light/30 transition-colors"
        >
          {result.voucherCode}
          {copied ? <Check size={15} /> : <Copy size={15} />}
        </button>
      )}

      <button onClick={onClose} className="w-full py-2.5 bg-primary text-neutral-light text-[13px] font-semibold rounded-xl hover:bg-primary-hover transition-colors cursor-pointer">
        Đóng
      </button>
    </div>
  );
}
