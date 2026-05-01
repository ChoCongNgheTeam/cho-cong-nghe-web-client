"use client";

import { useState, useRef } from "react";
import { Plus, X, Search, Check, ImageIcon, ChevronUp, ChevronDown, Trash2 } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

export interface DraftCampaignCategory {
  categoryId: string;
  position: number;
  title?: string;
  description?: string;
  image?: File;
  previewUrl?: string; // blob URL tạm, chỉ dùng để preview
  // enriched từ CategoryOption để hiển thị
  categoryName: string;
  categoryImageUrl?: string;
}

interface CampaignCategoryDraftProps {
  availableCategories: CategoryOption[];
  value: DraftCampaignCategory[];
  onChange: (next: DraftCampaignCategory[]) => void;
}

// ── helpers ───────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark/40 focus:outline-none focus:border-accent transition-colors";

// ── AddPanel: chọn category + ảnh trước khi thêm vào draft list ──────────────

function AddPanel({ available, nextPosition, onAdd, onClose }: { available: CategoryOption[]; nextPosition: number; onAdd: (items: DraftCampaignCategory[]) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [imageMeta, setImageMeta] = useState<Record<string, { file: File; previewUrl: string }>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = available.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setImageMeta((m) => {
          const copy = { ...m };
          if (copy[id]?.previewUrl) URL.revokeObjectURL(copy[id].previewUrl);
          delete copy[id];
          return copy;
        });
      } else {
        next.add(id);
      }
      return next;
    });

  const handlePickImage = (catId: string, file: File) => {
    setImageMeta((m) => {
      if (m[catId]?.previewUrl) URL.revokeObjectURL(m[catId].previewUrl);
      return { ...m, [catId]: { file, previewUrl: URL.createObjectURL(file) } };
    });
  };

  const handleClearImage = (catId: string) => {
    setImageMeta((m) => {
      if (m[catId]?.previewUrl) URL.revokeObjectURL(m[catId].previewUrl);
      const copy = { ...m };
      delete copy[catId];
      return copy;
    });
  };

  const handleConfirm = () => {
    if (selected.size === 0) return;
    const items: DraftCampaignCategory[] = Array.from(selected).map((categoryId, i) => {
      const cat = available.find((c) => c.id === categoryId)!;
      const meta = imageMeta[categoryId];
      return {
        categoryId,
        position: nextPosition + i,
        image: meta?.file,
        previewUrl: meta?.previewUrl,
        categoryName: cat.name,
        categoryImageUrl: cat.imageUrl,
      };
    });
    onAdd(items);
    onClose();
  };

  return (
    <div className="border border-accent/30 rounded-xl bg-accent/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral/60">
        <p className="text-[13px] font-semibold text-primary">Chọn danh mục</p>
        <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark hover:bg-neutral">
          <X size={13} />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {/* search */}
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark/50" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm danh mục..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark/40 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* list */}
        <div className="max-h-64 overflow-y-auto space-y-1 pr-0.5">
          {filtered.length === 0 ? (
            <p className="text-[12px] text-neutral-dark/50 text-center py-4">{available.length === 0 ? "Không còn danh mục nào để thêm" : "Không tìm thấy danh mục"}</p>
          ) : (
            filtered.map((cat) => {
              const checked = selected.has(cat.id);
              const meta = imageMeta[cat.id];
              return (
                <div key={cat.id} className={`rounded-lg border transition-colors ${checked ? "bg-accent/10 border-accent/30" : "border-transparent hover:bg-neutral"}`}>
                  <button onClick={() => toggle(cat.id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-accent border-accent" : "border-neutral-dark/30"}`}>
                      {checked && <Check size={10} className="text-white" />}
                    </div>
                    {cat.imageUrl && <img src={cat.imageUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0" />}
                    <span className="text-[13px] text-primary truncate flex-1">{cat.name}</span>
                  </button>

                  {/* Upload ảnh campaign_category — chỉ hiện khi checked */}
                  {checked && (
                    <div className="flex items-center gap-2 px-2.5 pb-2.5">
                      <div
                        className="w-10 h-10 rounded-lg border border-dashed border-neutral bg-neutral-light overflow-hidden flex items-center justify-center cursor-pointer shrink-0 hover:border-accent/50 transition-colors"
                        onClick={() => fileRefs.current[cat.id]?.click()}
                      >
                        {meta?.previewUrl ? <img src={meta.previewUrl} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-neutral-dark/40" />}
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-[10px] text-neutral-dark/60">Ảnh chiến dịch (tuỳ chọn)</p>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => fileRefs.current[cat.id]?.click()}
                            className="px-2 py-0.5 rounded border border-neutral text-[10px] text-primary hover:bg-neutral-light-active transition-colors"
                          >
                            {meta?.file ? "Đổi ảnh" : "Chọn ảnh"}
                          </button>
                          {meta?.file && (
                            <button
                              onClick={() => handleClearImage(cat.id)}
                              className="px-2 py-0.5 rounded border border-promotion/30 text-[10px] text-promotion hover:bg-promotion-light transition-colors"
                            >
                              Bỏ
                            </button>
                          )}
                        </div>
                      </div>
                      <input
                        ref={(el) => {
                          fileRefs.current[cat.id] = el;
                        }}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handlePickImage(cat.id, file);
                          e.target.value = "";
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* footer */}
        {selected.size > 0 && (
          <div className="flex items-center justify-between pt-1 border-t border-neutral/60">
            <span className="text-[12px] text-neutral-dark">
              Đã chọn <strong className="text-primary">{selected.size}</strong> danh mục
            </span>
            <button onClick={handleConfirm} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent/90 transition-colors">
              <Plus size={12} />
              Thêm {selected.size} danh mục
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── DraftRow: hiển thị 1 category đã chọn trong draft list ───────────────────

function DraftRow({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
  onChangeImage,
  onChangeTitle,
  onChangeDescription,
}: {
  item: DraftCampaignCategory;
  index: number;
  total: number;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onChangeImage: (file: File | undefined) => void;
  onChangeTitle: (v: string) => void;
  onChangeDescription: (v: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Ảnh hiển thị: preview upload mới > ảnh category gốc (chỉ để tham chiếu)
  const displayImage = item.previewUrl;

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all duration-200 ${
        expanded ? "border-accent/40 bg-accent/[0.02] shadow-sm" : "border-neutral hover:border-neutral-dark/30 bg-neutral-light"
      }`}
    >
      {/* header */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="w-5 h-5 rounded-md bg-neutral flex items-center justify-center text-[10px] font-bold text-neutral-dark shrink-0">{index + 1}</span>

        {/* thumbnail — ưu tiên ảnh campaign_category, không fallback sang category */}
        <div className="w-8 h-8 rounded-lg border border-neutral bg-neutral overflow-hidden shrink-0 flex items-center justify-center">
          {displayImage ? <img src={displayImage} alt="" className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-neutral-dark/40" />}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-primary truncate">{item.categoryName}</p>
          {item.title && <p className="text-[11px] text-neutral-dark truncate">{item.title}</p>}
          {!item.previewUrl && <p className="text-[10px] text-neutral-dark/40 italic">Chưa có ảnh chiến dịch</p>}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark/50 hover:bg-neutral hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark/50 hover:bg-neutral hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronDown size={13} />
          </button>
          <button onClick={() => setExpanded((v) => !v)} className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark hover:bg-neutral transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
          <button onClick={onRemove} className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark/50 hover:bg-promotion-light hover:text-promotion transition-colors">
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* expanded edit */}
      {expanded && (
        <div className="border-t border-neutral/60 px-4 py-4 space-y-3 bg-neutral/20">
          {/* image upload */}
          <div className="flex items-start gap-3">
            <div
              className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral hover:border-accent/50 overflow-hidden cursor-pointer flex items-center justify-center bg-neutral-light transition-colors shrink-0 relative group"
              onClick={() => fileRef.current?.click()}
            >
              {displayImage ? (
                <>
                  <img src={displayImage} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon size={16} className="text-white" />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ImageIcon size={18} className="text-neutral-dark/40" />
                  <span className="text-[10px] text-neutral-dark/40">Tải ảnh</span>
                </div>
              )}
            </div>
            <div className="flex-1 space-y-1.5">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Ảnh banner danh mục</p>
              <p className="text-[11px] text-neutral-dark/60">Ảnh riêng cho danh mục này trong chiến dịch</p>
              <div className="flex gap-2">
                <button onClick={() => fileRef.current?.click()} className="px-2.5 py-1 rounded-lg border border-neutral text-[11px] text-primary hover:bg-neutral-light-active transition-colors">
                  Chọn ảnh
                </button>
                {item.previewUrl && (
                  <button
                    onClick={() => {
                      if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
                      onChangeImage(undefined);
                    }}
                    className="px-2.5 py-1 rounded-lg border border-promotion/30 text-[11px] text-promotion hover:bg-promotion-light transition-colors"
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onChangeImage(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Tiêu đề tùy chỉnh</label>
            <input type="text" value={item.title ?? ""} onChange={(e) => onChangeTitle(e.target.value)} placeholder={item.categoryName} className={inputCls} />
          </div>

          {/* description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Mô tả</label>
            <textarea
              value={item.description ?? ""}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Mô tả ngắn về danh mục trong chiến dịch này..."
              rows={2}
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export function CampaignCategoryDraft({ availableCategories, value, onChange }: CampaignCategoryDraftProps) {
  const [showAdd, setShowAdd] = useState(false);

  const addedIds = new Set(value.map((v) => v.categoryId));
  const available = availableCategories.filter((c) => !addedIds.has(c.id));

  const handleAdd = (items: DraftCampaignCategory[]) => {
    onChange([...value, ...items]);
  };

  const handleRemove = (index: number) => {
    const next = [...value];
    const removed = next.splice(index, 1)[0];
    if (removed.previewUrl) URL.revokeObjectURL(removed.previewUrl);
    onChange(next.map((c, i) => ({ ...c, position: i })));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...value];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    onChange(next.map((c, i) => ({ ...c, position: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === value.length - 1) return;
    const next = [...value];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    onChange(next.map((c, i) => ({ ...c, position: i })));
  };

  const handleChangeImage = (index: number, file: File | undefined) => {
    const next = [...value];
    const item = { ...next[index] };
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    item.image = file;
    item.previewUrl = file ? URL.createObjectURL(file) : undefined;
    next[index] = item;
    onChange(next);
  };

  const handleChangeTitle = (index: number, title: string) => {
    const next = [...value];
    next[index] = { ...next[index], title: title || undefined };
    onChange(next);
  };

  const handleChangeDescription = (index: number, description: string) => {
    const next = [...value];
    next[index] = { ...next[index], description: description || undefined };
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh mục ({value.length})</p>
        {available.length > 0 && (
          <button
            onClick={() => setShowAdd((v) => !v)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
              showAdd ? "bg-accent/10 text-accent border border-accent/30" : "border border-neutral text-primary hover:bg-neutral-light-active"
            }`}
          >
            {showAdd ? <X size={11} /> : <Plus size={11} />}
            {showAdd ? "Đóng" : "Thêm danh mục"}
          </button>
        )}
      </div>

      {showAdd && <AddPanel available={available} nextPosition={value.length} onAdd={handleAdd} onClose={() => setShowAdd(false)} />}

      {value.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 border border-dashed border-neutral rounded-xl text-center gap-2">
          <ImageIcon size={20} className="text-neutral-dark/30" />
          <p className="text-[12px] text-neutral-dark/50">Chưa chọn danh mục nào</p>
          <p className="text-[11px] text-neutral-dark/40">Có thể thêm sau khi tạo chiến dịch</p>
        </div>
      ) : (
        <div className="space-y-2">
          {value.map((item, index) => (
            <DraftRow
              key={item.categoryId}
              item={item}
              index={index}
              total={value.length}
              onRemove={() => handleRemove(index)}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onChangeImage={(file) => handleChangeImage(index, file)}
              onChangeTitle={(v) => handleChangeTitle(index, v)}
              onChangeDescription={(v) => handleChangeDescription(index, v)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
