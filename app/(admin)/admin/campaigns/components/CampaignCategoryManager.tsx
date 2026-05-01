"use client";

import { useState, useRef, useCallback } from "react";
import { Plus, Trash2, GripVertical, ImageIcon, X, Loader2, ChevronDown, ChevronUp, Check, AlertCircle, Search } from "lucide-react";
import { addCampaignCategories, removeCampaignCategory, updateCampaignCategory, reorderCampaignCategories } from "../_libs/campaigns";
import type { CampaignCategory } from "../campaign.types";
import { useToasty } from "@/components/Toast";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string;
}

interface CampaignCategoryManagerProps {
  campaignId: string;
  categories: CampaignCategory[];
  availableCategories: CategoryOption[]; // danh mục có thể thêm (chưa có trong campaign)
  onChanged: (updated: CampaignCategory[]) => void;
}

// ── Inline edit row ───────────────────────────────────────────────────────────

interface EditState {
  title: string;
  description: string;
  position: number;
}

function CategoryRow({
  cc,
  campaignId,
  index,
  total,
  onRemove,
  onUpdated,
  onMoveUp,
  onMoveDown,
}: {
  cc: CampaignCategory;
  campaignId: string;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onUpdated: (updated: Partial<CampaignCategory> & { id: string }) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { success, error: toastError } = useToasty();
  const fileRef = useRef<HTMLInputElement>(null);

  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const [edit, setEdit] = useState<EditState>({
    title: cc.title ?? "",
    description: cc.description ?? "",
    position: cc.position,
  });

  const isDirty = edit.title !== (cc.title ?? "") || edit.description !== (cc.description ?? "") || edit.position !== cc.position;

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateCampaignCategory(campaignId, cc.categoryId, {
        title: edit.title || undefined,
        description: edit.description || undefined,
        position: edit.position,
      });
      onUpdated({ id: cc.id, ...edit });
      success("Đã lưu thay đổi");
      setExpanded(false);
    } catch (e: any) {
      toastError(e?.message ?? "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = async (file: File) => {
    setUploadingImg(true);
    try {
      const res = await updateCampaignCategory(campaignId, cc.categoryId, {
        image: file,
      });
      // Dùng URL thật từ BE trả về, không dùng blob tạm
      onUpdated({
        id: cc.id,
        imageUrl: res.data?.imageUrl ?? undefined,
        imagePath: res.data?.imagePath ?? undefined,
      });
      success("Đã cập nhật ảnh");
    } catch (e: any) {
      toastError(e?.message ?? "Không thể tải ảnh");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemoveImage = async () => {
    setUploadingImg(true);
    try {
      await updateCampaignCategory(campaignId, cc.categoryId, {
        removeImage: true,
      });
      onUpdated({ id: cc.id, imageUrl: undefined, imagePath: "" });
      success("Đã xóa ảnh");
    } catch (e: any) {
      toastError(e?.message ?? "Không thể xóa ảnh");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleRemove = async () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }
    setRemoving(true);
    try {
      await removeCampaignCategory(campaignId, cc.categoryId);
      onRemove(cc.id);
      success(`Đã xóa "${cc.category?.name ?? "danh mục"}" khỏi chiến dịch`);
    } catch (e: any) {
      toastError(e?.message ?? "Không thể xóa danh mục");
    } finally {
      setRemoving(false);
      setConfirmRemove(false);
    }
  };

  // Chỉ lấy ảnh của campaign_categories — KHÔNG fallback sang ảnh category gốc
  const imageUrl = cc.imageUrl || undefined;

  return (
    <div
      className={`border rounded-xl transition-all duration-200 overflow-hidden ${
        expanded ? "border-accent/40 bg-accent/[0.02] shadow-sm" : "border-neutral hover:border-neutral-dark/30 bg-neutral-light"
      }`}
    >
      {/* ── Header row ── */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* drag handle (visual only) */}
        <span className="text-neutral-dark/30 cursor-grab shrink-0">
          <GripVertical size={14} />
        </span>

        {/* position badge */}
        <span className="w-5 h-5 rounded-md bg-neutral flex items-center justify-center text-[10px] font-bold text-neutral-dark shrink-0">{cc.position + 1}</span>

        {/* thumbnail */}
        <div className="w-8 h-8 rounded-lg border border-neutral bg-neutral overflow-hidden shrink-0 flex items-center justify-center">
          {imageUrl ? <img src={imageUrl} alt={cc.category?.name ?? ""} className="w-full h-full object-cover" /> : <ImageIcon size={14} className="text-neutral-dark/40" />}
        </div>

        {/* name */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-primary truncate">{cc.category?.name ?? cc.categoryId}</p>
          {cc.title && <p className="text-[11px] text-neutral-dark truncate">{cc.title}</p>}
        </div>

        {/* actions */}
        <div className="flex items-center gap-1 shrink-0">
          {/* move up/down */}
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark/50 hover:bg-neutral hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Lên"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark/50 hover:bg-neutral hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
            title="Xuống"
          >
            <ChevronDown size={13} />
          </button>

          {/* expand toggle */}
          <button onClick={() => setExpanded((v) => !v)} className="w-6 h-6 flex items-center justify-center rounded text-neutral-dark hover:bg-neutral transition-colors">
            {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>

          {/* remove */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              confirmRemove ? "bg-promotion text-white" : "text-neutral-dark/50 hover:bg-promotion-light hover:text-promotion"
            }`}
            title={confirmRemove ? "Nhấn lại để xác nhận" : "Xóa"}
          >
            {removing ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
          </button>
        </div>
      </div>

      {/* ── Expanded edit area ── */}
      {expanded && (
        <div className="border-t border-neutral/60 px-4 py-4 space-y-3 bg-neutral/20">
          {/* image section */}
          <div className="flex items-start gap-3">
            <div
              className="w-20 h-20 rounded-xl border-2 border-dashed border-neutral hover:border-accent/50 overflow-hidden cursor-pointer flex items-center justify-center bg-neutral-light transition-colors shrink-0 relative group"
              onClick={() => !uploadingImg && fileRef.current?.click()}
            >
              {uploadingImg ? (
                <Loader2 size={18} className="animate-spin text-accent" />
              ) : imageUrl ? (
                <>
                  <img src={imageUrl} alt="" className="w-full h-full object-cover" />
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
              <p className="text-[11px] text-neutral-dark/60">Ảnh hiển thị cho danh mục này trong chiến dịch</p>
              <div className="flex gap-2">
                <button
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingImg}
                  className="px-2.5 py-1 rounded-lg border border-neutral text-[11px] text-primary hover:bg-neutral-light-active disabled:opacity-50 transition-colors"
                >
                  Chọn ảnh
                </button>
                {imageUrl && (
                  <button
                    onClick={handleRemoveImage}
                    disabled={uploadingImg}
                    className="px-2.5 py-1 rounded-lg border border-promotion/30 text-[11px] text-promotion hover:bg-promotion-light disabled:opacity-50 transition-colors"
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
                if (file) handleImageChange(file);
                e.target.value = "";
              }}
            />
          </div>

          {/* title */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Tiêu đề tùy chỉnh</label>
            <input
              type="text"
              value={edit.title}
              onChange={(e) => setEdit((p) => ({ ...p, title: e.target.value }))}
              placeholder={cc.category?.name ?? ""}
              className="w-full px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark/40 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* description */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Mô tả</label>
            <textarea
              value={edit.description}
              onChange={(e) => setEdit((p) => ({ ...p, description: e.target.value }))}
              placeholder="Mô tả ngắn về danh mục trong chiến dịch này..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark/40 focus:outline-none focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* position */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider">Vị trí (position)</label>
            <input
              type="number"
              min={0}
              value={edit.position}
              onChange={(e) =>
                setEdit((p) => ({
                  ...p,
                  position: parseInt(e.target.value) || 0,
                }))
              }
              className="w-24 px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* save / cancel */}
          {isDirty && (
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent/90 disabled:opacity-60 transition-colors"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
              <button
                onClick={() => {
                  setEdit({
                    title: cc.title ?? "",
                    description: cc.description ?? "",
                    position: cc.position,
                  });
                }}
                className="px-3 py-1.5 rounded-lg border border-neutral text-[12px] text-primary hover:bg-neutral-light-active transition-colors"
              >
                Đặt lại
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Add categories panel ──────────────────────────────────────────────────────

interface SelectedCategoryMeta {
  image?: File;
  previewUrl?: string;
}

function AddCategoriesPanel({
  campaignId,
  available,
  nextPosition,
  onAdded,
  onClose,
}: {
  campaignId: string;
  available: CategoryOption[];
  nextPosition: number;
  onAdded: (added: CampaignCategory[], lookup: Map<string, CategoryOption>) => void;
  onClose: () => void;
}) {
  const { success, error: toastError } = useToasty();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [imageMeta, setImageMeta] = useState<Record<string, SelectedCategoryMeta>>({});
  const [adding, setAdding] = useState(false);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const filtered = available.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // clear image meta khi bỏ chọn
        setImageMeta((m) => {
          const copy = { ...m };
          if (copy[id]?.previewUrl) URL.revokeObjectURL(copy[id].previewUrl!);
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
      if (m[catId]?.previewUrl) URL.revokeObjectURL(m[catId].previewUrl!);
      return { ...m, [catId]: { image: file, previewUrl: URL.createObjectURL(file) } };
    });
  };

  const handleClearImage = (catId: string) => {
    setImageMeta((m) => {
      if (m[catId]?.previewUrl) URL.revokeObjectURL(m[catId].previewUrl!);
      const copy = { ...m };
      delete copy[catId];
      return copy;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setAdding(true);
    try {
      const categories = Array.from(selected).map((categoryId, i) => ({
        categoryId,
        position: nextPosition + i,
        image: imageMeta[categoryId]?.image,
      }));
      const res = await addCampaignCategories(campaignId, categories);
      const lookup = new Map(available.map((c) => [c.id, c]));
      onAdded(res.data, lookup);
      success(`Đã thêm ${selected.size} danh mục vào chiến dịch`);
      Object.values(imageMeta).forEach((m) => {
        if (m.previewUrl) URL.revokeObjectURL(m.previewUrl);
      });
      onClose();
    } catch (e: any) {
      toastError(e?.message ?? "Không thể thêm danh mục");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="border border-accent/30 rounded-xl bg-accent/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral/60">
        <p className="text-[13px] font-semibold text-primary">Thêm danh mục vào chiến dịch</p>
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
            <p className="text-[12px] text-neutral-dark/50 text-center py-4">{available.length === 0 ? "Tất cả danh mục đã có trong chiến dịch" : "Không tìm thấy danh mục"}</p>
          ) : (
            filtered.map((cat) => {
              const checked = selected.has(cat.id);
              const meta = imageMeta[cat.id];
              return (
                <div key={cat.id} className={`rounded-lg border transition-colors ${checked ? "bg-accent/10 border-accent/30" : "border-transparent hover:bg-neutral"}`}>
                  {/* row: checkbox + ảnh category gốc + tên */}
                  <button onClick={() => toggle(cat.id)} className="w-full flex items-center gap-2.5 px-2.5 py-2 text-left">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${checked ? "bg-accent border-accent" : "border-neutral-dark/30"}`}>
                      {checked && <Check size={10} className="text-white" />}
                    </div>
                    {cat.imageUrl && <img src={cat.imageUrl} alt="" className="w-6 h-6 rounded object-cover shrink-0" />}
                    <span className="text-[13px] text-primary truncate flex-1">{cat.name}</span>
                  </button>

                  {/* Upload ảnh riêng cho campaign_category — chỉ hiện khi đã check */}
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
                            {meta?.image ? "Đổi ảnh" : "Chọn ảnh"}
                          </button>
                          {meta?.image && (
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
            <button
              onClick={handleAdd}
              disabled={adding}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent/90 disabled:opacity-60 transition-colors"
            >
              {adding ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
              {adding ? "Đang thêm..." : `Thêm ${selected.size} danh mục`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function CampaignCategoryManager({ campaignId, categories: initialCategories, availableCategories, onChanged }: CampaignCategoryManagerProps) {
  const [categories, setCategories] = useState<CampaignCategory[]>(initialCategories);
  const [showAdd, setShowAdd] = useState(false);

  const update = useCallback(
    (next: CampaignCategory[]) => {
      setCategories(next);
      onChanged(next);
    },
    [onChanged],
  );

  const handleRemove = (id: string) => {
    update(categories.filter((c) => c.id !== id));
  };

  const handleUpdated = (partial: Partial<CampaignCategory> & { id: string }) => {
    update(categories.map((c) => (c.id === partial.id ? { ...c, ...partial } : c)));
  };

  const handleAdded = (added: CampaignCategory[], lookup: Map<string, CategoryOption>) => {
    // Enrich `category` object từ lookup nếu BE không trả về
    // KHÔNG ghi đè imageUrl/imagePath của campaign_categories bằng ảnh category gốc
    const enriched = added.map((item) => {
      const cat = lookup.get(item.categoryId);
      return {
        ...item,
        category: item.category ?? {
          id: item.categoryId,
          name: cat?.name ?? "",
          slug: cat?.slug ?? "",
          imageUrl: cat?.imageUrl ?? undefined,
          imagePath: undefined,
        },
      };
    });
    update([...categories, ...enriched]);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...categories];
    [next[index - 1], next[index]] = [next[index], next[index - 1]];
    // update positions
    update(next.map((c, i) => ({ ...c, position: i })));
  };

  const handleMoveDown = (index: number) => {
    if (index === categories.length - 1) return;
    const next = [...categories];
    [next[index], next[index + 1]] = [next[index + 1], next[index]];
    update(next.map((c, i) => ({ ...c, position: i })));
  };

  // filter available = tất cả categories chưa có trong campaign
  const currentIds = new Set(categories.map((c) => c.categoryId));
  const available = availableCategories.filter((c) => !currentIds.has(c.id));

  const sorted = [...categories].sort((a, b) => a.position - b.position);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-bold text-neutral-dark uppercase tracking-widest">Danh mục trong chiến dịch ({categories.length})</p>
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

      {/* Add panel */}
      {showAdd && <AddCategoriesPanel campaignId={campaignId} available={available} nextPosition={categories.length} onAdded={handleAdded} onClose={() => setShowAdd(false)} />}

      {/* Category list */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 border border-dashed border-neutral rounded-xl text-center gap-2">
          <AlertCircle size={20} className="text-neutral-dark/30" />
          <p className="text-[12px] text-neutral-dark/50">Chưa có danh mục nào trong chiến dịch</p>
          {available.length > 0 && (
            <button
              onClick={() => setShowAdd(true)}
              className="mt-1 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-white text-[12px] font-semibold hover:bg-accent/90 transition-colors"
            >
              <Plus size={12} /> Thêm danh mục đầu tiên
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sorted.map((cc, index) => (
            <CategoryRow
              key={cc.id}
              cc={cc}
              campaignId={campaignId}
              index={index}
              total={sorted.length}
              onRemove={handleRemove}
              onUpdated={handleUpdated}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
