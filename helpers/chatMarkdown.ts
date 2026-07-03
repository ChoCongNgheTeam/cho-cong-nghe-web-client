import type { ProductCard } from "@/types/chat";

// PRODUCT CARD PARSER (Markdown Fallback) — dùng khi backend trả về markdown thô
// thay vì mảng `products` có cấu trúc.
export function parseProductCards(text: string): ProductCard[] | null {
  const blocks = text.split(/\n(?=\d+\.\s)/);
  if (blocks.length < 2) return null;

  const cards: ProductCard[] = [];

  for (const block of blocks) {
    const card: ProductCard = { highlights: [] };

    const imgMatch = block.match(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/);
    if (imgMatch) {
      card.imageAlt = imgMatch[1];
      card.image = imgMatch[2];
    }

    const nameMatch = block.match(/\*\*(?:Tên|Name):\*\*\s*(.+)/);
    if (nameMatch) {
      card.name = nameMatch[1].trim();
    } else {
      const boldMatch = block.match(/\*\*([^*]+)\*\*/);
      if (boldMatch && !boldMatch[1].startsWith("Giá") && !boldMatch[1].startsWith("Khuyến")) {
        card.name = boldMatch[1].trim();
      }
    }

    const priceMatch = block.match(/\*\*(?:Giá|Price):\*\*\s*(.+)/);
    if (priceMatch) card.price = priceMatch[1].trim();

    const promoMatch = block.match(/\*\*(?:Khuyến mãi|Promo):\*\*\s*(.+)/);
    if (promoMatch) card.promo = promoMatch[1].trim();

    const linkMatch = block.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g);
    if (linkMatch) {
      const last = linkMatch[linkMatch.length - 1];
      const parsed = last.match(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/);
      if (parsed) {
        card.linkLabel = parsed[1];
        card.link = parsed[2];
      }
    }

    const highlightMatches = block.matchAll(/^\s*-\s+(.+)$/gm);
    for (const m of highlightMatches) {
      card.highlights.push(m[1].trim());
    }

    if (card.name || card.image) {
      cards.push(card);
    }
  }

  return cards.length >= 2 ? cards : null;
}

export function cleanContent(text: string): string {
  return text
    .replace(/\\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

export function applyInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" class="chat-img" loading="lazy" onerror="this.style.display=\'none\'" />')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
}

export function renderMarkdown(text: string): string {
  const cleaned = cleanContent(text);
  const lines = cleaned.split("\n");
  const result: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const bulletMatch = line.match(/^[ \t]*[-*] (.+)$/);
    const numberedMatch = line.match(/^[ \t]*\d+\. (.+)$/);

    if (bulletMatch || numberedMatch) {
      const content = (bulletMatch?.[1] ?? numberedMatch?.[1]) as string;
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${applyInline(content)}</li>`);
    } else {
      if (inList) {
        result.push("</ul>");
        inList = false;
      }
      if (line.trim() === "") {
        result.push("");
      } else {
        result.push(applyInline(line));
      }
    }
  }
  if (inList) result.push("</ul>");

  return result
    .join("\n")
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}
