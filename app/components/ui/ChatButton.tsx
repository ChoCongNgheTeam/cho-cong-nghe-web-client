"use client";
import apiRequest from "@/lib/api";
import { X, Send, User, RotateCcw, Maximize2, Minimize2, CornerDownLeft, ShoppingCart, ExternalLink, Tag } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
// Đã thêm Import useCart và useToasty từ hệ thống của bạn
import { useCart } from "@/hooks/useCart";
import { useToasty } from "@/components/Toast";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES & CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: Product[]; 
}

interface ChatResponse {
  success: boolean;
  data: { 
    reply: string;
    products?: Product[];
  };
}

const STORAGE_KEY = "cho-cong-nghe:chat-history";
const MAX_STORED = 20;

const QUICK_REPLIES = ["Có iPhone 15 không?", "Laptop dưới 15 triệu?", "Tai nghe không dây tốt?", "Chuột gaming giá rẻ?"];

// Panel sizes
const NORMAL_W = 380;
const NORMAL_H = 540;
const MAX_W = 580;
const MAX_H = 700;

// Button
const BTN_SIZE = 56;
const BTN_RIGHT = 22;
const BTN_BOTTOM_MOBILE = 130;
const BTN_BOTTOM_DESKTOP = 80;

// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CARD PARSER (Markdown Fallback)
// ─────────────────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  slug?: string;
  thumbnail: string;
  priceMin: number;
  priceMax: number;
  originalPriceMin?: number;
  promotionLabel?: string;
  inStock: boolean;
  defaultVariantId?: string;
  productUrl?: string;
  variants?: Variant[];
}

interface Variant {
  id: string;
  name?: string;
  label: string;
}

interface ProductCard {
  image?: string;
  imageAlt?: string;
  name?: string;
  price?: string;
  highlights: string[];
  promo?: string;
  link?: string;
  linkLabel?: string;
}

function parseProductCards(text: string): ProductCard[] | null {
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

function cleanContent(text: string): string {
  return (
    text
      .replace(/\\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/[ \t]+$/gm, "")
      .trim()
  );
}

function renderMarkdown(text: string): string {
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

function applyInline(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/g, '<img src="$2" alt="$1" class="chat-img" loading="lazy" onerror="this.style.display=\'none\'" />')
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>');
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTS: UI THẺ SẢN PHẨM TỪ CẤU TRÚC JSON & MARKDOWN
// ─────────────────────────────────────────────────────────────────────────────

function StructuredProductCard({ product }: { product: Product }) {
  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(price);
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0]?.id || product.defaultVariantId || "");

  // Lấy các hàm context của dự án
  const { addToCart } = useCart();
  const { toast } = useToasty();

  const priceDisplay = product.priceMin === product.priceMax
    ? formatPrice(product.priceMin)
    : `${formatPrice(product.priceMin)} - ${formatPrice(product.priceMax)}`;

  const originalPriceDisplay = product.originalPriceMin ? formatPrice(product.originalPriceMin) : "";
  const hasDiscount = !!(product.originalPriceMin && product.originalPriceMin > product.priceMin);
  const discountPercent = hasDiscount && product.originalPriceMin ? Math.round(((product.originalPriceMin - product.priceMin) / product.originalPriceMin) * 100) : 0;

  // XỬ LÝ THÊM VÀO GIỎ HÀNG CHUẨN KIẾN TRÚC DỰ ÁN
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    try {
      await addToCart(selectedVariant, 1, {
        productId: product.id,
        productName: product.name,
        productSlug: product.slug || "", 
        price: product.priceMin,
        originalPrice: product.originalPriceMin || product.priceMin,
        imageUrl: product.thumbnail,
      });
      // Gọi giao diện Toast thành công
      toast({
        type: "success",
        title: "Thành công",
        description: `Đã thêm "${product.name}" vào giỏ hàng`,
      });
    } catch (error: Error | unknown) {
      const errorMsg = error instanceof Error ? error.message : "Không thể thêm vào giỏ hàng";
      
      // FIX TOAST: Thêm type: "error"
      toast({
        type: "error",
        title: "Lỗi",
        description: errorMsg,
      });
    }
  };

  return (
    <div className="bg-white border border-neutral rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
      <div className="flex gap-2.5 p-2.5">
        <div className="w-[76px] shrink-0 bg-neutral-50 rounded-lg flex items-center justify-center p-1.5 relative border border-black/5">
          {hasDiscount && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg rounded-tl-lg z-10 shadow-sm">
              -{discountPercent}%
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={product.thumbnail} alt={product.name} className="w-full h-[64px] object-contain mix-blend-multiply" loading="lazy" />
          {!product.inStock && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] flex items-center justify-center rounded-lg">
              <span className="bg-black/70 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Hết hàng</span>
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            <p className="text-[12px] font-semibold text-neutral-800 leading-snug line-clamp-2 mb-1">{product.name}</p>
            <div className="flex items-baseline gap-1.5 mb-0.5">
              <p className="text-[13.5px] font-bold text-accent">{priceDisplay}</p>
              {hasDiscount && <p className="text-[10.5px] text-neutral-400 line-through">{originalPriceDisplay}</p>}
            </div>
            {product.promotionLabel && (
              <p className="text-[10.5px] text-emerald-600 font-medium line-clamp-1 flex items-center gap-1">
                <Tag size={11} /> {product.promotionLabel}
              </p>
            )}
          </div>

          {product.variants && product.variants.length > 0 ? (
            <div className="flex flex-col gap-1.5 mt-2">
              <select
                value={selectedVariant}
                onChange={(e) => setSelectedVariant(e.target.value)}
                className="w-full text-[11.5px] font-medium px-2.5 py-1.5 rounded-lg border border-neutral bg-neutral-50 text-gray-900 focus:outline-none focus:border-accent appearance-none cursor-pointer shadow-sm"
                style={{ backgroundImage: `url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%236b7280%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px top 50%', backgroundSize: '8px auto' }}
              >
                {product.variants.map((v: Variant) => (
                  <option key={v.id} value={v.id}>{v.label}</option>
                ))}
              </select>
              <div className="flex items-center gap-1.5">
               <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-1.5 text-[11.5px] px-2 py-1.5 rounded-lg bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors active:scale-95 shadow-sm">
                <ShoppingCart size={13} strokeWidth={2.5} />
              </button>
                {product.productUrl && (
                  <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors shrink-0 shadow-sm">
                    <ExternalLink size={15} />
                  </a>
                )}
              </div>
            </div>
          ) : product.defaultVariantId ? (
            <div className="flex items-center gap-1.5 mt-2">
              <button onClick={handleAddToCart} className="flex-1 flex items-center justify-center gap-1 text-[11.5px] px-2 py-1.5 rounded-lg bg-sky-50 border border-sky-200 text-sky-700 font-semibold hover:bg-sky-100 transition-colors active:scale-95 shadow-sm">
                <ShoppingCart size={13} /> Mua ngay
              </button>
              {product.productUrl && (
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="w-[30px] h-[30px] flex items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors shrink-0 shadow-sm">
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2">
              {product.productUrl && (
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 text-[11.5px] px-2 py-1.5 rounded-lg bg-accent/10 border border-accent/20 text-accent font-semibold hover:bg-accent/20 transition-colors shadow-sm">
                  Xem tuỳ chọn
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ProductCardGrid({ cards }: { cards: ProductCard[] }) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {cards.map((card, i) => (
        <div key={i} className="bg-white border border-neutral rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="flex gap-0">
            {card.image && (
              <div className="w-[68px] shrink-0 bg-neutral-50 flex items-center justify-center p-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={card.image}
                  alt={card.imageAlt ?? card.name ?? "Product"}
                  className="w-full h-[60px] object-contain"
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
            <div className="flex-1 p-2 min-w-0">
              {card.name && <p className="text-[11.5px] font-semibold text-neutral-800 leading-tight line-clamp-2 mb-1">{card.name}</p>}
              {card.price && <p className="text-[12px] font-bold text-accent mb-1">{card.price}</p>}

              {card.highlights.length > 0 && (
                <ul className="flex flex-col gap-0.5 mb-1">
                  {card.highlights.slice(0, 3).map((h, j) => (
                    <li key={j} className="text-[10.5px] text-neutral-600 flex items-start gap-1">
                      <span className="mt-0.5 shrink-0 text-accent">•</span>
                      <span className="line-clamp-1">{h}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between gap-2 mt-1.5">
                {card.promo ? <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-medium shrink-0">{card.promo}</span> : <span></span>}
                {card.link && (
                  <a
                    href={card.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-[10.5px] px-2.5 py-1 rounded-lg bg-accent text-white font-medium hover:bg-accent-hover transition-colors whitespace-nowrap shrink-0"
                  >
                    {card.linkLabel ?? "Xem chi tiết"}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MESSAGE BUBBLE
// ─────────────────────────────────────────────────────────────────────────────

function MessageBubble({ msg, isNew }: { msg: Message; isNew?: boolean }) {
  const isUser = msg.role === "user";
  const hasStructuredProducts = Array.isArray(msg.products) && msg.products.length > 0;

  let introText = "";
  let productCards: ProductCard[] | null = null;

  if (!isUser) {
    const cleanedContent = cleanContent(msg.content);
    if (hasStructuredProducts) {
      if (cleanedContent.match(/^\d+\.\s/m)) {
        introText = cleanedContent.split('\n\n')[0] || cleanedContent.substring(0, 100);
      } else {
        introText = cleanedContent;
      }
      introText = introText.replace(/^\d+\.\s.+/gm, '').trim();
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

  return (
    <div className={`flex items-end gap-1.5 ${isUser ? "flex-row-reverse" : "flex-row"} ${isNew ? "chat-msg-enter" : ""}`}>
      <div className={`w-6 h-6 rounded-full shrink-0 flex items-center justify-center ${isUser ? "bg-accent/20" : "bg-accent/10"} mb-1`}>
        {isUser ? (
          <User size={12} className="text-accent" />
        ) : (
          <Image src="/images/Robot-mascot-v2.png" alt="Mascot" width={16} height={16} className="object-contain rounded-full" />
        )}
      </div>

      {isUser ? (
        <div className="max-w-[82%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-accent text-white rounded-br-sm whitespace-pre-wrap">{msg.content}</div>
      ) : hasStructuredProducts ? (
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5">
          {introText && (
            <div
              className="w-fit max-w-[100%] px-3 py-2 rounded-2xl text-[12.5px] leading-relaxed chat-bubble bg-white text-neutral-dark border border-neutral rounded-bl-sm shadow-sm prose-chat"
              dangerouslySetInnerHTML={{ __html: `<p>${introHtml}</p>` }}
            />
          )}
          <div className="flex flex-col gap-2.5 w-full mt-1">
            {msg.products!.map((p, i) => <StructuredProductCard key={i} product={p} />)}
          </div>
        </div>
      ) : productCards ? (
        <div className="flex-1 min-w-[240px] flex flex-col gap-1.5">
          {introText && (
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

type PanelState = "closed" | "normal" | "maximized";

export default function ChatButton() {
  const [panelState, setPanelState] = useState<PanelState>("closed");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [newMsgIdx, setNewMsgIdx] = useState<number | null>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [ready, setReady] = useState(false);
  const [mobile, setMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isOpen = panelState !== "closed";
  const isMaximized = panelState === "maximized";
  const size = isOpen ? BTN_SIZE - 12 : BTN_SIZE;

  const [sheetOpen, setSheetOpen] = useState(false);

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
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Message[] = JSON.parse(stored);
        if (Array.isArray(parsed)) setMessages(parsed);
      }
    } catch {
      // Ignore parsing errors
    }
    setReady(true);

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

  useEffect(() => {
    const t = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(t);
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
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

  const sendMessage = useCallback(
    async (text?: string) => {
      const trimmed = (text ?? input).trim();
      if (!trimmed || loading) return;

      const userMsg: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMsg];

      setMessages(updatedMessages);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      setNewMsgIdx(updatedMessages.length - 1);
      setLoading(true);

      try {
        const res = await apiRequest.post<ChatResponse>(
          "/chatbot",
          {
            messages: updatedMessages.filter((_, i, arr) => i >= arr.findIndex((m) => m.role === "user")).map(({ role, content }) => ({ role, content })),
          },
          { noAuth: true },
        );

        const data = (res as ChatResponse)?.data;
        const assistantMsg: Message = {
          role: "assistant",
          content: data?.reply ?? "Xin lỗi, có lỗi xảy ra.",
          products: data?.products,
        };

        setMessages((prev) => {
          const next = [...prev, assistantMsg];
          setNewMsgIdx(next.length - 1);
          return next;
        });

        if (!isOpen) setHasUnread(true);
      } catch {
        setMessages((prev) => [...prev, { role: "assistant", content: "Xin lỗi, không thể kết nối. Vui lòng thử lại sau." }]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, isOpen],
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter") {
      if (mobile) return;
      if (!e.shiftKey) {
        e.preventDefault();
        sendMessage();
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

  const clearHistory = () => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

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
        right: BTN_RIGHT,
        width: isMaximized ? MAX_W : NORMAL_W,
        height: isMaximized ? Math.min(MAX_H, window.innerHeight - 32) : NORMAL_H,
        zIndex: 51,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1), height 0.25s cubic-bezier(0.4,0,0.2,1)",
      };

  const btnStyle: React.CSSProperties = {
    position: "fixed",
    right: BTN_RIGHT,
    bottom: mobile ? `calc(${BTN_BOTTOM_MOBILE}px + env(safe-area-inset-bottom))` : BTN_BOTTOM_DESKTOP,
    width: BTN_SIZE,
    height: BTN_SIZE,
    zIndex: 10000,
  };

  return (
    <>
      <style>{`
        @keyframes chatSlideIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
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
          50%       { transform: scale(1.25); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); }
          40%           { transform: translateY(-5px); }
        }
        @keyframes mascotFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        .chat-panel-enter-desktop { animation: chatSlideIn 0.24s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .chat-panel-enter-mobile  { animation: chatSlideUp 0.28s cubic-bezier(0.34,1.56,0.64,1) forwards; }
        .chat-msg-enter   { animation: chatMsgIn 0.22s ease-out forwards; }
        .chat-bubble      { transition: box-shadow 0.15s ease; }
        .chat-bubble:hover{ box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .dot-1 { animation: dotBounce 1.2s ease-in-out infinite 0ms; }
        .dot-2 { animation: dotBounce 1.2s ease-in-out infinite 150ms; }
        .dot-3 { animation: dotBounce 1.2s ease-in-out infinite 300ms; }
        .unread-pulse { animation: chatPulse 1.8s ease-in-out infinite; }
        .mascot-float { animation: mascotFloat 3s ease-in-out infinite; }
        .prose-chat p  { margin: 0 0 0.25em; }
        .prose-chat p:last-child { margin-bottom: 0; }
        .prose-chat ul { margin: 0.2em 0; padding-left: 1.1em; list-style: disc; }
        .prose-chat ul + ul { margin-top: 0; }
        .prose-chat li { margin: 0; line-height: 1.5; }
        .prose-chat strong { font-weight: 600; }
        .prose-chat em { font-style: italic; }
        .prose-chat code { font-family: monospace; background: rgba(0,0,0,0.06); padding: 1px 4px; border-radius: 3px; font-size: 11px; }
        .chat-link { color: var(--color-accent,#2563eb); text-decoration: underline; text-underline-offset: 2px; }
        .chat-link:hover { opacity: 0.75; }

        .chat-img {
          max-width: min(100%, 160px);
          max-height: 110px;
          border-radius: 8px;
          object-fit: contain;
          display: block;
          margin: 4px 0;
          background: #f5f5f5;
        }

        .chat-mobile-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.4);
          z-index: 9998;
          backdrop-filter: blur(2px);
        }
        
        .wc-btn {
          width: 12px; height: 12px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          transition: filter 0.15s, transform 0.1s;
          cursor: pointer; border: none; padding: 0;
          flex-shrink: 0;
        }
        .wc-btn:hover { filter: brightness(0.82); transform: scale(1.12); }
        .wc-btn svg { opacity: 0; transition: opacity 0.15s; width: 7px; height: 7px; }
        .wc-group:hover .wc-btn svg { opacity: 1; }
        .wc-close  { background: #ff5f57; }
        .wc-min    { background: #febc2e; }
        .wc-max    { background: #28c840; }

        .chat-textarea-ios {
          font-size: 16px !important;
          transform-origin: left top;
        }
        @supports not (-webkit-touch-callout: none) {
          .chat-textarea-ios {
            font-size: 14px !important;
            transform: none;
          }
        }

        .chat-newline-btn {
          height: 36px;
          padding: 0 8px;
          border-radius: 8px;
          border: 1px solid rgba(0,0,0,0.12);
          background: rgba(0,0,0,0.04);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, transform 0.1s;
          cursor: pointer;
          color: #666;
          flex-shrink: 0;
        }
        .chat-newline-btn:active { background: rgba(0,0,0,0.1); transform: scale(0.94); }
      `}</style>

      {isOpen && mobile && <div className="chat-mobile-backdrop" onClick={closePanel} />}

      {/* ── PANEL ── */}
      {isOpen && (
        <div
          className={`rounded-2xl border border-neutral bg-neutral-light shadow-2xl overflow-hidden flex flex-col ${mobile ? "chat-panel-enter-mobile" : "chat-panel-enter-desktop"}`}
          style={panelStyle}
        >
          {/* ── Header ── */}
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

          {/* ── Messages ── */}
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

          {/* ── Quick replies ── */}
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

          {/* ── Input ── */}
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
              <button
                type="button"
                onClick={handleMobileNewline}
                disabled={loading}
                title="Xuống hàng"
                className="chat-newline-btn disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Xuống hàng"
              >
                <CornerDownLeft size={14} strokeWidth={2} />
              </button>
            )}

            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center cursor-pointer shrink-0 transition-all duration-150 disabled:opacity-35 disabled:cursor-not-allowed hover:bg-accent-hover active:scale-95"
            >
              <Send size={13} className="text-white" strokeWidth={2} />
            </button>
          </div>
        </div>
      )}

      {/* ── TOGGLE BUTTON ── */}
      <button
        type="button"
        onClick={isOpen ? closePanel : openPanel}
        aria-label="Chat support"
        className={`relative rounded-full bg-white border border-neutral-100 flex items-center justify-center shadow-[0_8px_30px_rgb(0,0,0,0.14)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.20)] transition-all duration-300 select-none active:scale-90 overflow-visible cursor-pointer
          ${sheetOpen ? "opacity-0 pointer-events-none" : "opacity-100"}
        `}
        style={{ ...btnStyle, width: size, height: size }}
      >
        {hasUnread && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white z-10 unread-pulse" />}
        {!hasUnread && !isOpen && <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white z-10" />}

        {isOpen ? (
          <X size={isOpen ? 16 : 18} strokeWidth={2.5} className="text-neutral-600 transition-all duration-300" />
        ) : (
          <div className="mascot-float transition-all duration-300 flex items-center justify-center cursor-pointer" style={{ width: size + 8, height: size + 8, marginTop: -4 }}>
            <Image src="/images/Robot-mascot-v2.png" alt="Chat bot" width={40} height={40} className="object-contain drop-shadow-md" />
          </div>
        )}
      </button>
    </>
  );
}