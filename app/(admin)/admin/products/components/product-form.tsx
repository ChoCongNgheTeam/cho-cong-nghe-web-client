"use client";

/**
 * ProductForm — dùng cho cả Create và Edit.
 *
 * Flow:
 * 1. Load brands + categories (flat list)
 * 2. Khi admin chọn category → gọi GET /categories/:id/template
 *    → lấy đúng attributes + specifications cho category đó
 * 3. Attributes hiển thị trong mỗi variant row
 * 4. Specifications render theo groupName từ template
 *
 * Gửi dữ liệu dạng multipart/form-data:
 *   - field "data": JSON string payload
 *   - file fields: color_<color>_<index>
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Plus, Trash2, Loader2, X, Upload, Star, ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";
import apiRequest from "@/lib/api";
import Select from "react-select";
import { createProduct, updateProduct } from "../_libs/products";
import type { ProductDetail } from "../product.types";

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

// Từ GET /categories/:id/template
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

interface ColorImageForm {
  _key: string;
  color: string;
  altText: string;
  files: File[];
  previews: string[];
  existingUrls?: string[];
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

function SectionCard({ title, badge, children, defaultOpen = true }: { title: string; badge?: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-neutral-light border border-neutral rounded-xl overflow-hidden">
      <button type="button" onClick={() => setOpen((v) => !v)} className="w-full flex items-center justify-between px-5 py-3 hover:bg-neutral-light-active transition-colors cursor-pointer">
        <div className="flex items-center gap-2">
          <p className="text-[12px] font-semibold text-primary">{title}</p>
          {badge && <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/10 text-accent">{badge}</span>}
        </div>
        {open ? <ChevronUp size={14} className="text-neutral-dark" /> : <ChevronDown size={14} className="text-neutral-dark" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
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

  // ── Static options (load once) ──────────────────────────────────────────────
  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  // ── Category template (load on categoryId change) ───────────────────────────
  const [template, setTemplate] = useState<CategoryTemplate | null>(null);
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  // ── Basic fields ────────────────────────────────────────────────────────────
  const [name, setName] = useState(product?.name ?? "");
  const [brandId, setBrandId] = useState(product?.brandId ?? "");
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  // ── Variants ────────────────────────────────────────────────────────────────
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

  // ── Color images ────────────────────────────────────────────────────────────
  const [colorImages, setColorImages] = useState<ColorImageForm[]>(() => {
    if (product?.img?.length) {
      const colorMap = new Map<string, string[]>();
      for (const img of product.img) {
        if (!colorMap.has(img.color)) colorMap.set(img.color, []);
        if (img.imageUrl) colorMap.get(img.color)!.push(img.imageUrl);
      }
      return Array.from(colorMap.entries()).map(([color, urls]) => ({
        _key: uid(),
        color,
        altText: "",
        files: [],
        previews: [],
        existingUrls: urls,
      }));
    }
    return [{ _key: uid(), color: "", altText: "", files: [], previews: [] }];
  });

  // ── Specs ───────────────────────────────────────────────────────────────────
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

  // ── Errors ──────────────────────────────────────────────────────────────────
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Load brands + categories once ──────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const results = await Promise.allSettled([apiRequest.get<any>("/brands/admin/all", { params: { limit: 100 } }), apiRequest.get<any>("/categories/admin/all", { params: { limit: 500 } })]);

        if (results[0].status === "fulfilled") {
          const d = results[0].value.data;
          setBrands(Array.isArray(d) ? d : (d?.data ?? []));
        }
        if (results[1].status === "fulfilled") {
          const d = results[1].value.data;
          setCategories(Array.isArray(d) ? d : (d?.data ?? []));
        }
      } catch (e) {
        console.error("Load options error", e);
      } finally {
        setLoadingOptions(false);
      }
    };
    load();
  }, []);

  // ── Load category template khi categoryId thay đổi ─────────────────────────
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
        setTemplate({
          attributes: t?.attributes ?? [],
          specifications: t?.specifications ?? [],
        });
      })
      .catch(() => setTemplate(null))
      .finally(() => setLoadingTemplate(false));
  }, [categoryId]);

  // ── Khi template thay đổi: auto-check specs isRequired ──────────────────────
  useEffect(() => {
    if (!template) return;
    // Thêm các spec isRequired vào list nếu chưa có
    const requiredSpecs = template.specifications.flatMap((g) => g.items).filter((s) => s.isRequired);

    setSpecs((prev) => {
      const existingIds = new Set(prev.map((s) => s.specificationId));
      const toAdd = requiredSpecs.filter((s) => !existingIds.has(s.id)).map((s) => ({ specificationId: s.id, value: "", isHighlight: false }));
      return toAdd.length ? [...prev, ...toAdd] : prev;
    });
  }, [template]);

  // ─────────────────────────────────────────────────────────────────────────────
  // VARIANT HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const addVariant = () => {
    setVariants((prev) => [...prev, { _key: uid(), code: "", price: "", quantity: "10", isDefault: false, isActive: true, attributes: {} }]);
  };

  const removeVariant = (key: string) => setVariants((prev) => prev.filter((v) => v._key !== key));

  const setVariantDefault = (key: string) => {
    setVariants((prev) => prev.map((v) => ({ ...v, isDefault: v._key === key })));
  };

  const updateVariant = (key: string, field: keyof VariantForm, value: any) => {
    setVariants((prev) => prev.map((v) => (v._key === key ? { ...v, [field]: value } : v)));
  };

  const updateVariantAttribute = (variantKey: string, attributeId: string, optionId: string) => {
    setVariants((prev) => prev.map((v) => (v._key === variantKey ? { ...v, attributes: { ...v.attributes, [attributeId]: optionId } } : v)));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // COLOR IMAGE HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const addColorGroup = () => {
    setColorImages((prev) => [...prev, { _key: uid(), color: "", altText: "", files: [], previews: [] }]);
  };

  const removeColorGroup = (key: string) => {
    const group = colorImages.find((c) => c._key === key);
    group?.previews.forEach((url) => URL.revokeObjectURL(url));
    setColorImages((prev) => prev.filter((c) => c._key !== key));
  };

  const updateColorGroup = (key: string, field: "color" | "altText", value: string) => {
    setColorImages((prev) => prev.map((c) => (c._key === key ? { ...c, [field]: value } : c)));
  };

  const handleColorFiles = (key: string, files: FileList | null) => {
    if (!files) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((f) => URL.createObjectURL(f));
    setColorImages((prev) =>
      prev.map((c) => {
        if (c._key !== key) return c;
        c.previews.forEach((url) => URL.revokeObjectURL(url));
        return { ...c, files: newFiles, previews: newPreviews };
      }),
    );
  };

  const removeFileFromColor = (colorKey: string, fileIdx: number) => {
    setColorImages((prev) =>
      prev.map((c) => {
        if (c._key !== colorKey) return c;
        URL.revokeObjectURL(c.previews[fileIdx]);
        return {
          ...c,
          files: c.files.filter((_, i) => i !== fileIdx),
          previews: c.previews.filter((_, i) => i !== fileIdx),
        };
      }),
    );
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // SPEC HANDLERS
  // ─────────────────────────────────────────────────────────────────────────────

  const toggleSpec = (specId: string) => {
    setSpecs((prev) => {
      const exists = prev.find((s) => s.specificationId === specId);
      if (exists) return prev.filter((s) => s.specificationId !== specId);
      return [...prev, { specificationId: specId, value: "", isHighlight: false }];
    });
  };

  const updateSpecValue = (specId: string, value: string) => {
    setSpecs((prev) => prev.map((s) => (s.specificationId === specId ? { ...s, value } : s)));
  };

  const toggleSpecHighlight = (specId: string) => {
    setSpecs((prev) => prev.map((s) => (s.specificationId === specId ? { ...s, isHighlight: !s.isHighlight } : s)));
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // VALIDATION + SUBMIT
  // ─────────────────────────────────────────────────────────────────────────────

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!name.trim() || name.trim().length < 3) errs.name = "Tên sản phẩm phải có ít nhất 3 ký tự";
    if (!brandId) errs.brandId = "Vui lòng chọn thương hiệu";
    if (!categoryId) errs.categoryId = "Vui lòng chọn danh mục";

    const defaultCount = variants.filter((v) => v.isDefault).length;
    if (variants.length === 0) errs.variants = "Phải có ít nhất 1 biến thể";
    else if (defaultCount !== 1) errs.variants = "Phải có đúng 1 biến thể mặc định";

    variants.forEach((v) => {
      if (!v.code.trim()) errs[`variant_${v._key}_code`] = "SKU không được trống";
      if (!v.price || Number(v.price) <= 0) errs[`variant_${v._key}_price`] = "Giá phải > 0";
    });

    if (!isEdit) {
      const hasImages = colorImages.some((c) => c.color.trim() && c.files.length > 0);
      if (!hasImages) errs.colorImages = "Phải có ít nhất 1 màu với ảnh";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
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
          .filter(([, optId]) => optId)
          .map(([, attributeOptionId]) => ({ attributeOptionId })),
      }));

      const colorImagesPayload = colorImages.filter((c) => c.color.trim() && (c.files.length > 0 || isEdit)).map((c) => ({ color: c.color.trim(), altText: c.altText.trim() || c.color.trim() }));

      const specificationsPayload = specs.filter((s) => s.value.trim()).map((s) => ({ specificationId: s.specificationId, value: s.value.trim(), isHighlight: s.isHighlight }));

      const payload = {
        name: name.trim(),
        brandId,
        categoryId,
        description: description.trim() || undefined,
        isActive,
        isFeatured,
        variants: variantsPayload,
        colorImages: colorImagesPayload,
        specifications: specificationsPayload,
      };

      const colorImagesWithFiles = colorImages.filter((c) => c.color.trim() && c.files.length > 0);
      const fd = buildFormData(payload, colorImagesWithFiles);

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

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER — Loading
  // ─────────────────────────────────────────────────────────────────────────────

  if (loadingOptions) {
    return (
      <div className="flex items-center justify-center py-20 gap-2">
        <Loader2 size={20} className="animate-spin text-accent" />
        <span className="text-[13px] text-neutral-dark">Đang tải dữ liệu...</span>
      </div>
    );
  }

  // Số spec đang được nhập giá trị
  const filledSpecsCount = specs.filter((s) => s.value.trim()).length;

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
          {/* Brand */}
          <div>
            <Label required>Thương hiệu</Label>
            <Select
              options={brands.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              value={brands.find((b) => b.id === brandId) ? { value: brandId, label: brands.find((b) => b.id === brandId)?.name || "" } : null}
              onChange={(option: SelectOption | null) => setBrandId(option?.value || "")}
              placeholder="— Chọn thương hiệu —"
              isSearchable={true}
              isClearable={true}
              className="text-[13px]"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Không tìm thấy thương hiệu"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.75rem", // rounded-xl
                  borderColor: errors.brandId ? "#ef4444" : "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                valueContainer: (base) => ({ ...base, padding: "0.375rem 0.75rem" }),
                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  marginTop: 4,
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#f3f4f6" : "white",
                  color: state.isSelected ? "white" : "#111827",
                  fontSize: "13px",
                  padding: "8px 12px",
                }),
              }}
            />
            {errors.brandId && <p className="text-[11px] text-promotion mt-1">{errors.brandId}</p>}
          </div>

          {/* Category */}
          <div>
            <Label required>Danh mục</Label>
            <Select
              options={categories.map((c) => ({
                value: c.id,
                label: c.parentId ? `  └ ${c.name}` : c.name, // giữ nguyên phân cấp bằng khoảng trắng + └
              }))}
              value={
                categories.find((c) => c.id === categoryId)
                  ? {
                      value: categoryId,
                      label: categories.find((c) => c.id === categoryId)?.parentId
                        ? `  └ ${categories.find((c) => c.id === categoryId)?.name || ""}`
                        : categories.find((c) => c.id === categoryId)?.name || "",
                    }
                  : null
              }
              onChange={(option: SelectOption | null) => setCategoryId(option?.value || "")}
              placeholder="— Chọn danh mục —"
              isSearchable={true}
              isClearable={true}
              className="text-[13px]"
              classNamePrefix="react-select"
              noOptionsMessage={() => "Không tìm thấy danh mục"}
              styles={{
                control: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  borderColor: errors.categoryId ? "#ef4444" : "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
                valueContainer: (base) => ({ ...base, padding: "0.375rem 0.75rem" }),
                input: (base) => ({ ...base, margin: 0, padding: 0 }),
                menu: (base) => ({
                  ...base,
                  borderRadius: "0.75rem",
                  marginTop: 4,
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  zIndex: 9999,
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? "#6366f1" : state.isFocused ? "#f3f4f6" : "white",
                  color: state.isSelected ? "white" : "#111827",
                  fontSize: "13px",
                  padding: "8px 12px",
                }),
              }}
            />
            {errors.categoryId && <p className="text-[11px] text-promotion mt-1">{errors.categoryId}</p>}
          </div>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary">Hiển thị</span>
            <Toggle value={isActive} onChange={setIsActive} />
          </div>
          <div className="flex items-center justify-between flex-1 px-3 py-2.5 border border-neutral rounded-xl">
            <span className="text-[13px] text-primary">Nổi bật</span>
            <Toggle value={isFeatured} onChange={setIsFeatured} />
          </div>
        </div>

        <div>
          <Label>Mô tả (HTML)</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Nhập mô tả sản phẩm (hỗ trợ HTML)"
            className={inputCls() + " resize-y font-mono text-[12px]"}
          />
        </div>
      </SectionCard>

      {/* ── 2. Hình ảnh theo màu ── */}
      <SectionCard title="Hình ảnh theo màu" badge={`${colorImages.length} màu`}>
        {errors.colorImages && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
            <AlertCircle size={13} /> {errors.colorImages}
          </div>
        )}

        <div className="space-y-4">
          {colorImages.map((ci) => (
            <div key={ci._key} className="border border-neutral rounded-xl p-4 space-y-3">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Label required>Tên màu (value)</Label>
                  <input
                    value={ci.color}
                    onChange={(e) => updateColorGroup(ci._key, "color", e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                    placeholder="white, black, alpine-green"
                    className={inputCls()}
                  />
                </div>
                <div className="flex-1">
                  <Label>Alt text</Label>
                  <input value={ci.altText} onChange={(e) => updateColorGroup(ci._key, "altText", e.target.value)} placeholder="iPhone 15 màu trắng" className={inputCls()} />
                </div>
                {colorImages.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeColorGroup(ci._key)}
                    className="w-9 h-9 rounded-lg border border-neutral text-neutral-dark hover:bg-promotion-light hover:text-promotion flex items-center justify-center cursor-pointer shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              {/* Existing images */}
              {ci.existingUrls && ci.existingUrls.length > 0 && ci.files.length === 0 && (
                <div>
                  <p className="text-[11px] text-neutral-dark mb-1.5">Ảnh hiện tại ({ci.existingUrls.length})</p>
                  <div className="flex gap-2 flex-wrap">
                    {ci.existingUrls.map((url, i) => (
                      <div key={i} className="w-14 h-14 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active">
                        <Image src={url} alt="" width={56} height={56} className="object-contain" unoptimized />
                      </div>
                    ))}
                  </div>
                  <p className="text-[11px] text-neutral-dark mt-1">Chọn ảnh mới bên dưới để thay thế tất cả.</p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-neutral rounded-xl text-[12px] text-neutral-dark hover:bg-neutral-light-active hover:border-accent transition-colors cursor-pointer w-full">
                  <Upload size={14} />
                  Chọn ảnh (nhiều file)
                  {ci.files.length > 0 && <span className="ml-auto text-accent font-medium">{ci.files.length} file đã chọn</span>}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleColorFiles(ci._key, e.target.files)} />
                </label>

                {ci.previews.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {ci.previews.map((url, i) => (
                      <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active group">
                        <Image src={url} alt="" width={56} height={56} className="object-contain" unoptimized />
                        <button
                          type="button"
                          onClick={() => removeFileFromColor(ci._key, i)}
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
          ))}
        </div>

        <button
          type="button"
          onClick={addColorGroup}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-dashed border-accent text-accent text-[12px] font-medium hover:bg-accent/5 transition-colors cursor-pointer"
        >
          <Plus size={14} /> Thêm màu
        </button>
      </SectionCard>

      {/* ── 3. Biến thể ── */}
      <SectionCard title="Biến thể" badge={String(variants.length)}>
        {/* Hint khi chưa chọn category */}
        {!categoryId && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-light-active border border-neutral text-[12px] text-neutral-dark">
            <Info size={13} className="shrink-0" />
            Chọn danh mục trước để hiển thị đúng thuộc tính (màu sắc, bộ nhớ...) cho biến thể.
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

        <div className="space-y-4">
          {variants.map((v, idx) => (
            <div key={v._key} className={`border rounded-xl p-4 space-y-3 ${v.isDefault ? "border-accent bg-accent/5" : "border-neutral"}`}>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold text-primary">
                  Biến thể #{idx + 1}
                  {v.isDefault && <span className="ml-2 px-1.5 py-0.5 rounded text-[10px] bg-accent text-white">default</span>}
                </p>
                <div className="flex items-center gap-2">
                  {!v.isDefault && (
                    <button type="button" onClick={() => setVariantDefault(v._key)} className="text-[11px] text-accent hover:underline cursor-pointer">
                      Đặt làm default
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

              {/* SKU + Price + Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label required>SKU</Label>
                  <input
                    value={v.code}
                    onChange={(e) => updateVariant(v._key, "code", e.target.value.toUpperCase())}
                    placeholder="IPHONE-15-128GB-WHITE"
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

              {/* Attributes từ template */}
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
                        <select value={v.attributes[attr.id] ?? ""} onChange={(e) => updateVariantAttribute(v._key, attr.id, e.target.value)} className={inputCls() + " cursor-pointer text-[12px]"}>
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

              {/* Kích hoạt */}
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

      {/* ── 4. Thông số kỹ thuật ── */}
      {/* Hiện section khi: đã chọn category và template có specs */}
      {categoryId && template && template.specifications.length > 0 && (
        <SectionCard title="Thông số kỹ thuật" badge={`${filledSpecsCount} / ${template.specifications.flatMap((g) => g.items).length}`} defaultOpen={true}>
          {loadingTemplate ? (
            <div className="flex items-center gap-2 text-[12px] text-neutral-dark py-4 justify-center">
              <Loader2 size={13} className="animate-spin" /> Đang tải thông số...
            </div>
          ) : (
            <div className="space-y-6">
              {template.specifications.map((group) => (
                <div key={group.groupName}>
                  <p className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2">{group.groupName}</p>
                  <div className="space-y-2">
                    {group.items.map((spec) => {
                      const selected = specs.find((s) => s.specificationId === spec.id);
                      return (
                        <div
                          key={spec.id}
                          className={`border rounded-xl p-3 transition-colors ${
                            selected ? "border-accent/40 bg-accent/5" : "border-neutral"
                          } ${spec.isRequired ? "border-l-4 border-l-accent/50" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <input type="checkbox" checked={!!selected} onChange={() => toggleSpec(spec.id)} disabled={spec.isRequired} className="w-3.5 h-3.5 accent-accent cursor-pointer shrink-0" />
                            <span className="text-[12px] text-primary flex-1">
                              {spec.name}
                              {spec.isRequired && <span className="ml-1.5 text-[10px] text-accent font-medium">(bắt buộc)</span>}
                            </span>
                            {spec.unit && <span className="text-[11px] text-neutral-dark shrink-0">({spec.unit})</span>}
                            {spec.isFilterable && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-500 shrink-0">filter</span>}
                            {selected && (
                              <button
                                type="button"
                                onClick={() => toggleSpecHighlight(spec.id)}
                                title="Đánh dấu nổi bật"
                                className={`cursor-pointer transition-colors ${selected.isHighlight ? "text-amber-500" : "text-neutral-dark hover:text-amber-400"}`}
                              >
                                <Star size={13} fill={selected.isHighlight ? "currentColor" : "none"} />
                              </button>
                            )}
                          </div>
                          {selected && (
                            <input
                              value={selected.value}
                              onChange={(e) => updateSpecValue(spec.id, e.target.value)}
                              placeholder={`Nhập giá trị${spec.unit ? ` (${spec.unit})` : ""}`}
                              className={inputCls(!selected.value && spec.isRequired) + " mt-2 text-[12px]"}
                              autoFocus={selected.value === "" && spec.isRequired}
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

      {/* Hint khi chưa chọn category */}
      {!categoryId && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-neutral text-[12px] text-neutral-dark">
          <Info size={14} className="shrink-0" />
          Chọn danh mục để hiển thị thông số kỹ thuật phù hợp.
        </div>
      )}

      {/* ── Submit ── */}
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
