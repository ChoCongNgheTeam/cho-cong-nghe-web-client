"use client";

import { useState, useRef, useEffect } from "react";
import { Sparkles, Loader2, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Info, RefreshCw, ClipboardCopy, ArrowDownToLine, Clock } from "lucide-react";
import apiRequest from "@/lib/api";

type Mode = "blog" | "product";

interface SEOScore {
  overall: number;
  details: { titleScore: number; keywordDensity: number; readabilityScore: number; lengthScore: number };
  suggestions: string[];
  keywordCount: number;
  wordCount: number;
}

interface GeneratedContent {
  content: string;
  seoScore: SEOScore;
  suggestedTitle?: string;
  suggestedSlug?: string;
  suggestedMetaDescription?: string;
}

interface AiContentPanelProps {
  mode: Mode;
  productId?: string;
  productName?: string;
  blogType?: string;
  currentTitle?: string;
  currentContent?: string;
  onApply: (content: string) => void;
}

const scoreColor = (score: number) => (score >= 80 ? "text-emerald-600" : score >= 60 ? "text-yellow-600" : "text-red-500");
const scoreBg = (score: number) => (score >= 80 ? "bg-emerald-50 border-emerald-200" : score >= 60 ? "bg-yellow-50 border-yellow-200" : "bg-red-50 border-red-200");
const scoreLabel = (score: number) => (score >= 80 ? "Tốt" : score >= 60 ? "Trung bình" : "Cần cải thiện");

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-neutral-dark">{label}</span>
        <span className={`text-[11px] font-semibold ${scoreColor(value)}`}>{value}/100</span>
      </div>
      <div className="h-1.5 bg-neutral-light-active rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${value >= 80 ? "bg-emerald-500" : value >= 60 ? "bg-yellow-400" : "bg-red-400"}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function GeneratingOverlay({ mode }: { mode: Mode }) {
  const tips =
    mode === "blog"
      ? ["Đang phân tích yêu cầu...", "Đang soạn nội dung...", "Đang tối ưu SEO...", "Sắp hoàn thành..."]
      : ["Đang phân tích sản phẩm...", "Đang viết mô tả...", "Đang tối ưu từ khóa..."];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setIdx((i) => (i + 1) % tips.length), 3500);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="flex flex-col items-center py-7 gap-3 text-center">
      <div className="relative">
        <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
          <Sparkles size={20} className="text-accent animate-pulse" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-neutral flex items-center justify-center">
          <Loader2 size={11} className="animate-spin text-accent" />
        </div>
      </div>
      <div>
        <p className="text-[13px] font-semibold text-primary">AI đang tạo nội dung</p>
        <p className="text-[11px] text-neutral-dark mt-1 min-h-[1.2em]">{tips[idx]}</p>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-light border border-neutral text-[11px] text-neutral-dark">
        <Clock size={11} />
        Có thể mất 30–90 giây, vui lòng chờ
      </div>
    </div>
  );
}

function SeoCheckerTab({ mode, currentTitle, currentContent }: { mode: Mode; currentTitle?: string; currentContent?: string }) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!keyword.trim()) return;
    if (!currentContent || currentContent.replace(/<[^>]+>/g, "").trim().length < 50) {
      setError("Nội dung quá ngắn để phân tích SEO. Hãy viết thêm nội dung trước.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await apiRequest.post<{ data: SEOScore }>("/ai-content/analyze-seo", {
        content: currentContent || "",
        title: currentTitle || "",
        focusKeyword: keyword.trim(),
        contentType: mode === "product" ? "product" : "blog",
      });
      setResult((res as any).data);
    } catch (e: any) {
      setError(e?.message ?? "Không thể phân tích SEO");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Từ khóa focus</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleCheck()}
            placeholder="VD: iphone 15 pro max"
            className="flex-1 px-3 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary placeholder:text-neutral-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || !keyword.trim()}
            className="px-3 py-2 bg-accent text-white text-[12px] font-medium rounded-xl hover:bg-accent/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
          >
            {loading ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            Check
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-600">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${scoreBg(result.overall)}`}>
            <div>
              <p className="text-[11px] font-semibold text-neutral-dark">Điểm SEO tổng quan</p>
              <p className="text-[10px] text-neutral-dark/60 mt-0.5">
                {result.wordCount} từ · {result.keywordCount} lần xuất hiện keyword
              </p>
            </div>
            <div className="text-right">
              <p className={`text-[28px] font-bold leading-none ${scoreColor(result.overall)}`}>{result.overall}</p>
              <p className={`text-[10px] font-semibold mt-0.5 ${scoreColor(result.overall)}`}>{scoreLabel(result.overall)}</p>
            </div>
          </div>
          <div className="px-3 py-3 rounded-xl border border-neutral bg-neutral-light space-y-2.5">
            <ScoreBar label="Tiêu đề" value={result.details.titleScore} />
            <ScoreBar label="Mật độ keyword" value={Math.min(100, Math.round((result.details.keywordDensity / 2) * 100))} />
            <ScoreBar label="Dễ đọc" value={result.details.readabilityScore} />
            <ScoreBar label="Độ dài" value={result.details.lengthScore} />
          </div>
          {result.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Gợi ý cải thiện</p>
              {result.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-lg bg-neutral-light border border-neutral text-[11px] text-primary">
                  <Info size={11} className="mt-0.5 shrink-0 text-accent" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div className="flex flex-col items-center py-6 gap-2 text-center">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
            <CheckCircle2 size={18} className="text-accent" />
          </div>
          <p className="text-[12px] text-neutral-dark">Nhập từ khóa và nhấn Check để phân tích SEO nội dung hiện tại</p>
        </div>
      )}
    </div>
  );
}

function GenerateTab({ mode, productId, productName, blogType, onApply }: { mode: Mode; productId?: string; productName?: string; blogType?: string; onApply: (content: string) => void }) {
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState<"professional" | "friendly" | "enthusiastic">("friendly");
  const [length, setLength] = useState<"short" | "medium" | "long">("medium");
  const [blogTitle, setBlogTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const isProduct = mode === "product";
  const canGenerate = isProduct ? !!keyword.trim() && (!!productId || !!productName?.trim()) : !!keyword.trim() && !!blogTitle.trim();

  const productHint = isProduct
    ? productId
      ? { text: "Dùng thông số từ DB", cls: "bg-emerald-50 border-emerald-200 text-emerald-700" }
      : productName?.trim()
        ? { text: `Dùng tên: "${productName.trim()}"`, cls: "bg-accent/5 border-accent/20 text-accent" }
        : { text: "Nhập tên sản phẩm vào form để AI viết được", cls: "bg-yellow-50 border-yellow-200 text-yellow-700" }
    : null;

  const handleGenerate = async () => {
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let res: any;
      if (isProduct) {
        if (productId) {
          res = await apiRequest.post(
            "/ai-content/product-description",
            { productId, focusKeyword: keyword.trim(), tone, targetLength: length, additionalNotes: notes.trim() || undefined },
            { timeout: 180_000, signal: abortRef.current.signal },
          );
        } else {
          res = await apiRequest.post(
            "/ai-content/product-description-from-name",
            { productName: productName!.trim(), focusKeyword: keyword.trim(), tone, targetLength: length, additionalNotes: notes.trim() || undefined },
            { timeout: 180_000, signal: abortRef.current.signal },
          );
        }
      } else {
        res = await apiRequest.post(
          "/ai-content/blog",
          { title: blogTitle.trim(), focusKeyword: keyword.trim(), blogType: blogType || "TIN_MOI", targetLength: length, additionalNotes: notes.trim() || undefined },
          { timeout: 180_000, signal: abortRef.current.signal },
        );
      }
      setResult((res as any)?.data ?? res);
    } catch (e: any) {
      if (e?.name === "AbortError") return;
      if (e?.message?.includes("quá thời gian") || e?.message?.includes("timeout")) {
        setError("OpenAI mất quá nhiều thời gian phản hồi. Thử chọn độ dài ngắn hơn hoặc thử lại.");
      } else {
        setError(e?.message ?? "Không thể tạo nội dung. Vui lòng thử lại.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setLoading(false);
  };

  const handleCopy = async () => {
    if (!result?.content) return;
    await navigator.clipboard.writeText(result.content.replace(/<[^>]+>/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      {!isProduct && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
            Tiêu đề bài viết <span className="text-red-400 font-normal">*</span>
          </label>
          <input
            type="text"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Tiêu đề sẽ được viết..."
            className="w-full px-3 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary placeholder:text-neutral-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
      )}

      {productHint && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] border ${productHint.cls}`}>
          <Info size={11} className="shrink-0" />
          {productHint.text}
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
          Từ khóa SEO <span className="text-red-400 font-normal">*</span>
        </label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={isProduct ? "VD: iphone 15 pro max 256gb" : "VD: laptop gaming giá rẻ"}
          className="w-full px-3 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary placeholder:text-neutral-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {isProduct && (
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Phong cách</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              className="w-full px-2.5 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
            >
              <option value="friendly">Thân thiện</option>
              <option value="professional">Chuyên nghiệp</option>
              <option value="enthusiastic">Hấp dẫn</option>
            </select>
          </div>
        )}
        <div className={`space-y-1.5 ${!isProduct ? "col-span-2" : ""}`}>
          <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Độ dài</label>
          <select
            value={length}
            onChange={(e) => setLength(e.target.value as any)}
            className="w-full px-2.5 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 cursor-pointer"
          >
            <option value="short">{isProduct ? "Ngắn (~150 từ)" : "Ngắn (~400 từ)"}</option>
            <option value="medium">{isProduct ? "Vừa (~300 từ)" : "Vừa (~800 từ)"}</option>
            <option value="long">{isProduct ? "Dài (~500 từ)" : "Dài (~1500 từ)"}</option>
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">
          Ghi chú thêm <span className="text-neutral-dark/40 normal-case font-normal">(tuỳ chọn)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={isProduct ? "VD: Nhấn mạnh pin trâu, phù hợp dân văn phòng..." : "VD: Tập trung vào so sánh với các đối thủ, có số liệu thực tế..."}
          rows={2}
          className="w-full px-3 py-2 text-[12px] border border-neutral rounded-xl bg-neutral-light text-primary placeholder:text-neutral-dark/50 focus:outline-none focus:ring-2 focus:ring-accent/30 resize-none"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading || !canGenerate}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[13px] font-semibold rounded-xl cursor-pointer transition-colors"
        >
          {loading ? (
            <>
              <Loader2 size={13} className="animate-spin" />
              Đang tạo...
            </>
          ) : (
            <>
              <Sparkles size={13} />
              {result ? "Tạo lại" : "Tạo nội dung"}
            </>
          )}
        </button>
        {loading && (
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-neutral-dark hover:bg-neutral-light-active cursor-pointer transition-colors"
          >
            Huỷ
          </button>
        )}
      </div>

      {loading && <GeneratingOverlay mode={mode} />}

      {!loading && error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-600">
          <AlertCircle size={13} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button type="button" onClick={handleGenerate} className="mt-1 text-[11px] underline cursor-pointer">
              Thử lại
            </button>
          </div>
        </div>
      )}

      {!loading && result && (
        <div className="space-y-3 border-t border-neutral pt-3">
          <div className={`flex items-center justify-between px-3 py-2.5 rounded-xl border ${scoreBg(result.seoScore.overall)}`}>
            <div>
              <p className="text-[11px] font-semibold text-neutral-dark">Điểm SEO</p>
              <p className="text-[10px] text-neutral-dark/60">
                {result.seoScore.wordCount} từ · density {result.seoScore.details.keywordDensity}%
              </p>
            </div>
            <span className={`text-[22px] font-bold ${scoreColor(result.seoScore.overall)}`}>{result.seoScore.overall}</span>
          </div>

          {result.suggestedMetaDescription && (
            <div className="px-3 py-2.5 rounded-xl border border-neutral bg-neutral-light space-y-1">
              <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Meta description gợi ý</p>
              <p className="text-[11px] text-primary leading-relaxed">{result.suggestedMetaDescription}</p>
              <p className="text-[10px] text-neutral-dark/50">{result.suggestedMetaDescription.length} ký tự</p>
            </div>
          )}

          {result.suggestedSlug && (
            <div className="px-3 py-2 rounded-xl border border-neutral bg-neutral-light">
              <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-wider mb-0.5">Slug gợi ý</p>
              <code className="text-[11px] text-accent">{result.suggestedSlug}</code>
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-neutral bg-neutral-light hover:bg-neutral-light-active text-[12px] text-primary cursor-pointer"
          >
            <span>Xem trước nội dung</span>
            {showPreview ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {showPreview && (
            <div
              className="px-3 py-3 rounded-xl border border-neutral bg-neutral-light text-[12px] text-primary leading-relaxed max-h-48 overflow-y-auto prose prose-sm"
              dangerouslySetInnerHTML={{ __html: result.content }}
            />
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 border border-neutral rounded-xl text-[12px] text-primary hover:bg-neutral-light-active cursor-pointer transition-colors"
            >
              {copied ? (
                <>
                  <CheckCircle2 size={12} className="text-emerald-500" />
                  Đã copy
                </>
              ) : (
                <>
                  <ClipboardCopy size={12} />
                  Copy text
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => onApply(result.content)}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-accent text-white rounded-xl text-[12px] font-semibold hover:bg-accent/90 cursor-pointer transition-colors"
            >
              <ArrowDownToLine size={12} />
              Áp dụng
            </button>
          </div>

          {result.seoScore.suggestions.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[10px] font-semibold text-neutral-dark uppercase tracking-wider">Gợi ý cải thiện</p>
              {result.seoScore.suggestions.slice(0, 3).map((s, i) => (
                <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-neutral-light border border-neutral text-[11px] text-primary">
                  <Info size={10} className="mt-0.5 shrink-0 text-accent" />
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function AiContentPanel({ mode, productId, productName, blogType, currentTitle, currentContent, onApply }: AiContentPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "seo">("generate");

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/[0.03] overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-accent/5 transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-accent/15 flex items-center justify-center">
            <Sparkles size={14} className="text-accent" />
          </div>
          <div className="text-left">
            <p className="text-[13px] font-semibold text-primary">Trợ lý AI</p>
            <p className="text-[10px] text-neutral-dark">{mode === "product" ? "Tạo mô tả · Check SEO" : "Tạo bài viết · Check SEO"}</p>
          </div>
        </div>
        {open ? <ChevronUp size={15} className="text-neutral-dark" /> : <ChevronDown size={15} className="text-neutral-dark" />}
      </button>

      {open && (
        <div className="border-t border-accent/20">
          <div className="flex border-b border-neutral">
            <button
              type="button"
              onClick={() => setActiveTab("generate")}
              className={`flex-1 py-2.5 text-[12px] font-medium transition-colors cursor-pointer ${activeTab === "generate" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-neutral-dark hover:text-primary"}`}
            >
              ✨ Tạo nội dung
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("seo")}
              className={`flex-1 py-2.5 text-[12px] font-medium transition-colors cursor-pointer ${activeTab === "seo" ? "text-accent border-b-2 border-accent bg-accent/5" : "text-neutral-dark hover:text-primary"}`}
            >
              📊 Check SEO
            </button>
          </div>
          <div className="p-4">
            {activeTab === "generate" ? (
              <GenerateTab mode={mode} productId={productId} productName={productName} blogType={blogType} onApply={onApply} />
            ) : (
              <SeoCheckerTab mode={mode} currentTitle={currentTitle} currentContent={currentContent} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
