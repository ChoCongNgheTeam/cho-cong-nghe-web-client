"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, FileSpreadsheet, Download, Check, X, AlertCircle, Info, Loader2, ChevronDown, ChevronUp, Wand2, Merge, FileWarning, ArrowRight } from "lucide-react";
import apiRequest from "@/lib/api";

// ─── Types ───────────────────────────────────────────────────

interface SpecForm {
  specificationId: string;
  value: string;
  isHighlight: boolean;
  enabled: boolean;
}

interface SpecGrouped {
  groupName: string;
  items: Array<{ id: string; name: string; group: string; unit?: string | null }>;
}

interface ParsedSpecRow {
  spec_id: string;
  value: string;
  is_highlight?: boolean;
  name?: string;
  group?: string;
  unit?: string;
}

interface ImportResult {
  parsed: {
    rows: ParsedSpecRow[];
    skippedCount: number;
    totalRows: number;
    errors: string[];
  };
  validRows: ParsedSpecRow[];
  invalidSpecIds: string[];
}

interface MergedPreviewRow {
  specificationId: string;
  name: string;
  group: string;
  unit?: string;
  newValue: string;
  currentValue: string;
  isHighlight: boolean;
  isOverwrite: boolean; // true = đang có giá trị, sẽ bị ghi đè
  source: "import" | "ai" | "both";
}

interface SpecImportPanelProps {
  productName: string;
  categoryId: string;
  specGroups: SpecGrouped[];
  specs: SpecForm[];
  onApply: (updates: Record<string, { value: string; isHighlight?: boolean }>) => void;
}

// ─── Helpers ─────────────────────────────────────────────────

const scoreColor = (n: number, total: number) => {
  const p = total > 0 ? n / total : 0;
  return p >= 0.7 ? "text-emerald-600" : p >= 0.4 ? "text-yellow-600" : "text-neutral-dark";
};

function FileDropZone({ onFile, loading }: { onFile: (f: File) => void; loading: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(ext ?? "")) {
      alert("Chỉ hỗ trợ file .xlsx, .xls, .csv");
      return;
    }
    onFile(f);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onClick={() => !loading && inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2.5 py-7 rounded-2xl border-2 border-dashed
        transition-all cursor-pointer select-none
        ${
          loading
            ? "border-neutral bg-neutral-light-active cursor-not-allowed opacity-60"
            : dragging
              ? "border-accent bg-accent/5 scale-[1.01]"
              : "border-neutral hover:border-accent/50 hover:bg-accent/3 bg-neutral-light"
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      <div
        className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all
        ${dragging ? "bg-accent/15" : "bg-neutral-light-active"}`}
      >
        {loading ? <Loader2 size={20} className="text-accent animate-spin" /> : <Upload size={20} className={dragging ? "text-accent" : "text-neutral-dark"} />}
      </div>
      <div className="text-center">
        <p className="text-[13px] font-semibold text-primary">{loading ? "Đang phân tích file..." : "Kéo thả hoặc click để chọn file"}</p>
        <p className="text-[11px] text-neutral-dark mt-0.5">Hỗ trợ .xlsx · .xls · .csv — tối đa 2MB</p>
      </div>
      {!loading && (
        <div className="flex items-center gap-1.5 text-[10px] text-accent bg-accent/8 border border-accent/20 px-3 py-1 rounded-full">
          <FileSpreadsheet size={10} />
          Dùng file template để đảm bảo format đúng
        </div>
      )}
    </div>
  );
}

// ─── Merge Preview Modal ─────────────────────────────────────

function MergePreviewModal({
  rows,
  productName,
  onConfirm,
  onCancel,
}: {
  rows: MergedPreviewRow[];
  productName: string;
  onConfirm: (selected: Record<string, { value: string; isHighlight?: boolean }>) => void;
  onCancel: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set(rows.map((r) => r.specificationId)));

  const toggle = (id: string) =>
    setSelected((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const toggleAll = (v: boolean) => setSelected(v ? new Set(rows.map((r) => r.specificationId)) : new Set());

  const grouped = rows.reduce<Record<string, MergedPreviewRow[]>>((acc, r) => {
    const g = r.group || "Khác";
    if (!acc[g]) acc[g] = [];
    acc[g].push(r);
    return acc;
  }, {});

  const newCount = rows.filter((r) => !r.isOverwrite).length;
  const overwriteCount = rows.filter((r) => r.isOverwrite).length;
  const importCount = rows.filter((r) => r.source === "import" || r.source === "both").length;
  const aiCount = rows.filter((r) => r.source === "ai").length;

  const handleConfirm = () => {
    const updates: Record<string, { value: string; isHighlight?: boolean }> = {};
    for (const r of rows) {
      if (selected.has(r.specificationId)) {
        updates[r.specificationId] = { value: r.newValue, isHighlight: r.isHighlight };
      }
    }
    onConfirm(updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-primary-dark/50 backdrop-blur-sm">
      <div className="bg-neutral-light rounded-2xl border border-neutral shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
              <Merge size={15} className="text-accent" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-primary">Xem trước & xác nhận</p>
              <p className="text-[11px] text-neutral-dark truncate max-w-[240px]">{productName}</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-dark hover:text-primary hover:bg-neutral-light-active cursor-pointer">
            <X size={14} />
          </button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-2.5 bg-neutral-light-active border-b border-neutral shrink-0">
          {importCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700">
              <FileSpreadsheet size={10} />
              {importCount} từ file
            </div>
          )}
          {aiCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-accent/8 border border-accent/20 text-accent">
              <Wand2 size={10} />
              {aiCount} từ AI
            </div>
          )}
          {newCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
              <Check size={10} />
              {newCount} điền mới
            </div>
          )}
          {overwriteCount > 0 && (
            <div className="flex items-center gap-1.5 text-[10px] px-2 py-1 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
              <AlertCircle size={10} />
              {overwriteCount} ghi đè
            </div>
          )}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[11px] text-neutral-dark">
              {selected.size}/{rows.length}
            </span>
            <button type="button" onClick={() => toggleAll(selected.size < rows.length)} className="text-[10px] font-medium text-accent hover:underline cursor-pointer">
              {selected.size < rows.length ? "Chọn tất cả" : "Bỏ hết"}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3 space-y-4">
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <p className="text-[10px] font-bold text-neutral-dark uppercase tracking-wider mb-2 flex items-center gap-2">
                {group}
                <span className="h-px flex-1 bg-neutral" />
              </p>
              <div className="space-y-1.5">
                {items.map((row) => {
                  const isSel = selected.has(row.specificationId);
                  return (
                    <label
                      key={row.specificationId}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                        ${isSel ? (row.isOverwrite ? "border-yellow-200 bg-yellow-50/40" : "border-emerald-200 bg-emerald-50/40") : "border-neutral bg-neutral-light-active/40 opacity-55"}`}
                    >
                      <input type="checkbox" checked={isSel} onChange={() => toggle(row.specificationId)} className="mt-0.5 w-3.5 h-3.5 accent-accent cursor-pointer shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[12px] font-semibold text-primary">{row.name}</span>
                          {row.unit && <span className="text-[10px] text-neutral-dark">({row.unit})</span>}
                          {/* Source badge */}
                          {row.source === "import" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-medium">file</span>}
                          {row.source === "ai" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-accent/10 border border-accent/20 text-accent font-medium">AI</span>}
                          {row.source === "both" && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-600 font-medium">file+AI</span>}
                          {row.isOverwrite && <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-yellow-100 border border-yellow-200 text-yellow-700 font-medium">ghi đè</span>}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {row.isOverwrite && (
                            <>
                              <span className="text-[11px] text-neutral-dark line-through">{row.currentValue}</span>
                              <ArrowRight size={10} className="text-neutral-dark shrink-0" />
                            </>
                          )}
                          <span className={`text-[12px] font-medium ${isSel ? "text-primary" : "text-neutral-dark"}`}>{row.newValue}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 px-5 py-4 border-t border-neutral shrink-0">
          <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={selected.size === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 rounded-xl text-[13px] font-semibold text-white cursor-pointer"
          >
            <Check size={13} />
            Áp dụng {selected.size} thông số
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────

export function SpecImportPanel({ productName, categoryId, specGroups, specs, onApply }: SpecImportPanelProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"import" | "ai">("import");

  // Import state
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // AI state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string | null> | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Merge preview
  const [mergeRows, setMergeRows] = useState<MergedPreviewRow[] | null>(null);

  // Spec lookup map
  const specMap = Object.fromEntries(specGroups.flatMap((g) => g.items.map((item) => [item.id, item])));

  // Current values lookup
  const currentValueMap = Object.fromEntries(specs.map((s) => [s.specificationId, s.value]));

  // ─── Download template ────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const blob = await apiRequest.get<Blob>(`/ai-content/spec-template`, {
        params: { categoryId },
        responseType: "blob",
      });

      // 🧠 Detect nếu backend trả JSON lỗi thay vì file
      const contentType = blob.type;

      if (contentType.includes("application/json")) {
        const text = await blob.text();
        const json = JSON.parse(text);
        throw new Error(json.message || "Download failed");
      }

      // 📄 Lấy filename từ header nếu backend có gửi
      let fileName = "spec-template.xlsx";

      // ⚠️ fetch wrapper của bạn chưa expose headers
      // nếu muốn lấy header → cần sửa apiRequest (optional)
      // tạm thời dùng default name

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a); // tránh bug Safari
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (e: any) {
      console.error("Download failed:", e);
      alert(e.message || "Không tải được file");
    }
  };
  // ─── Handle file upload ───────────────────────────────────
  const handleFile = useCallback(
    async (file: File) => {
      setImporting(true);
      setImportError(null);
      setImportResult(null);

      const fd = new FormData();
      fd.append("file", file);
      fd.append("categoryId", categoryId);

      try {
        // KHÔNG truyền Content-Type thủ công khi gửi FormData.
        // Browser tự set "multipart/form-data; boundary=xxxxx" — nếu override
        // thủ công sẽ mất boundary → busboy crash "Boundary not found".
        const res = await apiRequest.post<{ data: ImportResult }>("/ai-content/import-specifications", fd);
        const result = (res as any)?.data as ImportResult;
        setImportResult(result);
      } catch (e: any) {
        setImportError(e?.message ?? "Không thể đọc file. Vui lòng kiểm tra format.");
      } finally {
        setImporting(false);
      }
    },
    [categoryId],
  );

  // ─── Handle AI suggest ────────────────────────────────────
  const handleAiSuggest = useCallback(async () => {
    if (!productName.trim()) return;
    setAiLoading(true);
    setAiError(null);
    setAiSuggestions(null);

    const allItems = specGroups.flatMap((g) => g.items);

    try {
      const res = await apiRequest.post<any>(
        "/ai-content/suggest-specifications",
        {
          productName: productName.trim(),
          categoryId,
          specifications: allItems.map((item) => ({
            specificationId: item.id,
            name: item.name,
            group: item.group,
            unit: item.unit,
          })),
          onlyEmpty: true,
        },
        { timeout: 60_000 },
      );
      setAiSuggestions((res as any)?.data?.suggestions ?? {});
    } catch (e: any) {
      setAiError(e?.message ?? "Không thể gợi ý thông số");
    } finally {
      setAiLoading(false);
    }
  }, [productName, categoryId, specGroups]);

  // ─── Build merge rows & open preview ─────────────────────
  const buildMergeRows = useCallback(
    (importRows: ParsedSpecRow[] | null, aiRows: Record<string, string | null> | null) => {
      const allIds = new Set<string>([...(importRows ?? []).map((r) => r.spec_id), ...Object.keys(aiRows ?? {}).filter((k) => aiRows?.[k])]);

      const rows: MergedPreviewRow[] = [];

      for (const id of allIds) {
        const specInfo = specMap[id];
        if (!specInfo) continue;

        const importRow = importRows?.find((r) => r.spec_id === id);
        const aiValue = aiRows?.[id] ?? null;
        const currentValue = currentValueMap[id] ?? "";

        // Import takes priority over AI
        const finalValue = importRow?.value ?? aiValue ?? "";
        if (!finalValue) continue;

        const source: MergedPreviewRow["source"] = importRow && aiValue ? "both" : importRow ? "import" : "ai";

        rows.push({
          specificationId: id,
          name: specInfo.name,
          group: specInfo.group,
          unit: specInfo.unit ?? undefined,
          newValue: finalValue,
          currentValue,
          isHighlight: importRow?.is_highlight ?? false,
          isOverwrite: !!currentValue,
          source,
        });
      }

      // Sort by group then name
      rows.sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
      return rows;
    },
    [specMap, currentValueMap],
  );

  const openMergePreview = useCallback(() => {
    const importRows = importResult?.validRows ?? null;
    const rows = buildMergeRows(importRows, aiSuggestions);
    if (rows.length === 0) return;
    setMergeRows(rows);
  }, [importResult, aiSuggestions, buildMergeRows]);

  const handleConfirmApply = (updates: Record<string, { value: string; isHighlight?: boolean }>) => {
    onApply(updates);
    setMergeRows(null);
    setImportResult(null);
    setAiSuggestions(null);
    setOpen(false);
  };

  const hasData = !!(importResult?.validRows?.length || aiSuggestions);
  const mergeCount = hasData ? buildMergeRows(importResult?.validRows ?? null, aiSuggestions).length : 0;

  return (
    <>
      <div className="rounded-2xl border border-neutral bg-neutral-light overflow-hidden">
        {/* Header toggle */}
        <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-light-active transition-colors cursor-pointer">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-light-active flex items-center justify-center">
              <Upload size={13} className="text-neutral-dark" />
            </div>
            <div className="text-left">
              <p className="text-[13px] font-semibold text-primary">Import thông số</p>
              <p className="text-[10px] text-neutral-dark">File XLSX/CSV · AI gợi ý · Kết hợp cả hai</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasData && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/15 text-accent">{mergeCount} gợi ý sẵn sàng</span>}
            {open ? <ChevronUp size={15} className="text-neutral-dark" /> : <ChevronDown size={15} className="text-neutral-dark" />}
          </div>
        </button>

        {open && (
          <div className="border-t border-neutral">
            {/* Tabs */}
            <div className="flex border-b border-neutral">
              {(
                [
                  ["import", "📁 Import file"],
                  ["ai", "✨ AI gợi ý"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`flex-1 py-2.5 text-[12px] font-medium transition-colors cursor-pointer
                    ${tab === id ? "text-accent border-b-2 border-accent bg-accent/5" : "text-neutral-dark hover:text-primary"}`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {/* ─── IMPORT TAB ─── */}
              {tab === "import" && (
                <>
                  {/* Download template button */}
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-dashed border-accent/40 bg-accent/3 hover:bg-accent/8 text-[12px] font-medium text-accent cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Download size={13} />
                      Tải file template (.xlsx) — đã có sẵn spec_id
                    </div>
                    <span className="text-[10px] text-neutral-dark font-normal">Khuyên dùng</span>
                  </button>

                  <FileDropZone onFile={handleFile} loading={importing} />

                  {importError && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-600">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      {importError}
                    </div>
                  )}

                  {importResult && (
                    <div className="space-y-2">
                      {/* Parse result summary */}
                      <div className={`px-4 py-3 rounded-xl border ${importResult.validRows.length > 0 ? "border-emerald-200 bg-emerald-50" : "border-yellow-200 bg-yellow-50"}`}>
                        <div className="flex items-center justify-between">
                          <p className="text-[12px] font-semibold text-primary">Kết quả phân tích</p>
                          <span className={`text-[11px] font-semibold ${importResult.validRows.length > 0 ? "text-emerald-700" : "text-yellow-700"}`}>
                            {importResult.validRows.length}/{importResult.parsed.totalRows} dòng hợp lệ
                          </span>
                        </div>
                        <div className="flex gap-3 mt-1.5 flex-wrap">
                          <span className="text-[10px] text-neutral-dark">✅ {importResult.validRows.length} hợp lệ</span>
                          {importResult.parsed.skippedCount > 0 && <span className="text-[10px] text-yellow-600">⏭️ {importResult.parsed.skippedCount} bỏ qua</span>}
                          {importResult.invalidSpecIds.length > 0 && <span className="text-[10px] text-red-500">❌ {importResult.invalidSpecIds.length} spec_id không khớp danh mục</span>}
                        </div>
                      </div>

                      {/* Errors from parse */}
                      {importResult.parsed.errors.length > 0 && (
                        <div className="space-y-1">
                          {importResult.parsed.errors.map((e, i) => (
                            <div key={i} className="flex items-start gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 border border-yellow-200 text-[11px] text-yellow-700">
                              <FileWarning size={11} className="mt-0.5 shrink-0" />
                              {e}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* ─── AI TAB ─── */}
              {tab === "ai" && (
                <>
                  {!productName.trim() ? (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200 text-[12px] text-yellow-700">
                      <Info size={13} className="shrink-0" />
                      Nhập tên sản phẩm vào form để AI gợi ý thông số
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-accent/5 border border-accent/20 text-[12px] text-accent">
                      <Wand2 size={13} className="shrink-0" />
                      AI sẽ phân tích: <strong className="ml-1">"{productName.trim().slice(0, 50)}"</strong>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleAiSuggest}
                    disabled={aiLoading || !productName.trim()}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-[13px] font-semibold text-white cursor-pointer transition-colors"
                  >
                    {aiLoading ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Đang phân tích (~15s)...
                      </>
                    ) : (
                      <>
                        <Wand2 size={13} />
                        {aiSuggestions ? "Gợi ý lại" : "AI gợi ý thông số"}
                      </>
                    )}
                  </button>

                  {aiError && (
                    <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-600">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" />
                      {aiError}
                    </div>
                  )}

                  {aiSuggestions &&
                    (() => {
                      const filled = Object.values(aiSuggestions).filter(Boolean).length;
                      return (
                        <div className="px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50">
                          <p className="text-[12px] font-semibold text-emerald-800">AI gợi ý được {filled} thông số</p>
                          <p className="text-[10px] text-emerald-700 mt-0.5">Nhấn "Xem & Áp dụng" bên dưới để xem chi tiết và chọn lọc</p>
                        </div>
                      );
                    })()}
                </>
              )}

              {/* ─── APPLY BUTTON (bottom, always visible when has data) ─── */}
              {hasData && (
                <div className="pt-1 border-t border-neutral">
                  <button
                    type="button"
                    onClick={openMergePreview}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary hover:bg-primary-hover rounded-xl text-[13px] font-semibold text-neutral-light cursor-pointer transition-colors"
                  >
                    <Merge size={13} />
                    Xem & Áp dụng ({mergeCount} thông số)
                  </button>
                  <p className="text-[10px] text-neutral-dark text-center mt-1.5">
                    {importResult?.validRows?.length ? `${importResult.validRows.length} từ file` : ""}
                    {importResult?.validRows?.length && aiSuggestions ? " · " : ""}
                    {aiSuggestions ? `${Object.values(aiSuggestions).filter(Boolean).length} từ AI` : ""}
                    {" · File được ưu tiên nếu trùng"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Merge Preview Modal */}
      {mergeRows && mergeRows.length > 0 && <MergePreviewModal rows={mergeRows} productName={productName} onConfirm={handleConfirmApply} onCancel={() => setMergeRows(null)} />}
    </>
  );
}
