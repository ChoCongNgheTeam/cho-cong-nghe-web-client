"use client";
import { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Trophy, Zap, Camera, Battery } from "lucide-react";
import { ProductDetail } from "@/lib/types/product";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ComparisonItem {
  category: string;
  analysis: string;
  winner: string;
}

interface AIResult {
  summary: string;
  comparison: ComparisonItem[];
  strengths: Record<string, string[]>;
  recommendation: {
    best_performance: string;
    best_value: string;
    best_for_users: {
      gaming: string;
      camera: string;
      battery: string;
    };
  };
}

// ─── Prompt builders ──────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `Bạn là trợ lý AI chuyên so sánh sản phẩm công nghệ cho website thương mại điện tử. Nhiệm vụ của bạn là phân tích thông số kỹ thuật sản phẩm được cung cấp dưới dạng JSON và tạo ra bản so sánh rõ ràng, dễ hiểu.
Quy tắc bắt buộc:
- Chỉ sử dụng thông tin có trong JSON được cung cấp. Không tự bịa thêm thông số.
- Nếu một sản phẩm thiếu thông số thì ghi "Không có thông tin".
- So sánh theo từng danh mục thực tế (dựa vào specs có trong dữ liệu): RAM, màn hình, camera, pin, chip, bộ nhớ, v.v.
- Chỉ ra điểm mạnh và khác biệt nổi bật của từng sản phẩm.
- Phân tích bằng tiếng Việt, ngắn gọn và khách quan.
- Trường "winner" chỉ được dùng đúng tên sản phẩm (lấy từ field "name" trong JSON) hoặc chuỗi "Ngang nhau".
QUAN TRỌNG: Chỉ trả về JSON thuần, không có text bên ngoài, không có markdown code fences.
Format JSON bắt buộc:
{
  "summary": "Tóm tắt tổng quan về các sản phẩm và điểm khác biệt chính",
  "comparison": [
    {
      "category": "Tên danh mục (vd: RAM, Màn hình, Camera chính, Pin)",
      "analysis": "Phân tích chi tiết từng sản phẩm trong danh mục này",
      "winner": "Tên sản phẩm thắng hoặc Ngang nhau"
    }
  ],
  "strengths": {
    "<tên sản phẩm 1>": ["Điểm mạnh 1", "Điểm mạnh 2"],
    "<tên sản phẩm 2>": ["Điểm mạnh 1", "Điểm mạnh 2"]
  },
  "recommendation": {
    "best_performance": "Tên sản phẩm hiệu năng tốt nhất",
    "best_value": "Tên sản phẩm có giá trị tốt nhất (hiệu năng / giá)",
    "best_for_users": {
      "gaming": "Tên sản phẩm phù hợp chơi game",
      "camera": "Tên sản phẩm phù hợp chụp ảnh / quay phim",
      "battery": "Tên sản phẩm pin tốt nhất"
    }
  }
}`;

function buildUserPrompt(products: ProductDetail[]): string {
  const payload = products.map((p) => ({
    name: p.name,
    brand: p.brand.name,
    price: p.price.hasPromotion ? p.price.final : p.price.base,
    rating: { average: p.rating.average, total: p.rating.total },
    stockStatus: p.stockStatus,
    specs: p.highlights.map((h) => ({
      name: h.name,
      value: `${h.value}${h.unit ?? ""}`,
    })),
  }));

  return `Hãy so sánh các sản phẩm sau đây dựa trên thông số kỹ thuật được cung cấp:

${JSON.stringify({ products: payload }, null, 2)}

Trả về kết quả đúng format JSON đã quy định trong system prompt.`;
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function callGroq(products: ProductDetail[]): Promise<AIResult> {
  const GROQ_API_KEY = process.env.NEXT_PUBLIC_GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("Chưa cấu hình NEXT_PUBLIC_GROQ_API_KEY trong .env");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.4,
      max_tokens: 1500,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(products) },
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

// ─── Sub-components ───────────────────────────────────────────────────────────
function WinnerBadge({ winner, products }: { winner: string; products: ProductDetail[] }) {
  if (winner === "Ngang nhau") {
    return (
      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-neutral-light-active text-neutral-darker border border-neutral whitespace-nowrap">
        Ngang nhau
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent-light text-accent-dark border border-accent-light-active whitespace-nowrap flex items-center gap-1">
      <Trophy size={9} />
      {winner}
    </span>
  );
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
      {/* ── Header ── */}
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
              className="inline-flex items-center gap-1.5 text-[12px] font-medium bg-primary text-neutral-light px-3.5 py-1.5 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
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

      {/* ── Loading ── */}
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
          <span className="text-[13px] text-neutral-darker">AI đang phân tích sản phẩm...</span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="px-5 py-4">
          <p className="text-[12px] text-promotion">{error}</p>
          <button onClick={analyze} className="mt-2 text-[12px] text-accent underline underline-offset-2 cursor-pointer">
            Thử lại
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && !error && (
        <div className="px-5 py-5 text-center">
          <p className="text-[13px] text-neutral-darker">
            Nhấn <span className="font-medium text-primary">Phân tích ngay</span> để AI tổng kết và gợi ý sản phẩm phù hợp nhất cho bạn.
          </p>
        </div>
      )}

      {/* ── Result ── */}
      {result && expanded && !loading && (
        <div className="px-5 py-4 space-y-5">

          {/* Summary */}
          <p className="text-[13px] text-neutral-darker leading-relaxed">{result.summary}</p>

          {/* Comparison table */}
          {result.comparison?.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-neutral-darker uppercase tracking-wide mb-2">
                So sánh chi tiết
              </p>
              <div className="rounded-xl border border-neutral overflow-hidden">
                {result.comparison.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-3 ${idx !== result.comparison.length - 1 ? "border-b border-neutral" : ""}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] font-semibold text-primary">{item.category}</span>
                      <WinnerBadge winner={item.winner} products={products} />
                    </div>
                    <p className="text-[12px] text-neutral-darker leading-relaxed">{item.analysis}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths && Object.keys(result.strengths).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-neutral-darker uppercase tracking-wide mb-2">
                Điểm mạnh nổi bật
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {Object.entries(result.strengths).map(([name, points]) => (
                  <div key={name} className="bg-neutral-light border border-neutral rounded-xl px-3.5 py-3">
                    <p className="text-[12px] font-semibold text-primary mb-2 line-clamp-1">{name}</p>
                    <ul className="space-y-1">
                      {points.map((point, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px] text-neutral-darker">
                          <span className="text-accent mt-0.5 shrink-0">✓</span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendation */}
          {result.recommendation && (
            <div className="bg-accent-light border border-accent-light-active rounded-xl px-4 py-3 space-y-2.5">
              <p className="text-[11px] font-semibold text-accent-dark uppercase tracking-wide">
                Gợi ý của AI
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex items-start gap-2">
                  <Trophy size={13} className="text-accent-dark mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-accent-dark font-medium">Hiệu năng tốt nhất</p>
                    <p className="text-[12px] text-accent-darker">{result.recommendation.best_performance}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={13} className="text-accent-dark mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-accent-dark font-medium">Giá trị tốt nhất</p>
                    <p className="text-[12px] text-accent-darker">{result.recommendation.best_value}</p>
                  </div>
                </div>
                {result.recommendation.best_for_users && (
                  <>
                    <div className="flex items-start gap-2">
                      <Zap size={13} className="text-accent-dark mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">Chơi game</p>
                        <p className="text-[12px] text-accent-darker">{result.recommendation.best_for_users.gaming}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Camera size={13} className="text-accent-dark mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">Chụp ảnh / quay phim</p>
                        <p className="text-[12px] text-accent-darker">{result.recommendation.best_for_users.camera}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Battery size={13} className="text-accent-dark mt-0.5 shrink-0" />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">Pin tốt nhất</p>
                        <p className="text-[12px] text-accent-darker">{result.recommendation.best_for_users.battery}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}