import apiRequest from "@/lib/api";
import type { ChatResponse, Message } from "@/types/chat";

type ChatPayloadMessage = Pick<Message, "role" | "content">;

/**
 * Gửi lịch sử hội thoại lên endpoint /chatbot, trả về câu trả lời + sản phẩm liên quan (nếu có).
 * Không try/catch ở đây — lỗi để bay lên nơi gọi (hook/component) tự xử lý.
 */
export async function sendChatMessage(messages: ChatPayloadMessage[]): Promise<ChatResponse> {
  return apiRequest.post<ChatResponse>("/chatbot", { messages }, { noAuth: true });
}
