"use client";
import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Send, CornerDownLeft } from "lucide-react";

export interface ChatInputHandle {
  focus: () => void;
}

interface ChatInputProps {
  loading: boolean;
  mobile: boolean;
  onSend: (text: string) => void;
}

// State `input` sống ở đây, KHÔNG ở ChatButton — để mỗi lần gõ chữ chỉ re-render
// component nhỏ này, không kéo theo re-render toàn bộ danh sách MessageBubble phía trên.
export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(function ChatInput({ loading, mobile, onSend }, ref) {
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const submit = (text?: string) => {
    const trimmed = (text ?? input).trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (mobile) return;
      if (!e.shiftKey) {
        e.preventDefault();
        submit();
      }
    }
  };

  const handleMobileNewline = () => {
    const el = inputRef.current;
    if (!el) return;
    const start = el.selectionStart ?? el.value.length;
    const end = el.selectionEnd ?? el.value.length;
    const newVal = el.value.slice(0, start) + "\n" + el.value.slice(end);
    setInput(newVal);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + 1, start + 1);
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  return (
    <div className="px-3 py-3 border-t border-neutral flex items-end gap-2 bg-neutral-light shrink-0">
      <textarea
        ref={inputRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={loading}
        placeholder={mobile ? "Nhập tin nhắn..." : "Nhập tin nhắn... (Shift+Enter để xuống hàng)"}
        rows={1}
        enterKeyHint={mobile ? "send" : "enter"}
        inputMode="text"
        autoComplete="off"
        autoCorrect="on"
        spellCheck={false}
        className="flex-1 px-3 py-2 rounded-lg bg-neutral-light-active text-primary placeholder:text-neutral-dark/90 border border-neutral focus:outline-none focus:border-accent/50 transition-colors disabled:cursor-not-allowed resize-none overflow-y-auto leading-relaxed chat-textarea-ios"
        style={{ minHeight: "36px", maxHeight: "120px" }}
      />

      {mobile && (
        <button type="button" onClick={handleMobileNewline} disabled={loading} title="Xuống hàng" className="chat-newline-btn disabled:opacity-40 disabled:cursor-not-allowed" aria-label="Xuống hàng">
          <CornerDownLeft size={14} strokeWidth={2} />
        </button>
      )}

      <button
        type="button"
        onClick={() => submit()}
        disabled={loading || !input.trim()}
        className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center cursor-pointer shrink-0 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-accent-hover active:scale-95"
      >
        <Send size={13} className="text-white" strokeWidth={2} />
      </button>
    </div>
  );
});
