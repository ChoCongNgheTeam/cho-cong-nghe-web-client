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
const MAX_STORED = 20;

const QUICK_REPLIES = [
   "Có iPhone 15 không?",
   "Laptop dưới 15 triệu?",
   "Tai nghe không dây tốt?",
   "Chuột gaming giá rẻ?",
];

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

export default function ChatButton() {
   const [open, setOpen] = useState(false);
   const [messages, setMessages] = useState<Message[]>([]);
   const [input, setInput] = useState("");
   const [loading, setLoading] = useState(false);
   const [newMsgIdx, setNewMsgIdx] = useState<number | null>(null);
   const [hasUnread, setHasUnread] = useState(false);

   const ref = useRef<HTMLDivElement>(null);
   const messagesEndRef = useRef<HTMLDivElement>(null);
   const inputRef = useRef<HTMLInputElement>(null);

   useEffect(() => {
      try {
         const stored = localStorage.getItem(STORAGE_KEY);
         if (stored) {
            const parsed: Message[] = JSON.parse(stored);
            if (Array.isArray(parsed)) setMessages(parsed);
         }
      } catch (_) {}
   }, []);

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
      if (!open) return;
      const handler = (e: MouseEvent) => {
         if (ref.current && !ref.current.contains(e.target as Node))
            setOpen(false);
      };
      document.addEventListener("mousedown", handler);
      return () => document.removeEventListener("mousedown", handler);
   }, [open]);

   useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
   }, [messages, loading]);

   useEffect(() => {
      if (open) {
         setHasUnread(false);
         setTimeout(() => inputRef.current?.focus(), 150);
      }
   }, [open]);

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

   return (
      <>
         <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
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
        .chat-panel-enter { animation: chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .chat-msg-enter   { animation: chatMsgIn 0.22s ease-out forwards; }
        .chat-bubble { transition: box-shadow 0.15s ease; }
        .chat-bubble:hover { box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
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
        .chat-link { color: var(--color-accent, #2563eb); text-decoration: underline; text-underline-offset: 2px; }
        .chat-link:hover { opacity: 0.75; }

        /* Mobile: panel không bị che, hiện full trong viewport */
        @media (max-width: 1023px) {
          .chat-panel-mobile {
            position: fixed !important;
            bottom: 5rem !important; /* đủ cao hơn toggle button */
            right: 1rem !important;
            left: 1rem !important;
            width: auto !important;
            max-height: calc(100dvh - 8rem) !important;
          }
          .chat-panel-mobile .chat-messages-area {
            flex: 1 1 0% !important;
            height: auto !important;
            min-height: 0 !important;
          }
        }
      `}</style>

         <div
            ref={ref}
            className="flex fixed bottom-20 lg:bottom-20 right-4 sm:right-6 z-50 flex-col items-end gap-3"
         >
            {/* Chat panel */}
            {open && (
               <div className="chat-panel-enter chat-panel-mobile rounded-2xl border border-neutral bg-neutral-light shadow-2xl overflow-hidden w-80 flex flex-col">
                  {/* Header */}
                  <div className="bg-accent px-4 py-3 flex items-center justify-between shrink-0">
                     <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                           <Bot size={15} className="text-white" />
                        </div>
                        <div>
                           <p className="text-white text-[13px] font-semibold leading-tight">
                              Trợ lý Chợ Công Nghệ
                           </p>
                           <p className="text-white/70 text-[11px]">
                              Trả lời tức thì · AI
                           </p>
                        </div>
                     </div>
                     <div className="flex items-center gap-1.5">
                        {messages.length > 0 && (
                           <button
                              onClick={clearHistory}
                              title="Xóa lịch sử"
                              className="text-white/60 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
                           >
                              <RotateCcw size={13} />
                           </button>
                        )}
                        <button
                           onClick={() => setOpen(false)}
                           className="text-white/70 hover:text-white transition-colors cursor-pointer p-1.5 rounded-md hover:bg-white/10"
                        >
                           <X size={16} />
                        </button>
                     </div>
                  </div>

                  {/* Messages */}
                  <div className="chat-messages-area h-72 overflow-y-auto flex flex-col gap-2.5 px-3 py-3 bg-neutral-light-hover">
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
               </div>
            )}

            {/* Toggle button */}
            <button
               onClick={() => setOpen((v) => !v)}
               aria-label="Chat support"
               className="relative w-12 h-12 rounded-2xl bg-accent hover:bg-accent-hover active:bg-accent-active text-white flex items-center justify-center shadow-lg transition-all duration-200 cursor-pointer active:scale-95"
            >
               <span
                  className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-400 border-2 border-neutral-light ${hasUnread ? "unread-pulse" : ""}`}
               />
               {open ? (
                  <X size={20} strokeWidth={2} />
               ) : (
                  <MessageCircle size={20} strokeWidth={2} />
               )}
            </button>
         </div>
      </>
   );
}
