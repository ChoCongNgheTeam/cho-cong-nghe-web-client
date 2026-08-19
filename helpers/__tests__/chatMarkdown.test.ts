import { describe, it, expect } from "vitest";
import { cleanContent, applyInline, renderMarkdown, parseProductCards } from "../chatMarkdown";

describe("cleanContent", () => {
  it("unescapes literal \\n into real newlines", () => {
    expect(cleanContent("dòng 1\\ndòng 2")).toBe("dòng 1\ndòng 2");
  });

  it("collapses 3+ consecutive newlines into 2", () => {
    expect(cleanContent("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("trims trailing whitespace on each line and the whole string", () => {
    expect(cleanContent("  a   \n  b  \n  ")).toBe("a\n  b");
  });
});

describe("applyInline", () => {
  it("converts markdown bold/italic/code/link to HTML", () => {
    expect(applyInline("**bold**")).toBe("<strong>bold</strong>");
    expect(applyInline("*italic*")).toBe("<em>italic</em>");
    expect(applyInline("`code`")).toBe("<code>code</code>");
    expect(applyInline("[label](https://example.com)")).toBe(
      '<a href="https://example.com" target="_blank" rel="noopener noreferrer" class="chat-link">label</a>',
    );
  });

  it("converts markdown image syntax to an <img> tag", () => {
    const html = applyInline("![alt](https://example.com/a.png)");
    expect(html).toContain('src="https://example.com/a.png"');
    expect(html).toContain('alt="alt"');
  });

  /**
   * SECURITY: applyInline()/renderMarkdown() tự thân KHÔNG sanitize — chúng chỉ build
   * HTML bằng regex. Việc chặn XSS được thực hiện ở nơi gọi (MessageBubble.tsx) bằng
   * DOMPurify.sanitize(renderMarkdown(...)) trước khi đưa vào dangerouslySetInnerHTML.
   * Test dưới đây ghi nhận đúng hành vi "không sanitize ở tầng markdown" để đảm bảo
   * lớp phòng thủ luôn nằm ở call-site, và không ai vô tình xoá bước DOMPurify ở đó.
   */
  it("does not sanitize by itself — callers MUST run DOMPurify.sanitize() before dangerouslySetInnerHTML", () => {
    const malicious = 'trước <img src=x onerror="alert(1)"> sau';
    const html = applyInline(malicious);
    expect(html).toContain("onerror");
  });
});

describe("renderMarkdown", () => {
  it("wraps consecutive bullet lines in a <ul><li> list", () => {
    const html = renderMarkdown("- a\n- b\n- c");
    expect(html).toContain("<ul>");
    expect(html).toContain("<li>a</li>");
    expect(html).toContain("<li>b</li>");
    expect(html).toContain("<li>c</li>");
  });

  it("supports numbered lists using the same <ul><li> rendering", () => {
    const html = renderMarkdown("1. first\n2. second");
    expect(html).toContain("<li>first</li>");
    expect(html).toContain("<li>second</li>");
  });
});

describe("parseProductCards", () => {
  it("returns null when there are fewer than 2 numbered blocks", () => {
    expect(parseProductCards("Chỉ có một đoạn text bình thường.")).toBeNull();
  });

  it("parses name/price/promo/link out of numbered markdown blocks", () => {
    const text = [
      "1. **Tên:** iPhone 15\n**Giá:** 20.000.000đ\n**Khuyến mãi:** Giảm 10%\n[Xem chi tiết](https://example.com/1)",
      "2. **Tên:** iPhone 16\n**Giá:** 25.000.000đ\n[Xem chi tiết](https://example.com/2)",
    ].join("\n");

    const cards = parseProductCards(text);
    expect(cards).not.toBeNull();
    expect(cards).toHaveLength(2);
    expect(cards?.[0]).toMatchObject({
      name: "iPhone 15",
      price: "20.000.000đ",
      promo: "Giảm 10%",
      link: "https://example.com/1",
      linkLabel: "Xem chi tiết",
    });
  });
});
