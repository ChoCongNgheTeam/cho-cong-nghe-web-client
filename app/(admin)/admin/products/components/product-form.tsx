"use client";

/**
 * ProductForm — Create & Edit (v2)
 *
 * Cải tiến:
 * 1. CKEditor thay textarea cho mô tả
 * 2. Auto-generate SKU từ tên sản phẩm + attributes (button + bulk)
 * 3. Color images tự đồng bộ màu từ variants — không cần chọn lại màu
 * 4. Edit mode: quản lý ảnh per-image (click để đánh dấu xóa, thêm ảnh mới vào màu đã có)
 * 5. Variant display type selector
 * 6. Attributes đặt lên trên SKU để có context khi auto-generate
 */

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, ImagePlus, Star, ChevronDown, ChevronUp, AlertCircle, Info, Wand2, RefreshCw } from "lucide-react";
import apiRequest from "@/lib/api";
import Select from "react-select";
import { createProduct, updateProduct } from "../_libs/products";
import type { ProductDetail } from "../product.types";
import { CKEditorWrapper } from "@/(admin)/admin/blogs/components/CKEditorWrapper";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface BrandOption {
  id: string;
  name: string;
  slug: string;
}
interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  parentId?: string | null;
}
interface TemplateAttribute {
  id: string;
  code: string;
  name: string;
  isRequired: boolean;
  options: { id: string; value: string; label: string }[];
}
interface TemplateSpecItem {
  id: string;
  key: string;
  name: string;
  groupName: string;
  unit?: string | null;
  icon?: string | null;
  isRequired: boolean;
  isFilterable: boolean;
  sortOrder: number;
}
interface TemplateSpecGroup {
  groupName: string;
  items: TemplateSpecItem[];
}
interface CategoryTemplate {
  attributes: TemplateAttribute[];
  specifications: TemplateSpecGroup[];
}

interface VariantForm {
  _key: string;
  id?: string;
  code: string;
  price: string;
  quantity: string;
  isDefault: boolean;
  isActive: boolean;
  attributes: Record<string, string>; // attributeId → attributeOptionId
}

interface ExistingImage {
  id: string;
  url: string;
  toDelete: boolean;
}

interface ColorImageForm {
  _key: string;
  color: string;
  altText: string;
  files: File[];
  previews: string[];
  existingImages?: ExistingImage[]; // edit mode
}

interface SpecForm {
  specificationId: string;
  value: string;
  isHighlight: boolean;
}
interface SelectOption {
  value: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

function generateSKU(productName: string, attrLabels: string[]): string {
  const normalize = (s: string) =>
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/gi, "d")
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-");
  return [normalize(productName), ...attrLabels.map(normalize)].filter(Boolean).join("-");
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${value ? "bg-accent" : "bg-neutral"}`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? "left-5" : "left-0.5"}`} />
    </button>
  );
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
      {children}
      {required && <span className="text-promotion ml-0.5">*</span>}
    </label>
  );
}

function inputCls(hasError?: boolean) {
  return `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${hasError ? "border-promotion" : "border-neutral"}`;
}

const rsStyles = (hasError?: boolean) => ({
  control: (b: any) => ({
    ...b,
    borderRadius: "0.75rem",
    borderColor: hasError ? "#ef4444" : "#d1d5db",
    boxShadow: "none",
    background: "var(--color-neutral-light,#fafafa)",
    "&:hover": { borderColor: "#9ca3af" },
  }),
  valueContainer: (b: any) => ({ ...b, padding: "0.375rem 0.75rem" }),
  input: (b: any) => ({ ...b, margin: 0, padding: 0 }),
  menu: (b: any) => ({ ...b, borderRadius: "0.75rem", marginTop: 4, boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", zIndex: 9999 }),
  option: (b: any, s: any) => ({ ...b, background: s.isSelected ? "#6366f1" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#111827", fontSize: "13px", padding: "8px 12px" }),
  singleValue: (b: any) => ({ ...b, fontSize: "13px" }),
});

function SectionCard({ title, badge, children, defaultOpen = true }: { title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-neutral-light-active transition-colors cursor-pointer">
        <div className="flex items-center gap-2.5">
          <p className="text-[13px] font-semibold text-primary">{title}</p>
          {badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">{badge}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-neutral-dark" /> : <ChevronDown size={14} className="text-neutral-dark" />}
      </button>
      {open && <div className="px-5 pb-5 pt-1 space-y-4">{children}</div>}
    </div>
  );
}

function buildFormData(payload: Record<string, any>, colorImages: ColorImageForm[]): FormData {
  const fd = new FormData();
  fd.append("data", JSON.stringify(payload));
  for (const ci of colorImages) {
    for (let i = 0; i < ci.files.length; i++) {
      fd.append(`color_${ci.color}_${i}`, ci.files[i]);
    }
  }
  return fd;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface ProductFormProps {
  product?: ProductDetail;
}

export default function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [template, setTemplate] = useState<CategoryTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const [name, setName] = useState(product?.name ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);
  const [variantDisplay, setVariantDisplay] = useState<"SELECTOR" | "CARD">((product as any)?.variantDisplay ?? "SELECTOR");

  const colorOptions = template?.attributes.find((a) => a.code === "color")?.options ?? [];

  const [variants, setVariants] = useState<VariantForm[]>(() => {
    if (product?.variants?.length) {
      return product.variants
        .filter((v) => !v.deletedAt)
        .map((v) => ({
          _key: uid(),
          id: v.id,
          code: v.code ?? "",
          price: String(v.price),
          quantity: String(v.quantity),
          isDefault: v.isDefault,
          isActive: v.isActive,
          attributes: Object.fromEntries(v.variantAttributes.map((va) => [va.attributeOption.attributeId, va.attributeOptionId])),
        }));
    }
    return [{ _key: uid(), code: "", price: "", quantity: "10", isDefault: true, isActive: true, attributes: {} }];
  });

  const [colorImages, setColorImages] = useState<ColorImageForm[]>(() => {
    if (product?.img?.length) {
      const colorMap = new Map<string, ExistingImage[]>();
      for (const img of product.img) {
        if (!colorMap.has(img.color)) colorMap.set(img.color, []);
        if (img.imageUrl) colorMap.get(img.color)!.push({ id: img.id, url: img.imageUrl, toDelete: false });
      }
      return Array.from(colorMap.entries()).map(([color, imgs]) => ({
        _key: uid(),
        color,
        altText: "",
        files: [],
        previews: [],
        existingImages: imgs,
      }));
    }
    return [{ _key: uid(), color: "", altText: "", files: [], previews: [] }];
  });

  const [specs, setSpecs] = useState<SpecForm[]>(() => {
    if (product?.productSpecifications?.length) {
      return product.productSpecifications.map((s) => ({
        specificationId: s.specificationId,
        value: s.value,
        isHighlight: s.isHighlight,
      }));
    }
    return [];
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Load brands + categories ────────────────────────────────────────────────
  useEffect(() => {
    Promise.allSettled([apiRequest.get<any>("/brands/admin/all", { params: { limit: 100 } }), apiRequest.get<any>("/categories/admin/all", { params: { limit: 500 } })])
      .then(([b, c]) => {
        if (b.status === "fulfilled") {
          const d = b.value.data;
          setBrands(Array.isArray(d) ? d : (d?.data ?? []));
        }
        if (c.status === "fulfilled") {
          const d = c.value.data;
          setCategories(Array.isArray(d) ? d : (d?.data ?? []));
        }
      })
      .finally(() => setLoadingOptions(false));
  }, []);

  // ── Load template ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!categoryId) {
      setTemplate(null);
      return;
    }
    setLoadingTemplate(true);
    apiRequest
      .get<any>(`/categories/${categoryId}/template`)
      .then((res) => {
        const t = res.data?.template ?? res.data;
        setTemplate({ attributes: t?.attributes ?? [], specifications: t?.specifications ?? [] });
      })
      .catch(() => setTemplate(null))
      .finally(() => setLoadingTemplate(false));
  }, [categoryId]);

  // ── Auto-check required specs ───────────────────────────────────────────────
  useEffect(() => {
    if (!template) return;
    const required = template.specifications.flatMap((g) => g.items).filter((s) => s.isRequired);
    setSpecs((prev) => {
      const ids = new Set(prev.map((s) => s.specificationId));
      const toAdd = required.filter((s) => !ids.has(s.id)).map((s) => ({ specificationId: s.id, value: "", isHighlight: false }));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [template]);

  // ── Auto-sync color groups từ variants (create mode only) ─────────────────
  const syncColors = useCallback(() => {
    const colorAttr = template?.attributes.find((a) => a.code === "color");
    if (!colorAttr) return;
    const used = new Set<string>();
    for (const v of variants) {
      const opt = colorAttr.options.find((o) => o.id === v.attributes[colorAttr.id]);
      if (opt) used.add(opt.value);
    }
    setColorImages((prev) => {
      const existing = new Set(prev.map((c) => c.color).filter(Boolean));
      const toAdd = [...used].filter((c) => !existing.has(c)).map((c) => ({ _key: uid(), color: c, altText: "", files: [], previews: [] }));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [variants, template]);

  useEffect(() => {
    if (!isEdit) syncColors();
  }, [variants, template, isEdit, syncColors]);

  // ─────────────────────────────────────────────────────────────────────────────
  // HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const addVariant = () => setVariants((p) => [...p, { _key: uid(), code: "", price: "", quantity: "10", isDefault: false, isActive: true, attributes: {} }]);
  const removeVariant = (key: string) => setVariants((p) => p.filter((v) => v._key !== key));
  const setDefault = (key: string) => setVariants((p) => p.map((v) => ({ ...v, isDefault: v._key === key })));
  const updateVariant = (key: string, field: keyof VariantForm, value: any) => setVariants((p) => p.map((v) => (v._key === key ? { ...v, [field]: value } : v)));
  const updateAttr = (vKey: string, attrId: string, optId: string) => setVariants((p) => p.map((v) => (v._key === vKey ? { ...v, attributes: { ...v.attributes, [attrId]: optId } } : v)));

  const autoSKU = (vKey: string) => {
    if (!template || !name.trim()) return;
    const v = variants.find((v) => v._key === vKey);
    if (!v) return;
    const labels = template.attributes
      .filter((a) => a.code !== "color")
      .map((a) => a.options.find((o) => o.id === v.attributes[a.id])?.label ?? "")
      .filter(Boolean);
    const sku = generateSKU(name, labels);
    if (sku) updateVariant(vKey, "code", sku);
  };

  const autoSKUAll = () => {
    if (!template || !name.trim()) return;
    setVariants((p) =>
      p.map((v) => {
        const labels = template.attributes
          .filter((a) => a.code !== "color")
          .map((a) => a.options.find((o) => o.id === v.attributes[a.id])?.label ?? "")
          .filter(Boolean);
        const sku = generateSKU(name, labels);
        return sku ? { ...v, code: sku } : v;
      }),
    );
  };

  const addColor = () => setColorImages((p) => [...p, { _key: uid(), color: "", altText: "", files: [], previews: [] }]);
  const removeColor = (key: string) => {
    colorImages.find((c) => c._key === key)?.previews.forEach((u) => URL.revokeObjectURL(u));
    setColorImages((p) => p.filter((c) => c._key !== key));
  };
  const updateColor = (key: string, field: "color" | "altText", val: string) => setColorImages((p) => p.map((c) => (c._key === key ? { ...c, [field]: val } : c)));

  const handleFiles = (key: string, files: FileList | null) => {
    if (!files) return;
    const newF = Array.from(files);
    const newP = newF.map((f) => URL.createObjectURL(f));
    setColorImages((p) =>
      p.map((c) => {
        if (c._key !== key) return c;
        if (isEdit) return { ...c, files: [...c.files, ...newF], previews: [...c.previews, ...newP] };
        c.previews.forEach((u) => URL.revokeObjectURL(u));
        return { ...c, files: newF, previews: newP };
      }),
    );
  };

  const removeNewFile = (key: string, idx: number) =>
    setColorImages((p) =>
      p.map((c) => {
        if (c._key !== key) return c;
        URL.revokeObjectURL(c.previews[idx]);
        return { ...c, files: c.files.filter((_, i) => i !== idx), previews: c.previews.filter((_, i) => i !== idx) };
      }),
    );

  const toggleDeleteImg = (key: string, imgId: string) =>
    setColorImages((p) =>
      p.map((c) => {
        if (c._key !== key || !c.existingImages) return c;
        return { ...c, existingImages: c.existingImages.map((i) => (i.id === imgId ? { ...i, toDelete: !i.toDelete } : i)) };
      }),
    );

  const toggleSpec = (id: string) =>
    setSpecs((p) => (p.find((s) => s.specificationId === id) ? p.filter((s) => s.specificationId !== id) : [...p, { specificationId: id, value: "", isHighlight: false }]));
  const updateSpec = (id: string, value: string) => setSpecs((p) => p.map((s) => (s.specificationId === id ? { ...s, value } : s)));
  const toggleHighlight = (id: string) => setSpecs((p) => p.map((s) => (s.specificationId === id ? { ...s, isHighlight: !s.isHighlight } : s)));

  // ── Validate + Submit ───────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim() || name.trim().length < 3) errs.name = "Tên sản phẩm phải có ít nhất 3 ký tự";
    if (!brandId) errs.brandId = "Vui lòng chọn thương hiệu";
    if (!categoryId) errs.categoryId = "Vui lòng chọn danh mục";
    const dc = variants.filter((v) => v.isDefault).length;
    if (!variants.length) errs.variants = "Phải có ít nhất 1 biến thể";
    else if (dc !== 1) errs.variants = "Phải có đúng 1 biến thể mặc định";
    variants.forEach((v) => {
      if (!v.code.trim()) errs[`variant_${v._key}_code`] = "SKU không được trống";
      if (!v.price || Number(v.price) <= 0) errs[`variant_${v._key}_price`] = "Giá phải > 0";
    });
    if (!isEdit && !colorImages.some((c) => c.color.trim() && c.files.length > 0)) errs.colorImages = "Phải có ít nhất 1 màu với ảnh";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const variantsPayload = variants.map((v) => ({
        ...(v.id ? { id: v.id } : {}),
        code: v.code.trim(),
        price: Number(v.price),
        quantity: Number(v.quantity) || 0,
        isDefault: v.isDefault,
        isActive: v.isActive,
        variantAttributes: Object.entries(v.attributes)
          .filter(([, o]) => o)
          .map(([, attributeOptionId]) => ({ attributeOptionId })),
      }));

      const colorImagesPayload = colorImages
        .filter((c) => {
          if (!c.color.trim()) return false;
          if (!isEdit) return c.files.length > 0; // create: chỉ màu có file

          // edit: chỉ đưa vào payload nếu có thay đổi thực sự
          const hasNewFiles = c.files.length > 0;
          const hasDeletes = (c.existingImages ?? []).some((i) => i.toDelete);
          return hasNewFiles || hasDeletes;
        })
        .map((c) => ({
          color: c.color.trim(),
          altText: c.altText.trim() || c.color.trim(),
          // Chỉ gửi deleteImageIds nếu edit và có ảnh cần xóa
          ...(isEdit && c.existingImages ? { deleteImageIds: c.existingImages.filter((i) => i.toDelete).map((i) => i.id) } : {}),
        }));

      const specificationsPayload = specs.filter((s) => s.value.trim()).map((s) => ({ specificationId: s.specificationId, value: s.value.trim(), isHighlight: s.isHighlight }));

      const payload = {
        name: name.trim(),
        brandId,
        categoryId,
        description: description.trim() || undefined,
        isActive,
        isFeatured,
        variantDisplay,
        variants: variantsPayload,
        colorImages: colorImagesPayload,
        specifications: specificationsPayload,
      };
      const colorImagesWithFiles = colorImages.filter((c) => c.color.trim() && c.files.length > 0);
      const fd = buildFormData({ ...payload, colorImages: colorImagesPayload }, colorImagesWithFiles);

      if (isEdit && product) {
        await updateProduct(product.id, fd);
        router.push(`/admin/products/${product.id}`);
      } else {
        const res = await createProduct(fd);
        router.push(`/admin/products/${res.data.id}`);
      }
    } catch (e: any) {
      setSubmitError(e?.message ?? "Đã xảy ra lỗi, vui lòng thử lại");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingOptions)
    return (
      <div className="flex items-center justify-center py-20 gap-2">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-[13px] text-neutral-dark">Đang tải dữ liệu...</span>
      </div>
    );

  const filledSpecsCount = specs.filter((s) => s.value.trim()).length;
  const totalSpecsCount = template?.specifications.flatMap((g) => g.items).length ?? 0;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* ── 1. Thông tin cơ bản ── */}
      <SectionCard title="Thông tin cơ bản">
        <div>
          <Label required>Tên sản phẩm</Label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: iPhone 15 Pro Max 256GB" className={inputCls(!!errors.name)} />
          {errors.name && <p className="text-[11px] text-promotion mt-1">{errors.name}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label required>Thương hiệu</Label>
            <Select
              options={brands.map((b) => ({ value: b.id, label: b.name }))}
              value={brandId ? { value: brandId, label: brands.find((b) => b.id === brandId)?.name ?? "" } : null}
              onChange={(o: SelectOption | null) => setBrandId(o?.value ?? "")}
              placeholder="— Chọn thương hiệu —"
              isSearchable
              isClearable
              className="text-[13px]"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Không tìm thấy"}
              styles={rsStyles(!!errors.brandId)}
            />
            {errors.brandId && <p className="text-[11px] text-promotion mt-1">{errors.brandId}</p>}
          </div>
          <div>
            <Label required>Danh mục</Label>
            <Select
              options={categories.map((c) => ({ value: c.id, label: c.parentId ? `  └ ${c.name}` : c.name }))}
              value={
                categoryId
                  ? {
                      value: categoryId,
                      label: categories.find((c) => c.id === categoryId)?.parentId
                        ? `  └ ${categories.find((c) => c.id === categoryId)?.name ?? ""}`
                        : (categories.find((c) => c.id === categoryId)?.name ?? ""),
                    }
                  : null
              }
              onChange={(o: SelectOption | null) => setCategoryId(o?.value ?? "")}
              placeholder="— Chọn danh mục —"
              isSearchable
              isClearable
              className="text-[13px]"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Không tìm thấy"}
              styles={rsStyles(!!errors.categoryId)}
            />
            {errors.categoryId && <p className="text-[11px] text-promotion mt-1">{errors.categoryId}</p>}
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="flex items-center justify-between flex-1 min-w-[130px] px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary">Hiển thị</span>
            <Toggle value={isActive} onChange={setIsActive} />
          </div>
          <div className="flex items-center justify-between flex-1 min-w-[130px] px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary">Nổi bật</span>
            <Toggle value={isFeatured} onChange={setIsFeatured} />
          </div>
          <div className="flex items-center gap-3 flex-1 min-w-[200px] px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary whitespace-nowrap">Kiểu chọn biến thể</span>
            <select
              value={variantDisplay}
              onChange={(e) => setVariantDisplay(e.target.value as "SELECTOR" | "CARD")}
              className="ml-auto text-[12px] border border-neutral rounded-lg px-2 py-1 bg-neutral-light focus:outline-none cursor-pointer"
            >
              <option value="SELECTOR">SELECTOR</option>
              <option value="CARD">CARD</option>
            </select>
          </div>
        </div>

        {/* CKEditor mô tả */}
        <div>
          <Label>Mô tả sản phẩm</Label>
          <CKEditorWrapper value={description} onChange={setDescription} placeholder="Nhập mô tả sản phẩm..." minHeight={300} />
        </div>
      </SectionCard>

      {/* ── 2. Biến thể ── */}
      <SectionCard title="Biến thể" badge={String(variants.length)}>
        {!categoryId && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-light-active border border-neutral text-[12px] text-neutral-dark">
            <Info size={13} className="shrink-0" />
            Chọn danh mục trước để hiển thị đúng thuộc tính cho biến thể.
          </div>
        )}
        {loadingTemplate && (
          <div className="flex items-center gap-2 text-[12px] text-neutral-dark py-2">
            <Loader2 size={13} className="animate-spin" /> Đang tải thuộc tính...
          </div>
        )}
        {errors.variants && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
            <AlertCircle size={13} /> {errors.variants}
          </div>
        )}

        {template && name.trim() && (
          <div className="flex justify-end">
            <button type="button" onClick={autoSKUAll} className="flex items-center gap-1.5 text-[11px] text-accent hover:underline cursor-pointer">
              <Wand2 size={11} /> Auto-generate tất cả SKU
            </button>
          </div>
        )}

        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div key={v._key} className={`border rounded-xl p-4 space-y-3 transition-colors ${v.isDefault ? "border-accent bg-accent/5" : "border-neutral"}`}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-primary">
                  Biến thể #{idx + 1}
                  {v.isDefault && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-accent text-white">default</span>}
                </p>
                <div className="flex items-center gap-2">
                  {!v.isDefault && (
                    <button type="button" onClick={() => setDefault(v._key)} className="text-[11px] text-accent hover:underline cursor-pointer">
                      Đặt default
                    </button>
                  )}
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(v._key)}
                      className="w-7 h-7 rounded-lg border border-neutral text-neutral-dark hover:bg-promotion-light hover:text-promotion flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Attributes — đặt lên trên SKU */}
              {template && template.attributes.length > 0 && (
                <div>
                  <Label>Thuộc tính</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {template.attributes.map((attr) => (
                      <div key={attr.id}>
                        <p className="text-[11px] text-neutral-dark mb-1">
                          {attr.name}
                          {attr.isRequired && <span className="text-promotion ml-0.5">*</span>}
                        </p>
                        <select value={v.attributes[attr.id] ?? ""} onChange={(e) => updateAttr(v._key, attr.id, e.target.value)} className={inputCls() + " cursor-pointer text-[12px]"}>
                          <option value="">— Không chọn —</option>
                          {attr.options.map((opt) => (
                            <option key={opt.id} value={opt.id}>
                              {opt.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label required>SKU</Label>
                    {template && name.trim() && (
                      <button type="button" onClick={() => autoSKU(v._key)} className="text-[10px] text-accent hover:underline flex items-center gap-0.5 cursor-pointer">
                        <Wand2 size={10} /> Tạo tự động
                      </button>
                    )}
                  </div>
                  <input
                    value={v.code}
                    onChange={(e) => updateVariant(v._key, "code", e.target.value.toUpperCase())}
                    placeholder="IPHONE-15-128GB"
                    className={inputCls(!!errors[`variant_${v._key}_code`])}
                  />
                  {errors[`variant_${v._key}_code`] && <p className="text-[11px] text-promotion mt-1">{errors[`variant_${v._key}_code`]}</p>}
                </div>
                <div>
                  <Label required>Giá (VND)</Label>
                  <input
                    type="number"
                    value={v.price}
                    onChange={(e) => updateVariant(v._key, "price", e.target.value)}
                    placeholder="13490000"
                    className={inputCls(!!errors[`variant_${v._key}_price`])}
                  />
                  {errors[`variant_${v._key}_price`] && <p className="text-[11px] text-promotion mt-1">{errors[`variant_${v._key}_price`]}</p>}
                </div>
                <div>
                  <Label>Tồn kho</Label>
                  <input type="number" value={v.quantity} onChange={(e) => updateVariant(v._key, "quantity", e.target.value)} placeholder="10" className={inputCls()} />
                </div>
              </div>

              <div className="flex items-center justify-between px-3 py-2 border border-neutral rounded-xl">
                <span className="text-[12px] text-primary">Kích hoạt</span>
                <Toggle value={v.isActive} onChange={(val) => updateVariant(v._key, "isActive", val)} />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-accent text-accent text-[12px] font-medium hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Thêm biến thể
        </button>
      </SectionCard>

      {/* ── 3. Hình ảnh theo màu ── */}
      <SectionCard title="Hình ảnh theo màu" badge={`${colorImages.length} màu`}>
        {errors.colorImages && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
            <AlertCircle size={13} /> {errors.colorImages}
          </div>
        )}

        {!isEdit && colorOptions.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-accent/5 border border-accent/20 text-[12px] text-accent">
            <RefreshCw size={12} className="shrink-0" />
            Màu sắc tự động thêm khi bạn chọn màu trong biến thể. Chỉ cần upload ảnh.
          </div>
        )}

        <div className="space-y-4">
          {colorImages.map((ci) => {
            const label = colorOptions.find((o) => o.value === ci.color)?.label;
            const activeExisting = ci.existingImages?.filter((i) => !i.toDelete) ?? [];
            const toDeleteCount = ci.existingImages?.filter((i) => i.toDelete).length ?? 0;

            return (
              <div key={ci._key} className="border border-neutral rounded-xl p-4 space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {ci.color && <span className="w-3.5 h-3.5 rounded-full border border-neutral/50 shrink-0" style={{ background: ci.color }} />}
                    <span className="text-[13px] font-medium text-primary">{(label ?? ci.color) || "Chưa chọn màu"}</span>
                    {ci.color && label && <span className="text-[11px] text-neutral-dark">({ci.color})</span>}
                    {toDeleteCount > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-promotion-light text-promotion">-{toDeleteCount} sẽ xóa</span>}
                    {ci.files.length > 0 && <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">+{ci.files.length} mới</span>}
                  </div>
                  {colorImages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeColor(ci._key)}
                      className="w-7 h-7 rounded-lg border border-neutral text-neutral-dark hover:bg-promotion-light hover:text-promotion flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Chọn màu thủ công (chỉ khi chưa có color) */}
                {!ci.color && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label required>Màu sắc</Label>
                      {colorOptions.length > 0 ? (
                        <select value={ci.color} onChange={(e) => updateColor(ci._key, "color", e.target.value)} className={inputCls() + " cursor-pointer"}>
                          <option value="">— Chọn màu —</option>
                          {colorOptions.map((opt) => (
                            <option key={opt.id} value={opt.value}>
                              {opt.label} ({opt.value})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <input
                          value={ci.color}
                          onChange={(e) => updateColor(ci._key, "color", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                          placeholder="white, black, alpine-green"
                          className={inputCls()}
                        />
                      )}
                    </div>
                    <div>
                      <Label>Alt text</Label>
                      <input value={ci.altText} onChange={(e) => updateColor(ci._key, "altText", e.target.value)} placeholder="Mô tả ảnh" className={inputCls()} />
                    </div>
                  </div>
                )}

                {/* Edit: ảnh hiện tại — click để đánh dấu xóa */}
                {isEdit && ci.existingImages && ci.existingImages.length > 0 && (
                  <div>
                    <p className="text-[11px] text-neutral-dark mb-2">
                      Ảnh hiện tại ({activeExisting.length}/{ci.existingImages.length})<span className="ml-1 text-neutral-dark/50">— click ảnh để đánh dấu xóa</span>
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {ci.existingImages.map((img) => (
                        <div
                          key={img.id}
                          onClick={() => toggleDeleteImg(ci._key, img.id)}
                          className={`relative w-16 h-16 rounded-lg overflow-hidden border cursor-pointer transition-all group ${img.toDelete ? "border-promotion opacity-40" : "border-neutral hover:border-promotion/40"}`}
                        >
                          <Image src={img.url} alt="" width={64} height={64} className="object-contain w-full h-full" unoptimized />
                          <div className={`absolute inset-0 flex items-center justify-center transition-all ${img.toDelete ? "bg-promotion/20" : "bg-black/0 group-hover:bg-black/10"}`}>
                            {img.toDelete ? <X size={16} className="text-promotion" /> : <Trash2 size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload ảnh mới */}
                <div>
                  <label className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-neutral rounded-xl text-[12px] text-neutral-dark hover:bg-neutral-light-active hover:border-accent transition-colors cursor-pointer w-full">
                    <ImagePlus size={14} />
                    {isEdit ? "Thêm ảnh mới" : "Chọn ảnh"}
                    {ci.files.length > 0 && <span className="ml-auto text-accent font-medium">{ci.files.length} file</span>}
                    <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(ci._key, e.target.files)} />
                  </label>

                  {ci.previews.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-2">
                      {ci.previews.map((url, i) => (
                        <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-accent/30 bg-neutral-light-active group">
                          <Image src={url} alt="" width={56} height={56} className="object-contain" unoptimized />
                          <button
                            type="button"
                            onClick={() => removeNewFile(ci._key, i)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-black/60 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={9} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={addColor}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-accent text-accent text-[12px] font-medium hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Thêm màu thủ công
        </button>
      </SectionCard>

      {/* ── 4. Thông số kỹ thuật ── */}
      {categoryId && template && template.specifications.length > 0 && (
        <SectionCard title="Thông số kỹ thuật" badge={`${filledSpecsCount} / ${totalSpecsCount}`}>
          {loadingTemplate ? (
            <div className="flex items-center gap-2 text-[12px] text-neutral-dark py-4 justify-center">
              <Loader2 size={13} className="animate-spin" /> Đang tải thông số...
            </div>
          ) : (
            <div className="space-y-6">
              {template.specifications.map((group) => (
                <div key={group.groupName}>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2.5">{group.groupName}</p>
                  <div className="space-y-2">
                    {group.items.map((spec) => {
                      const sel = specs.find((s) => s.specificationId === spec.id);
                      return (
                        <div
                          key={spec.id}
                          className={`border rounded-xl p-3 transition-colors ${sel ? "border-accent/40 bg-accent/5" : "border-neutral"} ${spec.isRequired ? "border-l-[3px] border-l-accent/60" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={!!sel} onChange={() => toggleSpec(spec.id)} disabled={spec.isRequired} className="w-3.5 h-3.5 accent-accent cursor-pointer shrink-0" />
                            <span className="text-[12px] text-primary flex-1">
                              {spec.name}
                              {spec.isRequired && <span className="ml-1.5 text-[10px] text-accent font-medium">(bắt buộc)</span>}
                            </span>
                            {spec.unit && <span className="text-[11px] text-neutral-dark shrink-0">({spec.unit})</span>}
                            {spec.isFilterable && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 shrink-0">filter</span>}
                            {sel && (
                              <button
                                type="button"
                                onClick={() => toggleHighlight(spec.id)}
                                className={`cursor-pointer transition-colors ${sel.isHighlight ? "text-amber-500" : "text-neutral-dark hover:text-amber-400"}`}
                              >
                                <Star size={13} fill={sel.isHighlight ? "currentColor" : "none"} />
                              </button>
                            )}
                          </div>
                          {sel && (
                            <input
                              value={sel.value}
                              onChange={(e) => updateSpec(spec.id, e.target.value)}
                              placeholder={`Nhập giá trị${spec.unit ? ` (${spec.unit})` : ""}`}
                              className={inputCls(!sel.value && spec.isRequired) + " mt-2 text-[12px]"}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      )}

      {!categoryId && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-neutral text-[12px] text-neutral-dark">
          <Info size={14} className="shrink-0" /> Chọn danh mục để hiển thị thông số kỹ thuật phù hợp.
        </div>
      )}

      {submitError && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[13px]">
          <AlertCircle size={15} /> {submitError}
        </div>
      )}

      <div className="flex items-center gap-3 justify-end pb-6">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={submitting}
          className="px-5 py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active transition-colors cursor-pointer disabled:opacity-50"
        >
          Huỷ
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="px-5 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-semibold rounded-xl transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-2"
        >
          {submitting && <Loader2 size={14} className="animate-spin" />}
          {submitting ? (isEdit ? "Đang lưu..." : "Đang tạo...") : isEdit ? "Lưu thay đổi" : "Tạo sản phẩm"}
        </button>
      </div>
    </div>
  );
}
