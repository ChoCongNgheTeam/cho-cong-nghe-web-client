"use client";
import { memo, useMemo } from "react";
import { User } from "lucide-react";
import Image from "next/image";
import { cleanContent, renderMarkdown, parseProductCards } from "@/helpers/chatMarkdown";
import { StructuredProductCard, ProductCardGrid } from "./ProductCards";
import type { Message, ProductCard } from "@/types/chat";

interface ParsedBubbleContent {
  html: string;
  introHtml: string;
  productCards: ProductCard[] | null;
}

// Regex/markdown parsing khá nặng nên cache lại theo nội dung tin nhắn — tránh chạy lại
// mỗi khi ChatButton re-render (vd. gõ ô input) nhưng nội dung tin nhắn cũ không đổi.
function useParsedBubbleContent(msg: Message): ParsedBubbleContent {
  return useMemo(() => {
    const isUser = msg.role === "user";
    const hasStructuredProducts = Array.isArray(msg.products) && msg.products.length > 0;

    let introText = "";
    let productCards: ProductCard[] | null = null;

    if (!isUser) {
      const cleanedContent = cleanContent(msg.content);
      if (hasStructuredProducts) {
        if (cleanedContent.match(/^\d+\.\s/m)) {
          introText = cleanedContent.split("\n\n")[0] || cleanedContent.substring(0, 100);
        } else {
          introText = cleanedContent;
        }
        introText = introText.replace(/^\d+\.\s.+/gm, "").trim();
      } else {
        productCards = parseProductCards(cleanedContent);
        if (productCards) {
          const introMatch = cleanedContent.match(/^([^1-9\n][^\n]*\n?)/);
          if (introMatch) introText = introMatch[1].trim();
        }
      }
    }

    const html = isUser ? msg.content : renderMarkdown(msg.content);
    const introHtml = introText ? renderMarkdown(introText) : "";

    return { html, introHtml, productCards };
  }, [msg.role, msg.content, msg.products]);
}

function MessageBubbleImpl({ msg, isNew }: { msg: Message; isNew?: boolean }) {
  const isUser = msg.role === "user";
  const hasStructuredProducts = Array.isArray(msg.products) && msg.products.length > 0;
  const { html, introHtml, productCards } = useParsedBubbleContent(msg);

  return (
    <div className={`flex items-end gap-1.5 ${isUser ? "flex-row-reverse" : "flex-row"} ${isNew ? "chat-msg-enter" : ""}`}>
      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${isUser ? "bg-accent/20" : "bg-accent/10"} mb-1`}>
        {isUser ? <User size={12} className="text-accent" /> : <Image src="/images/Robot-mascot-v2.png" alt="Mascot" width={16} height={16} className="object-contain rounded-full" />}
      </div>

      {isUser ? (
        <div className="max-w-[82%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-accent text-white rounded-br-sm whitespace-pre-wrap">{msg.content}</div>
      ) : hasStructuredProducts ? (
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5">
          {introHtml && (
            <div
              className="w-fit max-w-[100%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-white text-neutral-dark border border-neutral rounded-bl-sm shadow-sm prose-chat"
              dangerouslySetInnerHTML={{ __html: `<p>${introHtml}</p>` }}
            />
          )}
          <div className="flex flex-col gap-2.5 w-full mt-1">
            {msg.products!.map((p, i) => (
              <StructuredProductCard key={i} product={p} />
            ))}
          </div>
        </div>
      ) : productCards ? (
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5">
          {introHtml && (
            <div
              className="w-fit max-w-[100%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-white text-neutral-dark border border-neutral rounded-bl-sm shadow-sm prose-chat"
              dangerouslySetInnerHTML={{ __html: `<p>${introHtml}</p>` }}
            />
          )}
          <ProductCardGrid cards={productCards} />
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

// Memo hoá — đây là fix chính cho vấn đề "re-render liên tục": trước đây mỗi tin nhắn
// re-parse markdown mỗi khi ChatButton render lại (vd. gõ input), giờ chỉ re-render khi
// msg hoặc isNew thực sự đổi.
export const MessageBubble = memo(MessageBubbleImpl);
