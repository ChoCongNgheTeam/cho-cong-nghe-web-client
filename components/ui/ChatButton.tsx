"use client";
import { X, RotateCcw, Maximize2, Minimize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChatBubble } from "./ChatBubble";
import { ChatInput, type ChatInputHandle } from "./chat/ChatInput";
import { MessageBubble } from "./chat/MessageBubble";
import { useChatMessages } from "@/hooks/useChatMessages";
import { chatButtonStyles } from "./chat/chatButton.styles";

const QUICK_REPLIES = ["Còn iPhone 17 không?", "Laptop dưới 15 triệu?", "Tai nghe không dây tốt?", "Chuột gaming giá rẻ?"];

// Panel sizes
const NORMAL_W = 380;
const NORMAL_H = 540;
const MAX_W = 580;
const MAX_H = 700;

// FAB POSITIONING — đồng bộ với FloatingDock (ZaloButton + BackToTopButton).
// Quy ước chung cho cả 3 nút nổi: breakpoint 768px, right 8px(mobile)/16px(desktop).
// ChatButton nằm NGOÀI <FloatingDock> vì cần z-index cao hơn panel chat khi mở
// (làm nút đóng nổi trên panel fullscreen ở mobile). Bottom offset tính thủ công để
// luôn nằm phía trên 2 nút trong dock (Zalo + BackToTop), không chồng.
const BTN_SIZE = 48;
const FAB_RIGHT_MOBILE = 8; // = dock's right-2
const FAB_RIGHT_DESKTOP = 16; // = dock's md:right-4
const BTN_BOTTOM_MOBILE = 200; // trên ZaloButton (160px) + BackToTop (100px), cách đều 60px
const BTN_BOTTOM_DESKTOP = 125; // trên ZaloButton (72px) + BackToTop (24px), cách đều ~50px

type PanelState = "closed" | "normal" | "maximized";

export default function ChatButton() {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [hasUnread, setHasUnread] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);

  const isOpen = panelState !== "closed";
  const isMaximized = panelState === "maximized";
  const size = isOpen ? BTN_SIZE - 12 : BTN_SIZE;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);

  const { messages, loading, newMsgIdx, ready, sendMessage, clearHistory } = useChatMessages({
    onAssistantReply: () => {
      if (!isOpen) setHasUnread(true);
    },
  });

  useEffect(() => {
    const handler = (e: Event) => {
      const open = (e as CustomEvent<{ open: boolean }>).detail.open;
      setSheetOpen(open);
    };
    window.addEventListener("sheet:toggle", handler);
    return () => window.removeEventListener("sheet:toggle", handler);
  }, []);

  useEffect(() => {
    const checkMobile = () => setMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        setHasUnread(false);
        chatInputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!mobile) return;
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, mobile]);

  const openPanel = () => setPanelState("normal");
  const toggleMaximize = () => setPanelState((s) => (s === "maximized" ? "normal" : "maximized"));
  const closePanel = () => setPanelState("closed");

  const showQuickReplies = messages.length === 0 && !loading;

  if (!ready) return null;

  const panelStyle: React.CSSProperties = mobile
    ? {
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        paddingBottom: "env(safe-area-inset-bottom)",
        borderRadius: 0,
        zIndex: 9999,
      }
    : {
        position: "fixed",
        bottom: 16,
        right: FAB_RIGHT_DESKTOP,
        width: isMaximized ? MAX_W : NORMAL_W,
        height: isMaximized ? Math.min(MAX_H, window.innerHeight - 32) : NORMAL_H,
        zIndex: 51,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), height 0.25s cubic-bezier(0.4,0,0.2,1)",
      };

  const btnStyle: React.CSSProperties = {
    position: "fixed",
    right: mobile ? FAB_RIGHT_MOBILE : FAB_RIGHT_DESKTOP,
    bottom: mobile ? `calc(${BTN_BOTTOM_MOBILE}px + env(safe-area-inset-bottom))` : BTN_BOTTOM_DESKTOP,
    width: BTN_SIZE,
    height: BTN_SIZE,
    zIndex: 10000,
  };

  return (
    <>
      <style>{chatButtonStyles}</style>

      {isOpen && mobile && <div className="chat-mobile-backdrop" onClick={closePanel} />}

      {/* PANEL */}
      {isOpen && (
        <div
          className={`rounded-2xl border border-neutral bg-neutral-light shadow-2xl overflow-hidden flex flex-col ${mobile ? "chat-panel-enter-mobile" : "chat-panel-enter-desktop"}`}
          style={panelStyle}
        >
          {/* Header */}
          <div
            className="bg-accent px-4 flex items-center justify-between shrink-0 select-none"
            style={{
              paddingTop: mobile ? `calc(0.75rem + env(safe-area-inset-top))` : "0.75rem",
              paddingBottom: "0.75rem",
            }}
          >
            <div className="flex items-center gap-2.5 pointer-events-none">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center overflow-hidden shrink-0">
                <Image src="/images/Robot-mascot-v2.png" alt="Mascot" width={32} height={32} className="object-contain" />
              </div>
              <div>
                <p className="text-white text-[13px] font-semibold leading-tight">Trợ lý Chợ Công Nghệ</p>
                <p className="text-white/70 text-[11px]">Trả lời tức thì · AI</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <button type="button" onClick={clearHistory} title="Xóa lịch sử" className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10 mr-1">
                  <RotateCcw size={13} />
                </button>
              )}

              {!mobile && (
                <div className="wc-group flex items-center gap-1.5">
                  <button type="button" className="wc-btn wc-close" onClick={closePanel} title="Đóng">
                    <svg viewBox="0 0 8 8" fill="none" stroke="#8B0000" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="1.5" y1="1.5" x2="6.5" y2="6.5" />
                      <line x1="6.5" y1="1.5" x2="1.5" y2="6.5" />
                    </svg>
                  </button>
                  <button type="button" className="wc-btn wc-min" onClick={closePanel} title="Thu nhỏ">
                    <svg viewBox="0 0 8 8" fill="none" stroke="#7A5200" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="1.5" y1="4" x2="6.5" y2="4" />
                    </svg>
                  </button>
                  <button type="button" className="wc-btn wc-max" onClick={toggleMaximize} title={isMaximized ? "Thu lại" : "Phóng to"}>
                    {isMaximized ? <Minimize2 size={7} color="#0A5C00" strokeWidth={2.5} /> : <Maximize2 size={7} color="#0A5C00" strokeWidth={2.5} />}
                  </button>
                </div>
              )}

              {mobile && (
                <button type="button" onClick={closePanel} className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10">
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-3 py-3 bg-neutral-light-hover min-h-0">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-1 overflow-hidden">
                  <Image src="/images/Robot-mascot-v2.png" alt="Mascot" width={48} height={48} className="object-contain" />
                </div>
                <p className="text-[13px] text-primary font-semibold">Xin chào! 👋</p>
                <p className="text-[13px] text-primary leading-relaxed">Tôi có thể tư vấn sản phẩm, giá cả và tình trạng hàng cho bạn.</p>
              </div>
            )}

            {messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} isNew={i === newMsgIdx} />
            ))}

            {loading && (
              <div className="flex items-end gap-1.5 chat-msg-enter">
                <div className="w-6 h-6 rounded-full bg-accent/10 shrink-0 flex items-center justify-center">
                  <Image src="/images/Robot-mascot-v2.png" alt="Mascot" width={16} height={16} className="object-contain rounded-full" />
                </div>
                <div className="bg-white border border-neutral rounded-2xl rounded-bl-sm px-3.5 py-3 shadow-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark/35 dot-1" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark/35 dot-2" />
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-dark/35 dot-3" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick replies */}
          {showQuickReplies && (
            <div className="px-3 pt-2 pb-2 flex flex-wrap gap-1.5 border-t border-neutral bg-neutral-light shrink-0">
              {QUICK_REPLIES.map((q) => (
                <button
                  type="button"
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded-full border border-accent/30 text-accent bg-accent/5 hover:bg-accent/15 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <ChatInput ref={chatInputRef} loading={loading} mobile={mobile} onSend={sendMessage} />
        </div>
      )}

      {/* TOGGLE BUTTON */}
      <button
        type="button"
        onClick={isOpen ? closePanel : openPanel}
        aria-label="Chat support"
        className={`relative rounded-full bg-white border border-neutral-100 flex items-center justify-center
    shadow-[0_8px_30px_rgb(0,0,0,0.14)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.20)]
    transition-all duration-300 select-none active:scale-90 overflow-visible cursor-pointer
    ${sheetOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
  `}
        style={{ ...btnStyle, width: size, height: size }}
      >
        {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white z-10 animate-[unreadPulse_1.8s_ease-in-out_infinite]" />}
        {!hasUnread && !isOpen && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white z-10" />}

        {isOpen ? (
          <X size={16} strokeWidth={2.5} className="text-neutral-600" />
        ) : (
          <>
            <ChatBubble />
            <div className="animate-[mascotFloat_3s_ease-in-out_infinite] flex items-center justify-center" style={{ width: size, height: size }}>
              <Image src="/images/Robot-mascot-v2.png" alt="Chat bot" width={40} height={40} className="object-contain drop-shadow-md" />
            </div>
          </>
        )}
      </button>
    </>
  );
}
