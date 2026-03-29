"use client";
import apiRequest from "@/lib/api";
import { MessageCircle, X, Send, Bot, User, RotateCcw } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
   role: "user" | "assistant";
   content: string;
}

interface ChatResponse {
   success: boolean;
   data: { role: "assistant"; content: string };
}

const STORAGE_KEY = "cho-cong-nghe:chat-history";
const POS_KEY = "cho-cong-nghe:chat-pos";
const SIZE_KEY = "cho-cong-nghe:chat-size";
const MAX_STORED = 20;

const QUICK_REPLIES = [
   "Có iPhone 15 không?",
   "Laptop dưới 15 triệu?",
   "Tai nghe không dây tốt?",
   "Chuột gaming giá rẻ?",
];

const MIN_W = 280;
const MAX_W = 680;
const MIN_H = 340;
const MAX_H = 800;
const DEFAULT_W = 320;
const DEFAULT_H = 480;
const BTN_SIZE = 43;
// ── Nút chat nằm cao hơn để nhường chỗ cho nút scrollToTop (~56px) ──────────
const BTN_MARGIN_RIGHT = 22;
const BTN_MARGIN_BOTTOM = 140; // tránh đè lên scrollToTop
const BTN_MARGIN_BOTTOM_MOBILE = 130;
const BTN_MARGIN_BOTTOM_DESKTOP = 80;
function renderMarkdown(text: string): string {
   return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(
         /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
         '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>',
      )
      .replace(/^[\-\*] (.+)$/gm, "<li>$1</li>")
      .replace(/(<li>[\s\S]*?<\/li>)/g, "<ul>$1</ul>")
      .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
      .replace(/\n{2,}/g, "</p><p>")
      .replace(/\n/g, "<br/>");
}

function MessageBubble({ msg, isNew }: { msg: Message; isNew?: boolean }) {
   const isUser = msg.role === "user";
   const html = isUser ? msg.content : renderMarkdown(msg.content);

   return (
      <div
         className={`flex items-end gap-1.5 ${isUser ? "flex-row-reverse" : "flex-row"} ${isNew ? "chat-msg-enter" : ""}`}
      >
         <div
            className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center transition-transform hover:scale-110 ${isUser ? "bg-accent/20" : "bg-accent/10"}`}
         >
            {isUser ? (
               <User size={12} className="text-accent" />
            ) : (
               <Bot size={12} className="text-accent" />
            )}
         </div>
         {isUser ? (
            <div className="max-w-[82%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-accent text-white rounded-br-sm">
               {msg.content}
            </div>
         ) : (
            <div
               className="max-w-[82%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-white text-neutral-dark border border-neutral rounded-bl-sm shadow-sm prose-chat"
               dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }}
            />
         )}
      </div>
   );
}

function clampPos(x: number, y: number, w: number, h: number) {
   return {
      x: Math.max(0, Math.min(x, window.innerWidth - w)),
      y: Math.max(0, Math.min(y, window.innerHeight - h)),
   };
}

// ── Detect mobile (<=768px) ───────────────────────────────────────────────────
function isMobile() {
   if (typeof window === "undefined") return false;
   return window.innerWidth <= 768;
}

export default function ChatButton() {
   const [open, setOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [newMsgIdx, setNewMsgIdx] = useState<number | null>(null);
   const [hasUnread, setHasUnread] = useState(false);
   const [ready, setReady] = useState(false);
   const [mobile, setMobile] = useState(false);

   // Desktop: draggable positions
   const [panelPos, setPanelPos] = useState({ x: 0, y: 0 });
   const [panelSize, setPanelSize] = useState({ w: DEFAULT_W, h: DEFAULT_H });

   const panelPosRef = useRef({ x: 0, y: 0 });
   const panelSizeRef = useRef({ w: DEFAULT_W, h: DEFAULT_H });
   const panelManualPos = useRef(false);

   const isDraggingPanel = useRef(false);
   const isResizing = useRef(false);

   const ref = useRef<HTMLDivElement>(null);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);
   useEffect(() => {
      panelPosRef.current = panelPos;
   }, [panelPos]);
   useEffect(() => {
      panelSizeRef.current = panelSize;
   }, [panelSize]);

   const calcPanelFromBtn = useCallback(
      (bx: number, by: number, pw: number, ph: number) => {
         const vw = window.innerWidth;
         const vh = window.innerHeight;
         let px = bx + BTN_SIZE / 2 - pw / 2;
         let py = by - ph - 12;
         if (py < 8) py = by + BTN_SIZE + 12;
         px = Math.max(8, Math.min(px, vw - pw - 8));
         py = Math.max(8, Math.min(py, vh - ph - 8));
         return { x: px, y: py };
      },
      [],
   );

   // ── Init on mount ────────────────────────────────────────────────────────
   useEffect(() => {
      const mob = isMobile();
      setMobile(mob);

      // Nút chat: góc phải, đủ cao để tránh scrollToTop
      const defaultBtnX = window.innerWidth - BTN_SIZE - BTN_MARGIN_RIGHT;
      const defaultBtnY = window.innerHeight - BTN_SIZE - BTN_MARGIN_BOTTOM;

      let bx = defaultBtnX;
      let by = defaultBtnY;
      let pw = DEFAULT_W;
      let ph = DEFAULT_H;

      try {
         const storedMsgs = localStorage.getItem(STORAGE_KEY);
         if (storedMsgs) {
            const parsed: Message[] = JSON.parse(storedMsgs);
            if (Array.isArray(parsed)) setMessages(parsed);
         }
         // Chỉ khôi phục vị trí đã lưu trên desktop
         if (!mob) {
            const savedPos = localStorage.getItem(POS_KEY);
            if (savedPos) {
               const p = JSON.parse(savedPos);
               bx = p.x;
               by = p.y;
            }
            const savedSize = localStorage.getItem(SIZE_KEY);
            if (savedSize) {
               const s = JSON.parse(savedSize);
               pw = s.w;
               ph = s.h;
            }
         }
      } catch (_) {}
      setPanelSize({ w: pw, h: ph });
      setPanelPos(calcPanelFromBtn(bx, by, pw, ph));
      setReady(true);

      // ── Lắng nghe resize để cập nhật mobile state + clamp vị trí ──────────
      const handleResize = () => {
         const nowMobile = isMobile();
         setMobile(nowMobile);
         if (!nowMobile) {
            if (!panelManualPos.current) {
               const sz = panelSizeRef.current;
            }
         }
      };
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
   }, [calcPanelFromBtn]);

   useEffect(() => {
      if (messages.length === 0) return;
      try {
         localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(messages.slice(-MAX_STORED)),
         );
      } catch (_) {}
   }, [messages]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages, loading]);

   useEffect(() => {
      if (open) {
         setHasUnread(false);
         setTimeout(() => inputRef.current?.focus(), 150);
      }
   }, [open]);

   // Click outside chỉ đóng trên desktop
   useEffect(() => {
      if (!open || mobile) return;
      const handler = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target as Node))
            setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open, mobile]);

   // ── Khoá scroll body khi panel mở trên mobile ────────────────────────────
   useEffect(() => {
      if (!mobile) return;
      if (open) {
         document.body.style.overflow = "hidden";
      } else {
         document.body.style.overflow = "";
      }
      return () => {
         document.body.style.overflow = "";
      };
   }, [open, mobile]);

   const onBtnClick = () => {
      setOpen((v) => !v);
   };

   // ── Drag: panel header (chỉ desktop) ─────────────────────────────────────
   const onPanelHeaderMouseDown = useCallback(
      (e: React.MouseEvent) => {
         if (mobile || (e.target as HTMLElement).closest("button")) return;
         e.preventDefault();
         isDraggingPanel.current = true;
         const startMx = e.clientX;
         const startMy = e.clientY;
         const startPx = panelPosRef.current.x;
         const startPy = panelPosRef.current.y;

         const onMove = (ev: MouseEvent) => {
            if (!isDraggingPanel.current) return;
            const dx = ev.clientX - startMx;
            const dy = ev.clientY - startMy;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3)
               panelManualPos.current = true;
            const sz = panelSizeRef.current;
            const clamped = clampPos(startPx + dx, startPy + dy, sz.w, sz.h);
            setPanelPos(clamped);
         };

         const onUp = () => {
            isDraggingPanel.current = false;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
         };

         document.addEventListener("mousemove", onMove);
         document.addEventListener("mouseup", onUp);
      },
      [mobile],
   );

   // ── Resize (chỉ desktop) ──────────────────────────────────────────────────
   const onResizeMouseDown = useCallback(
      (e: React.MouseEvent) => {
         if (mobile) return;
         e.preventDefault();
         e.stopPropagation();
         isResizing.current = true;
         const startMx = e.clientX;
         const startMy = e.clientY;
         const startW = panelSizeRef.current.w;
         const startH = panelSizeRef.current.h;

         const onMove = (ev: MouseEvent) => {
            if (!isResizing.current) return;
            const newW = Math.min(
               MAX_W,
               Math.max(MIN_W, startW + (ev.clientX - startMx)),
            );
            const newH = Math.min(
               MAX_H,
               Math.max(MIN_H, startH + (ev.clientY - startMy)),
            );
            setPanelSize({ w: newW, h: newH });
         };

         const onUp = () => {
            isResizing.current = false;
            document.removeEventListener("mousemove", onMove);
            document.removeEventListener("mouseup", onUp);
            try {
               localStorage.setItem(
                  SIZE_KEY,
                  JSON.stringify(panelSizeRef.current),
               );
            } catch (_) {}
         };

         document.addEventListener("mousemove", onMove);
         document.addEventListener("mouseup", onUp);
      },
      [mobile],
   );

   // ── Send message ──────────────────────────────────────────────────────────
   const sendMessage = useCallback(
      async (text?: string) => {
         const trimmed = (text ?? input).trim();
         if (!trimmed || loading) return;

         const userMsg: Message = { role: "user", content: trimmed };
         const updatedMessages = [...messages, userMsg];

         setMessages(updatedMessages);
         setInput("");
         setNewMsgIdx(updatedMessages.length - 1);
         setLoading(true);

         try {
            const res = await apiRequest.post<ChatResponse>(
               "/chatbot",
               {
                  messages: updatedMessages
                     .filter((_, i, arr) => {
                        const firstUserIdx = arr.findIndex(
                           (m) => m.role === "user",
                        );
                        return i >= firstUserIdx;
                     })
                     .map(({ role, content }) => ({ role, content })),
               },
               { noAuth: true },
            );

            const assistantMsg: Message = {
               role: "assistant",
               content:
                  (res as any)?.data?.content ?? "Xin lỗi, có lỗi xảy ra.",
            };

            setMessages((prev) => {
               const next = [...prev, assistantMsg];
               setNewMsgIdx(next.length - 1);
               return next;
            });

            if (!open) setHasUnread(true);
         } catch (_) {
            setMessages((prev) => [
               ...prev,
               {
                  role: "assistant",
                  content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau.",
               },
            ]);
         } finally {
            setLoading(false);
         }
      },
      [input, loading, messages, open],
   );

   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
      }
   };

   const clearHistory = () => {
      setMessages([]);
      localStorage.removeItem(STORAGE_KEY);
   };

   const showQuickReplies = messages.length === 0 && !loading;

   if (!ready) return null;

   // ── Panel style: full-screen modal trên mobile, floating trên desktop ─────
   const panelStyle: React.CSSProperties = mobile
      ? {
           position: "fixed",
           inset: 0,
           width: "100%",
           height: "100%",
           // Safe area cho notch/home bar
           paddingBottom: "env(safe-area-inset-bottom)",
           borderRadius: 0,
           zIndex: 9999,
        }
      : {
           position: "fixed",
           left: panelPos.x,
           top: panelPos.y,
           width: panelSize.w,
           height: panelSize.h,
           zIndex: 51,
        };

   // ── Vị trí nút toggle: fixed bottom-right trên mobile ─────────────────────
   const btnStyle: React.CSSProperties = {
      position: "fixed",
      right: BTN_MARGIN_RIGHT,
      bottom: mobile
         ? `calc(${BTN_MARGIN_BOTTOM_MOBILE}px + env(safe-area-inset-bottom))`
         : BTN_MARGIN_BOTTOM_DESKTOP,
      width: BTN_SIZE,
      height: BTN_SIZE,
      zIndex: 10000,
   };

   return (
      <>
         <style>{`
            @keyframes chatSlideIn {
               from { opacity: 0; transform: scale(0.94); }
               to   { opacity: 1; transform: scale(1); }
            }
            @keyframes chatSlideUp {
               from { opacity: 0; transform: translateY(100%); }
               to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes chatMsgIn {
               from { opacity: 0; transform: translateY(8px); }
               to   { opacity: 1; transform: translateY(0); }
            }
            @keyframes chatPulse {
               0%, 100% { transform: scale(1); }
               50%       { transform: scale(1.2); }
            }
            @keyframes dotBounce {
               0%, 80%, 100% { transform: translateY(0); }
               40%           { transform: translateY(-5px); }
            }
            .chat-panel-enter-desktop { animation: chatSlideIn 0.22s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            .chat-panel-enter-mobile  { animation: chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            .chat-msg-enter   { animation: chatMsgIn 0.22s ease-out forwards; }
            .chat-bubble      { transition: box-shadow 0.15s ease; }
            .chat-bubble:hover{ box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
            .dot-1 { animation: dotBounce 1.2s ease-in-out infinite 0ms; }
            .dot-2 { animation: dotBounce 1.2s ease-in-out infinite 150ms; }
            .dot-3 { animation: dotBounce 1.2s ease-in-out infinite 300ms; }
            .unread-pulse { animation: chatPulse 1.8s ease-in-out infinite; }
            .prose-chat p  { margin: 0 0 0.3em; }
            .prose-chat p:last-child { margin-bottom: 0; }
            .prose-chat ul { margin: 0.3em 0; padding-left: 1.2em; list-style: disc; }
            .prose-chat li { margin: 0.15em 0; }
            .prose-chat strong { font-weight: 600; }
            .prose-chat em { font-style: italic; }
            .prose-chat code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; font-size: 11px; }
            .chat-link { color: var(--color-accent,#2563eb); text-decoration: underline; text-underline-offset: 2px; }
            .chat-link:hover { opacity: 0.75; }
            .chat-drag-header { cursor: grab; user-select: none; -webkit-user-select: none; }
            .chat-drag-header:active { cursor: grabbing; }
            .chat-drag-btn { cursor: grab; }
            .chat-drag-btn:active { cursor: grabbing; }
            /* Mobile: header không hiện grab cursor */
            @media (max-width: 768px) {
               .chat-drag-header { cursor: default; }
               .chat-drag-btn    { cursor: pointer; }
            }
            .chat-resize-handle {
               position: absolute; bottom: 0; right: 0;
               width: 20px; height: 20px;
               cursor: se-resize;
               display: flex; align-items: flex-end; justify-content: flex-end;
               padding: 4px; opacity: 0.3; transition: opacity 0.15s;
               color: currentColor;
            }
            .chat-resize-handle:hover { opacity: 0.8; }
            /* Backdrop mờ phía sau panel trên mobile */
            .chat-mobile-backdrop {
               position: fixed;
               inset: 0;
               background: rgba(0,0,0,0.4);
               z-index: 9998;
               backdrop-filter: blur(2px);
            }
         `}</style>

         <div ref={ref}>
            {/* ── Mobile backdrop ──────────────────────────────────────────── */}
            {open && mobile && (
               <div
                  className="chat-mobile-backdrop"
                  onClick={() => setOpen(false)}
               />
            )}

            {open && (
               <div
                  className={`rounded-2xl border border-neutral bg-neutral-light shadow-2xl overflow-hidden flex flex-col ${mobile ? "chat-panel-enter-mobile" : "chat-panel-enter-desktop"}`}
                  style={panelStyle}
               >
                  {/* Header */}
                  <div
                     className="chat-drag-header bg-accent px-4 flex items-center justify-between shrink-0"
                     style={{
                        paddingTop: mobile
                           ? `calc(0.75rem + env(safe-area-inset-top))`
                           : "0.75rem",
                        paddingBottom: "0.75rem",
                     }}
                     onMouseDown={onPanelHeaderMouseDown}
                  >
                     <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center pointer-events-none">
                           <Bot size={15} className="text-white" />
                        </div>
                        <div className="pointer-events-none">
                           <p className="text-white text-[13px] font-semibold leading-tight">
                              Trợ lý Chợ Công Nghệ
                           </p>
                           <p className="text-white/70 text-[11px]">
                              Trả lời tức thì · AI
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1">
                        {messages.length > 0 && (
                           <button
                              type="button"
                              onClick={clearHistory}
                              title="Xóa lịch sử"
                              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
                           >
                              <RotateCcw size={13} />
                           </button>
                        )}
                        <button
                           type="button"
                           onClick={() => setOpen(false)}
                           className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
                        >
                           <X size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto flex flex-col gap-2.5 px-3 py-3 bg-neutral-light-hover min-h-0">
                     {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-2 text-center px-4">
                           <div className="w-11 h-11 rounded-2xl bg-accent/10 flex items-center justify-center mb-1">
                              <Bot size={22} className="text-accent" />
                           </div>
                           <p className="text-[13px] text-primary font-semibold">
                              Xin chào! 👋
                           </p>
                           <p className="text-[13px] text-primary leading-relaxed">
                              Tôi có thể tư vấn sản phẩm, giá cả và tình trạng
                              hàng cho bạn.
                           </p>
                        </div>
                     )}

                     {messages.map((msg, i) => (
                        <MessageBubble
                           key={i}
                           msg={msg}
                           isNew={i === newMsgIdx}
                        />
                     ))}

                     {loading && (
                        <div className="flex items-end gap-1.5 chat-msg-enter">
                           <div className="w-6 h-6 rounded-full bg-accent/10 shrink-0 flex items-center justify-center">
                              <Bot size={12} className="text-accent" />
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

                  {/* Input */}
                  <div className="px-3 py-3 border-t border-neutral flex items-center gap-2 bg-neutral-light shrink-0">
                     <input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={loading}
                        placeholder="Nhập tin nhắn..."
                        className="flex-1 text-[14px] px-3 py-2 rounded-lg bg-neutral-light-active text-primary placeholder:text-neutral-dark/90 border border-neutral focus:outline-none focus:border-accent/50 transition-colors disabled:cursor-not-allowed"
                     />
                     <button
                        type="button"
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center cursor-pointer shrink-0 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-accent-hover active:scale-95"
                     >
                        <Send
                           size={13}
                           className="text-white"
                           strokeWidth={2}
                        />
                     </button>
                  </div>

                  {/* Resize handle — chỉ desktop */}
                  {!mobile && (
                     <div
                        className="chat-resize-handle"
                        onMouseDown={onResizeMouseDown}
                        title="Kéo để thay đổi kích thước"
                     >
                        <svg
                           width="12"
                           height="12"
                           viewBox="0 0 12 12"
                           fill="currentColor"
                        >
                           <path
                              d="M11 1L1 11M11 6L6 11M11 11L11 11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                           />
                           <path
                              d="M11 6L6 11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                           />
                           <path
                              d="M11 1L1 11"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                           />
                        </svg>
                     </div>
                  )}
               </div>
            )}

            {/* ── TOGGLE BUTTON ─────────────────────────────────────────────── */}
            <button
               type="button"
               onClick={onBtnClick}
               aria-label="Chat support"
               className={`${mobile ? "" : "chat-drag-btn"} relative rounded-2xl bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg transition-colors duration-150 select-none bottom-20`}
               style={btnStyle}
            >
               <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-neutral-light pointer-events-none ${hasUnread ? "unread-pulse" : ""}`}
               />
               {open ? (
                  <X
                     size={20}
                     strokeWidth={2}
                     className="pointer-events-none"
                  />
               ) : (
                  <MessageCircle
                     size={20}
                     strokeWidth={2}
                     className="pointer-events-none"
                  />
               )}
            </button>
         </div>
      </>
   );
}
