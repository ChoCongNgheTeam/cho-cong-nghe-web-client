import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MessageBubble } from "../MessageBubble";
import type { Message } from "@/types/chat";

// next/image không cần mock riêng trong jsdom cho <Image>, nhưng cấu hình images
// bên next.config.ts (unoptimized: true) khiến nó render như <img> thường nên
// không cần next/image mock đặc thù ở đây.

describe("MessageBubble — XSS hardening (regression cho bản vá DOMPurify)", () => {
  it("strips <img onerror> injected via an assistant message before rendering", () => {
    const msg: Message = {
      role: "assistant",
      content: 'Xin chào <img src=x onerror="window.__pwned = true">, đây là câu trả lời.',
    };

    render(<MessageBubble msg={msg} />);

    // Không có onerror nào lọt ra DOM
    expect(document.querySelector("[onerror]")).toBeNull();
    // Nội dung text hợp lệ vẫn hiển thị bình thường
    expect(screen.getByText(/Xin chào/)).toBeInTheDocument();
  });

  it("strips <script> tags injected via an assistant message", () => {
    const msg: Message = {
      role: "assistant",
      content: "Xem thêm <script>window.__pwned = true</script> tại đây.",
    };

    render(<MessageBubble msg={msg} />);

    expect(document.querySelector("script")).toBeNull();
  });

  it("renders user messages as plain text (React auto-escapes, no dangerouslySetInnerHTML path)", () => {
    const msg: Message = {
      role: "user",
      content: '<img src=x onerror="window.__pwned = true">',
    };

    render(<MessageBubble msg={msg} />);

    expect(document.querySelector("[onerror]")).toBeNull();
    // Được hiển thị dưới dạng text thô, không parse thành thẻ HTML
    expect(screen.getByText('<img src=x onerror="window.__pwned = true">')).toBeInTheDocument();
  });

  it("still allows safe markdown (bold, links) to render as real HTML after sanitization", () => {
    const msg: Message = {
      role: "assistant",
      content: "Sản phẩm **nổi bật** — [xem tại đây](https://example.com/p/1)",
    };

    render(<MessageBubble msg={msg} />);

    expect(screen.getByText("nổi bật").tagName).toBe("STRONG");
    const link = screen.getByRole("link", { name: "xem tại đây" });
    expect(link).toHaveAttribute("href", "https://example.com/p/1");
  });
});
