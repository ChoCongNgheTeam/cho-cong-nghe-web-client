"use client";
import { useCallback, useEffect, useState } from "react";
import { sendChatMessage } from "@/lib/api/chatbot";
import { logError } from "@/lib/monitoring/log-error";
import type { Message } from "@/types/chat";

const STORAGE_KEY = "cho-cong-nghe:chat-history";
const MAX_STORED = 20;

interface UseChatMessagesOptions {
  // Gọi khi có tin nhắn assistant mới trả về (ChatButton dùng để bật hasUnread)
  onAssistantReply?: () => void;
}

export function useChatMessages({ onAssistantReply }: UseChatMessagesOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState<number | null>(null);
  const [ready, setReady] = useState(false);

  // Hydrate lịch sử chat từ localStorage (client-only, tránh SSR mismatch)
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: Message[] = JSON.parse(stored);
          if (Array.isArray(parsed)) setMessages(parsed);
        }
      } catch (error) {
        logError("useChatMessages: parse history from localStorage failed", error);
      }
      setReady(true);
    }, 0);
    return () => clearTimeout(t);
  }, []);

  // Đồng bộ lịch sử chat xuống localStorage mỗi khi messages đổi
  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch (error) {
      logError("useChatMessages: save history to localStorage failed", error);
    }
  }, [messages]);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setNewMsgIdx(updatedMessages.length - 1);
      setLoading(true);

      try {
        const payload = updatedMessages.filter((_, i, arr) => i >= arr.findIndex((m) => m.role === "user")).map(({ role, content }) => ({ role, content }));

        const res = await sendChatMessage(payload);
        const assistantMsg: Message = {
          role: "assistant",
          content: res.data?.reply ?? "Xin lỗi, có lỗi xảy ra.",
          products: res.data?.products,
        };

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          setNewMsgIdx(next.length - 1);
          return next;
        });

        onAssistantReply?.();
      } catch (error) {
        logError("useChatMessages: sendChatMessage failed", error, { messageCount: updatedMessages.length });
        setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau." }]);
      } finally {
        setLoading(false);
      }
    },
    [messages, loading, onAssistantReply],
  );

  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      logError("useChatMessages: clear history failed", error);
    }
  }, []);

  return { messages, loading, newMsgIdx, ready, sendMessage, clearHistory };
}
