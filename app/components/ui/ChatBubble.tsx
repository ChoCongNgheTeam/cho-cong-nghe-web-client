"use client";
import { useEffect, useRef, useState } from "react";

const MESSAGES = ["👋 Xin chào, cần mình hỗ trợ gì không?", "💬 Mình luôn sẵn sàng giúp bạn!", "🛒 Tìm sản phẩm? Mình tư vấn ngay!"];

export function ChatBubble() {
  const [visible, setVisible] = useState(true);
  const [exiting, setExiting] = useState(false);
  const [chars, setChars] = useState<string[]>([]);
  const [typing, setTyping] = useState(true);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  function type(text: string, onDone: () => void) {
    const letters = [...text];
    let i = 0;
    setChars([]);
    setTyping(true);
    function next() {
      if (i < letters.length) {
        const c = letters[i++];
        setChars((p) => [...p, c]);
        timerRef.current = setTimeout(next, i === 1 ? 80 : 44);
      } else {
        setTyping(false);
        timerRef.current = setTimeout(onDone, 120);
      }
    }
    next();
  }

  function hide() {
    setExiting(true);
    timerRef.current = setTimeout(() => {
      setVisible(false);
      setExiting(false);
      idxRef.current = (idxRef.current + 1) % MESSAGES.length;
      timerRef.current = setTimeout(show, 7000);
    }, 300);
  }

  function show() {
    setVisible(true);
    type(MESSAGES[idxRef.current], () => {
      timerRef.current = setTimeout(hide, 7000);
    });
  }

  useEffect(() => {
    show();
    return () => clearTimeout(timerRef.current);
  }, []);

  if (!visible) return null;

  return (
    <div className="absolute bottom-[calc(100%+14px)] right-[-4px] pointer-events-none z-20" style={{ width: "max-content", maxWidth: 180 }}>
      {/* Cloud body */}
      <div
        className={`
        relative bg-white border border-slate-200
        rounded-[18px_18px_18px_6px]
        px-3.5 py-2.5
        shadow-[0_6px_20px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]
        text-[13px] font-medium text-neutral-700
        leading-[1.55] tracking-[0.01em]
        word-break break-word whitespace-normal
        transition-all duration-300 origin-bottom-right
        ${exiting ? "opacity-0 scale-90 translate-y-2" : "opacity-100 scale-100 translate-y-0 animate-[bubbleIn_.35s_cubic-bezier(.22,1,.36,1)_forwards]"}
      `}
      >
        <span>
          {chars.map((ch, i) => (
            <span key={i} className="inline animate-[charIn_.18s_ease_forwards]">
              {ch}
            </span>
          ))}
        </span>
        {typing && (
          <span className="inline-flex items-center gap-[3px] ml-1 align-middle">
            <span className="w-[5px] h-[5px] rounded-full bg-neutral-400 animate-[dotBounce_1.2s_ease-in-out_0ms_infinite]" />
            <span className="w-[5px] h-[5px] rounded-full bg-neutral-400 animate-[dotBounce_1.2s_ease-in-out_200ms_infinite]" />
            <span className="w-[5px] h-[5px] rounded-full bg-neutral-400 animate-[dotBounce_1.2s_ease-in-out_400ms_infinite]" />
          </span>
        )}

        {/* Tail hình tam giác */}
        <span
          className="absolute -bottom-[9px] right-3 w-0 h-0 transition-opacity duration-300"
          style={{
            borderLeft: "8px solid transparent",
            borderTop: "10px solid white",
            filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.07))",
          }}
        />
        {/* Tail border */}
        <span
          className="absolute -bottom-[10px] right-[10px] w-0 h-0 -z-10"
          style={{
            borderLeft: "9px solid transparent",
            borderTop: "11px solid #e2e8f0",
          }}
        />
      </div>
    </div>
  );
}
