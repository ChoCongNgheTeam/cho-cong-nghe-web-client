"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { ProductDetail } from "@/lib/types/product";

// ─── Types ────────────────────────────────────────────────────────────────────
interface VerdictItem {
  productName: string;
  badge: "best" | "budget" | "consider";
  badgeLabel: string;
  reason: string;
}

interface AIResult {
  summary: string;
  verdicts: VerdictItem[];
  recommendation: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const BADGE_STYLES: Record<VerdictItem["badge"], string> = {
  best:     "bg-accent-light text-accent-dark border border-accent-light-active",
  budget:   "bg-accent-light text-accent border border-accent-light-active",
  consider: "bg-neutral-light-active text-neutral-darker border border-neutral",
};

function buildPrompt(products: ProductDetail[]): string {
  const formatPrice = (p: ProductDetail) =>
    (p.price.hasPromotion ? p.price.final : p.price.base);

  const list = products
    .map((p, index) => {
      const price = formatPrice(p);
      return `#${index + 1}
Tên: ${p.name}
Thương hiệu: ${p.brand.name}
Giá: ${price.toLocaleString("vi-VN")}đ
Rating: ${p.rating.average}/5 (${p.rating.total} lượt)
Tình trạng: ${p.stockStatus === "in_stock" ? "Còn hàng" : "Hết hàng"}
Thông số:
${p.highlights.map((h) => `- ${h.name}: ${h.value}${h.unit ?? ""}`).join("\n")}`;
    })
    .join("\n\n");

  return `
Bạn là chuyên gia so sánh sản phẩm trong thương mại điện tử. 
Nhiệm vụ của bạn là đưa ra đánh giá KHÁCH QUAN, CÓ DỮ LIỆU và HỮU ÍCH cho quyết định mua hàng.

====================
DANH SÁCH SẢN PHẨM:
====================
${list}

====================
NGUYÊN TẮC BẮT BUỘC:
====================

1. KHÔNG ĐƯỢC NÓI CHUNG CHUNG
- Mọi nhận xét phải có số liệu cụ thể (giá, RAM, chip, rating…)
- Không dùng từ mơ hồ như: "mạnh", "tốt", "ổn"

2. KHÔNG ĐƯỢC TỰ BỊA
- Chỉ sử dụng dữ liệu đã cung cấp
- Nếu thiếu dữ liệu → ghi rõ "không có dữ liệu"

3. CHUẨN HÓA SO SÁNH
- Chỉ so sánh cùng loại thông số
- Không suy luận ngoài dữ liệu

4. CHẤM ĐIỂM NGẦM (QUAN TRỌNG)
Tự đánh giá mỗi sản phẩm theo:
- Giá (30%): giá càng thấp càng tốt
- Hiệu năng (40%): dựa trên thông số nổi bật
- Rating (30%): dựa trên rating + số lượt đánh giá

→ Dùng logic này để chọn sản phẩm "best"

5. QUY TẮC BADGE
- "best": điểm tổng cao nhất
- "budget": giá thấp nhất + rating >= 3.5
- "consider": các sản phẩm còn lại

6. KHÔNG DÌM HÀNG
- Mỗi sản phẩm phải có ít nhất 1 ưu điểm cụ thể (có số liệu)

7. EDGE CASE
- Nếu các sản phẩm tương đương → ưu tiên rating cao hơn
- Nếu giá bằng nhau → ưu tiên thông số tốt hơn
- Nếu rating thấp (<3.5) → không được gán "best"

====================
FORMAT TRẢ VỀ (JSON):
====================

{
  "summary": "So sánh cốt lõi dựa trên số liệu (chênh lệch giá, thông số nổi bật...)",
  "verdicts": [
    {
      "productName": "tên sản phẩm",
      "badge": "best" | "budget" | "consider",
      "badgeLabel": "Nhãn hấp dẫn và tích cực dựa trên ưu điểm riêng (ví dụ: 'Pin cực khủng', 'Thiết kế sang trọng', 'Màn hình sắc nét') thay vì chỉ dùng từ 'Cân nhắc' chung chung.",
      "reason": "Ưu điểm nhờ [GIÁ/TRỊ/THÔNG SỐ CỤ THỂ]"
    }
  ],
  "recommendation": "Nếu cần [X] → chọn [A], nếu muốn tiết kiệm [Y tiền] → chọn [B]"
}

CHỈ TRẢ JSON. KHÔNG GIẢI THÍCH THÊM.
`;
}

async function callGroq(products: ProductDetail[]): Promise<AIResult> {
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    throw new Error("Chưa cấu hình NEXT_PUBLIC_GROQ_API_KEY trong .env");
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 1024,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Bạn là chuyên gia tư vấn mua sắm. Chỉ trả về JSON, không thêm bất kỳ text nào khác.",
        },
        { role: "user", content: buildPrompt(products) },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Lỗi API: ${res.status}`);
  }

  const data = await res.json();
  const text: string = data?.choices?.[0]?.message?.content ?? "";
  const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(clean) as AIResult;
}

// ─── Component ────────────────────────────────────────────────────────────────
interface Props {
  products: ProductDetail[];
}

export function AICompareSummary({ products }: Props) {
  const [result, setResult] = useState<AIResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const prevIdsRef = useRef<string>("");

  useEffect(() => {
    const currentIds = products.map((p) => p.id).sort().join(",");
    if (prevIdsRef.current && prevIdsRef.current !== currentIds) {
      setResult(null);
      setError(null);
    }
    prevIdsRef.current = currentIds;
  }, [products]);

  if (products.length < 2) return null;

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await callGroq(products);
      setResult(data);
      setExpanded(true);
    } catch (e: any) {
      setError(e?.message ?? "Có lỗi xảy ra, thử lại nhé.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-neutral overflow-hidden bg-neutral-light">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent-light flex items-center justify-center">
            <Sparkles size={14} className="text-accent" />
          </div>
          <p className="text-[13px] font-semibold text-primary">Gợi ý từ AI</p>
        </div>

        <div className="flex items-center gap-2">
          {!result && !loading && (
            <button
              onClick={analyze}
              className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-primary text-neutral-light px-3.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity"
            >
              <Sparkles size={12} />
              Phân tích ngay
            </button>
          )}
          {result && !loading && (
            <button
              onClick={analyze}
              className="inline-flex items-center gap-1.5 text-[12px] text-neutral-darker border border-neutral px-3 py-1.5 rounded-lg hover:bg-neutral-light-active transition-colors cursor-pointer"
            >
              <RefreshCw size={11} />
              Phân tích lại
            </button>
          )}
          {result && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-light-active transition-colors text-neutral-darker cursor-pointer"
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span className="text-[13px] text-neutral-darker">
            AI đang phân tích sản phẩm...
          </span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="px-5 py-4">
          <p className="text-[12px] text-promotion">{error}</p>
          <button
            onClick={analyze}
            className="mt-2 text-[12px] text-accent underline underline-offset-2"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && !error && (
        <div className="px-5 py-5 text-center">
          <p className="text-[13px] text-neutral-darker">
            Nhấn{" "}
            <span className="font-medium text-primary">Phân tích ngay</span>{" "}
            để AI tổng kết và gợi ý sản phẩm phù hợp nhất cho bạn.
          </p>
        </div>
      )}

      {/* Result */}
      {result && expanded && !loading && (
        <div className="px-5 py-4 space-y-4">
          {/* Summary */}
          <p className="text-[13px] text-neutral-darker leading-relaxed">
            {result.summary}
          </p>

          {/* Verdict cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {result.verdicts.map((v) => (
              <div
                key={v.productName}
                className="bg-neutral-light border border-neutral rounded-xl px-3.5 py-3"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-[12px] font-semibold text-primary leading-snug line-clamp-2">
                    {v.productName}
                  </p>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0 ${BADGE_STYLES[v.badge]}`}
                  >
                    {v.badgeLabel}
                  </span>
                </div>
                <p className="text-[11px] text-neutral-darker leading-relaxed">
                  {v.reason}
                </p>
              </div>
            ))}
          </div>

          {/* Recommendation */}
          <div className="bg-accent-light border border-accent-light-active rounded-xl px-4 py-3">
            <p className="text-[11px] font-semibold text-accent-dark uppercase tracking-wide mb-1">
              Gợi ý của AI
            </p>
            <p className="text-[13px] text-accent-darker leading-relaxed">
              {result.recommendation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}