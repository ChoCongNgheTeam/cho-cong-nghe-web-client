"use client";
import { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Trophy,
  Zap,
  Camera,
  Battery,
} from "lucide-react";
import { ProductDetail } from "@/lib/types/product";
import apiRequest from "@/lib/api";

// ─── API call (BE) ────────────────────────────────────────────────────────────
interface ComparisonItem {
  category: string;
  analysis: string;
  winner: string;
}

interface AIAnalysis {
  summary: string;
  comparison: ComparisonItem[];
  strengths: Record<string, string[]>;
  recommendation: {
    best_performance: string;
    best_value: string;
    best_for_users: { gaming: string; camera: string; battery: string };
  };
}

interface AICompareResult {
  products: unknown[]; // FE không dùng products ở component này
  aiAnalysis: AIAnalysis;
}
// Thay toàn bộ hàm fetchAICompare cũ bằng cái này
async function fetchAICompare(productIds: string[]): Promise<AICompareResult> {
  const response = await apiRequest.post<{ data: AICompareResult }>(
    "/ai-compare",
    { productIds },
    { noAuth: true, timeout: 60000 },
  );
  return response.data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function WinnerBadge({ winner }: { winner: string }) {
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
  const [result, setResult] = useState<AIAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const prevIdsRef = useRef<string>("");

  // Reset khi danh sách sản phẩm thay đổi
  useEffect(() => {
    const currentIds = products
      .map((p) => p.id)
      .sort()
      .join(",");
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
      const data = await fetchAICompare(products.map((p) => p.id));
      setResult(data.aiAnalysis);
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
          <span className="text-[13px] text-neutral-darker">
            AI đang phân tích sản phẩm...
          </span>
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="px-5 py-4">
          <p className="text-[12px] text-promotion">{error}</p>
          <button
            onClick={analyze}
            className="mt-2 text-[12px] text-accent underline underline-offset-2 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {!result && !loading && !error && (
        <div className="px-5 py-5 text-center">
          <p className="text-[13px] text-neutral-darker">
            Nhấn{" "}
            <span className="font-medium text-primary">Phân tích ngay</span> để
            AI tổng kết và gợi ý sản phẩm phù hợp nhất cho bạn.
          </p>
        </div>
      )}

      {/* ── Result ── */}
      {result && expanded && !loading && (
        <div className="px-5 py-4 space-y-5">
          {/* Summary */}
          <p className="text-[13px] text-neutral-darker leading-relaxed">
            {result.summary}
          </p>

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
                    className={`px-4 py-3 ${
                      idx !== result.comparison.length - 1
                        ? "border-b border-neutral"
                        : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[12px] font-semibold text-primary">
                        {item.category}
                      </span>
                      <WinnerBadge winner={item.winner} />
                    </div>
                    <p className="text-[12px] text-neutral-darker leading-relaxed">
                      {item.analysis}
                    </p>
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
                  <div
                    key={name}
                    className="bg-neutral-light border border-neutral rounded-xl px-3.5 py-3"
                  >
                    <p className="text-[12px] font-semibold text-primary mb-2 line-clamp-1">
                      {name}
                    </p>
                    <ul className="space-y-1">
                      {points.map((point, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-1.5 text-[11px] text-neutral-darker"
                        >
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
                  <Trophy
                    size={13}
                    className="text-accent-dark mt-0.5 shrink-0"
                  />
                  <div>
                    <p className="text-[11px] text-accent-dark font-medium">
                      Hiệu năng tốt nhất
                    </p>
                    <p className="text-[12px] text-accent-darker">
                      {result.recommendation.best_performance}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Zap size={13} className="text-accent-dark mt-0.5 shrink-0" />
                  <div>
                    <p className="text-[11px] text-accent-dark font-medium">
                      Giá trị tốt nhất
                    </p>
                    <p className="text-[12px] text-accent-darker">
                      {result.recommendation.best_value}
                    </p>
                  </div>
                </div>
                {result.recommendation.best_for_users && (
                  <>
                    <div className="flex items-start gap-2">
                      <Zap
                        size={13}
                        className="text-accent-dark mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">
                          Chơi game
                        </p>
                        <p className="text-[12px] text-accent-darker">
                          {result.recommendation.best_for_users.gaming}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Camera
                        size={13}
                        className="text-accent-dark mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">
                          Chụp ảnh / quay phim
                        </p>
                        <p className="text-[12px] text-accent-darker">
                          {result.recommendation.best_for_users.camera}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Battery
                        size={13}
                        className="text-accent-dark mt-0.5 shrink-0"
                      />
                      <div>
                        <p className="text-[11px] text-accent-dark font-medium">
                          Pin tốt nhất
                        </p>
                        <p className="text-[12px] text-accent-darker">
                          {result.recommendation.best_for_users.battery}
                        </p>
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
