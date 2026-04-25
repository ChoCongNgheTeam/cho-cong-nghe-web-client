"use client";

/**
 * /admin/orders/create/page.tsx  v2
 *
 * Fix:
 * 1. Tab khách hàng: "Khách cũ" (search) | "Khách mới" (nhập thông tin)
 * 2. User search: đúng endpoint /users/admin?search=, parse { data: [], pagination }
 * 3. Product search: hiển thị name gốc (không có variant suffix)
 *    Sau khi chọn → chọn từng attribute (color, storage...) thay vì chip variants
 * 4. Địa chỉ: lấy đúng địa chỉ của user đó (có userId param)
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Plus, Trash2, Loader2, User, MapPin, Package, CreditCard, Tag, X, AlertCircle, CheckCircle2, ShoppingCart, UserPlus, Users } from "lucide-react";
import Select from "react-select";
import { formatVND } from "@/helpers";
import {
  searchUsers,
  getUserAddresses,
  getProvinces,
  getWards,
  getActivePaymentMethods,
  searchProducts,
  getVariantOptions,
  createOrderAdmin,
  type UserResult,
  type UserAddress,
  type Province,
  type Ward,
  type PaymentMethod,
  type ProductSearchResult,
  type VariantOption,
} from "../_libs/orders";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

interface CartItem {
  _key: string;
  productId: string;
  productName: string;
  productThumbnail: string | null;
  variantId: string;
  variantLabel: string;
  variantCode: string;
  unitPrice: number;
  quantity: number;
}

interface SelectOption {
  value: string;
  label: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

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
    minHeight: "38px",
  }),
  valueContainer: (b: any) => ({ ...b, padding: "0.25rem 0.75rem" }),
  input: (b: any) => ({ ...b, margin: 0, padding: 0, fontSize: "13px" }),
  menu: (b: any) => ({ ...b, borderRadius: "0.75rem", marginTop: 4, boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", zIndex: 9999 }),
  option: (b: any, s: any) => ({ ...b, background: s.isSelected ? "#6366f1" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#111827", fontSize: "13px", padding: "8px 12px" }),
  singleValue: (b: any) => ({ ...b, fontSize: "13px" }),
  placeholder: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
});

function SectionCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-light border border-neutral rounded-2xl shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-neutral bg-neutral-light-active/50">
        <span className="text-accent">{icon}</span>
        <p className="text-[13px] font-semibold text-primary">{title}</p>
      </div>
      <div className="px-5 pb-5 pt-4 space-y-4">{children}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateOrderPage() {
  const router = useRouter();

  // ── Customer tab: "existing" | "new" ─────────────────────────────────────
  const [customerTab, setCustomerTab] = useState<"existing" | "new">("existing");

  // Existing customer
  const [userSearch, setUserSearch] = useState("");
  const [userResults, setUserResults] = useState<UserResult[]>([]);
  const [searchingUser, setSearchingUser] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddress, setShowNewAddress] = useState(false);
  const userSearchRef = useRef<HTMLDivElement>(null);

  // New customer
  const [newCustomer, setNewCustomer] = useState({ fullName: "", phone: "", email: "" });

  // Address fields (dùng cho cả khách mới và khách cũ nhập địa chỉ mới)
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [newAddr, setNewAddr] = useState({ contactName: "", phone: "", provinceId: "", wardId: "", detailAddress: "" });

  // ── Products ──────────────────────────────────────────────────────────────
  const [productSearch, setProductSearch] = useState("");
  const [productResults, setProductResults] = useState<ProductSearchResult[]>([]);
  const [searchingProduct, setSearchingProduct] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchResult | null>(null);
  const [variants, setVariants] = useState<VariantOption[]>([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const productSearchRef = useRef<HTMLDivElement>(null);

  // Selected attributes (color, storage...)
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>({});
  // Derived: variant matching selected attrs
  const [matchedVariant, setMatchedVariant] = useState<VariantOption | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [cart, setCart] = useState<CartItem[]>([]);

  // ── Payment ───────────────────────────────────────────────────────────────
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<"UNPAID" | "PAID">("UNPAID");
  const [orderStatus, setOrderStatus] = useState<"PENDING" | "PROCESSING">("PENDING");
  const [shippingFee, setShippingFee] = useState("0");
  const [voucherCode, setVoucherCode] = useState("");

  // ── Submit ────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─────────────────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([getProvinces(), getActivePaymentMethods()])
      .then(([provs, methods]) => {
        setProvinces(provs);
        setPaymentMethods(methods);
        if (methods.length) setSelectedPaymentId(methods[0].id);
      })
      .catch(console.error);
  }, []);

  // Load wards khi chọn province
  const provinceId = newAddr.provinceId;
  useEffect(() => {
    if (!provinceId) {
      setWards([]);
      return;
    }
    getWards(provinceId).then(setWards).catch(console.error);
  }, [provinceId]);

  // Load địa chỉ khi chọn user
  useEffect(() => {
    if (!selectedUser) {
      setUserAddresses([]);
      setSelectedAddressId(null);
      return;
    }
    getUserAddresses(selectedUser.id)
      .then((addrs) => {
        setUserAddresses(addrs);
        const def = addrs.find((a) => a.isDefault) ?? addrs[0];
        if (def) setSelectedAddressId(def.id);
      })
      .catch(console.error);
  }, [selectedUser]);

  // Close dropdowns
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userSearchRef.current && !userSearchRef.current.contains(e.target as Node)) setUserResults([]);
      if (productSearchRef.current && !productSearchRef.current.contains(e.target as Node)) setShowProductDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // DERIVED: attribute groups từ variants
  // VD: variants của iPhone 13 → { color: ["black","white","green"], storage: ["128gb","256gb","512gb"] }
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * attrGroups: build từ TẤT CẢ variants (kể cả unavailable).
   * Mỗi option có thêm field `enabled` = có ít nhất 1 variant available khi kết hợp với selection hiện tại.
   *
   * Logic disable cross-dependency:
   * - Khi chọn màu X → storage Y disabled nếu không có variant {color=X, storage=Y, available=true}
   * - Khi chọn storage Y → màu X disabled nếu không có variant {color=X, storage=Y, available=true}
   */
  const attrGroups = (() => {
    if (!variants.length) return [];

    // Thu thập tất cả unique values (kể cả unavailable)
    const colorMap = new Map<string, { value: string; label: string; imageUrl: string | null }>();
    const storageMap = new Map<string, { value: string; label: string }>();

    for (const v of variants) {
      if (v.colorValue && !colorMap.has(v.colorValue)) {
        colorMap.set(v.colorValue, { value: v.colorValue, label: v.colorLabel || v.colorValue, imageUrl: v.imageUrl });
      }
      if (v.storageValue && !storageMap.has(v.storageValue)) {
        storageMap.set(v.storageValue, { value: v.storageValue, label: v.storageLabel || v.storageValue });
      }
    }

    const groups = [];

    // Color group — enabled nếu có variant available với storage đang chọn
    if (colorMap.size > 0) {
      groups.push({
        code: "color",
        label: "Màu sắc",
        values: Array.from(colorMap.values()).map((c) => ({
          ...c,
          enabled: variants.some(
            (v) =>
              v.colorValue === c.value &&
              v.available &&
              // Nếu đang chọn storage rồi → phải match storage đó
              (!selectedAttrs.storage || v.storageValue === selectedAttrs.storage),
          ),
        })),
      });
    }

    // Storage group — enabled nếu có variant available với color đang chọn
    if (storageMap.size > 0) {
      groups.push({
        code: "storage",
        label: "Dung lượng",
        values: Array.from(storageMap.values()).map((s) => ({
          ...s,
          imageUrl: null as string | null,
          enabled: variants.some(
            (v) =>
              v.storageValue === s.value &&
              v.available &&
              // Nếu đang chọn màu rồi → phải match màu đó
              (!selectedAttrs.color || v.colorValue === selectedAttrs.color),
          ),
        })),
      });
    }

    return groups;
  })();

  // Tìm variant khớp với selectedAttrs
  useEffect(() => {
    if (!variants.length) {
      setMatchedVariant(null);
      return;
    }

    const matched =
      variants.find((v) => {
        if (!v.available) return false;
        const colorMatch = !selectedAttrs.color || v.colorValue === selectedAttrs.color;
        const storageMatch = !selectedAttrs.storage || v.storageValue === selectedAttrs.storage;
        return colorMatch && storageMatch;
      }) ?? null;

    setMatchedVariant(matched);
  }, [selectedAttrs, variants]);

  // ─────────────────────────────────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────────────────────────────────

  const doSearchUsers = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setUserResults([]);
      return;
    }
    setSearchingUser(true);
    try {
      const results = await searchUsers(q);
      setUserResults(results);
    } catch {
      setUserResults([]);
    } finally {
      setSearchingUser(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => doSearchUsers(userSearch), 300);
    return () => clearTimeout(t);
  }, [userSearch, doSearchUsers]);

  const doSearchProducts = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setProductResults([]);
      setShowProductDropdown(false);
      return;
    }
    setSearchingProduct(true);
    try {
      const results = await searchProducts(q);
      setProductResults(results);
      if (results.length > 0) setShowProductDropdown(true);
    } catch {
      setProductResults([]);
      setShowProductDropdown(false);
    } finally {
      setSearchingProduct(false);
    }
  }, []);

  // Chỉ search khi chưa chọn product
  useEffect(() => {
    if (selectedProduct) return; // Đã chọn rồi, không search lại
    const t = setTimeout(() => doSearchProducts(productSearch), 300);
    return () => clearTimeout(t);
  }, [productSearch, doSearchProducts, selectedProduct]);

  const handleSelectProduct = async (product: ProductSearchResult) => {
    setSelectedProduct(product);
    // Hiển thị name gốc (không có variant suffix như "128GB")
    setProductSearch(product.name);
    setShowProductDropdown(false);
    setVariants([]);
    setSelectedAttrs({});
    setMatchedVariant(null);
    setLoadingVariants(true);
    try {
      const opts = await getVariantOptions(product.slug);
      setVariants(opts);
      // Auto-select default variant attributes
      const def = opts.find((v) => v.isDefault) ?? opts[0];
      if (def) {
        const auto: Record<string, string> = {};
        if (def.colorValue) auto.color = def.colorValue;
        if (def.storageValue) auto.storage = def.storageValue;
        setSelectedAttrs(auto);
      }
    } catch {
      setVariants([]);
    } finally {
      setLoadingVariants(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // CART
  // ─────────────────────────────────────────────────────────────────────────

  const handleAddToCart = () => {
    if (!selectedProduct || !matchedVariant) return;
    const label = [matchedVariant.colorLabel, matchedVariant.storageLabel].filter(Boolean).join(" / ") || matchedVariant.code || "Default";

    const existing = cart.find((c) => c.variantId === matchedVariant.id);
    if (existing) {
      setCart((p) => p.map((c) => (c.variantId === matchedVariant.id ? { ...c, quantity: c.quantity + addQty } : c)));
    } else {
      setCart((p) => [
        ...p,
        {
          _key: uid(),
          productId: selectedProduct.id,
          productName: selectedProduct.name, // name gốc
          productThumbnail: matchedVariant.imageUrl ?? selectedProduct.thumbnail,
          variantId: matchedVariant.id,
          variantLabel: label,
          variantCode: matchedVariant.code,
          unitPrice: matchedVariant.finalPrice ?? matchedVariant.price,
          quantity: addQty,
        },
      ]);
    }
    setProductSearch("");
    setSelectedProduct(null);
    setVariants([]);
    setSelectedAttrs({});
    setMatchedVariant(null);
    setAddQty(1);
  };

  const removeFromCart = (key: string) => setCart((p) => p.filter((c) => c._key !== key));
  const updateQty = (key: string, qty: number) => {
    if (qty < 1) return;
    setCart((p) => p.map((c) => (c._key === key ? { ...c, quantity: qty } : c)));
  };

  // ─────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ─────────────────────────────────────────────────────────────────────────

  const subtotal = cart.reduce((s, c) => s + c.unitPrice * c.quantity, 0);
  const shippingFeeNum = Number(shippingFee) || 0;
  const total = subtotal + shippingFeeNum;
  const selectedAddress = userAddresses.find((a) => a.id === selectedAddressId);

  // ─────────────────────────────────────────────────────────────────────────
  // VALIDATE + SUBMIT
  // ─────────────────────────────────────────────────────────────────────────

  const validate = () => {
    const errs: Record<string, string> = {};

    if (customerTab === "existing") {
      if (!selectedUser) errs.user = "Vui lòng chọn khách hàng";
      if (!selectedAddressId && !showNewAddress) errs.address = "Vui lòng chọn địa chỉ giao hàng";
      if (showNewAddress) {
        if (!newAddr.contactName.trim()) errs.contactName = "Họ tên không được trống";
        if (!newAddr.phone.trim()) errs.phone = "SĐT không được trống";
        if (!newAddr.provinceId) errs.province = "Chọn tỉnh/thành";
        if (!newAddr.wardId) errs.ward = "Chọn phường/xã";
        if (!newAddr.detailAddress.trim()) errs.detailAddress = "Địa chỉ không được trống";
      }
    } else {
      if (!newCustomer.fullName.trim()) errs.newFullName = "Họ tên không được trống";
      if (!newCustomer.phone.trim()) errs.newPhone = "SĐT không được trống";
      if (!newAddr.provinceId) errs.province = "Chọn tỉnh/thành";
      if (!newAddr.wardId) errs.ward = "Chọn phường/xã";
      if (!newAddr.detailAddress.trim()) errs.detailAddress = "Địa chỉ không được trống";
    }

    if (cart.length === 0) errs.cart = "Giỏ hàng chưa có sản phẩm";
    if (!selectedPaymentId) errs.payment = "Chọn phương thức thanh toán";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: any = {
        items: cart.map((c) => ({ productVariantId: c.variantId, quantity: c.quantity, unitPrice: c.unitPrice })),
        shippingFee: shippingFeeNum,
        paymentMethodId: selectedPaymentId!,
        paymentStatus,
        orderStatus,
        ...(voucherCode.trim() ? { voucherCode: voucherCode.trim() } : {}),
      };

      if (customerTab === "existing" && selectedUser) {
        payload.userId = selectedUser.id;
        if (showNewAddress) {
          payload.newAddress = { provinceId: newAddr.provinceId, wardId: newAddr.wardId, detailAddress: newAddr.detailAddress.trim() };
          payload.customerInfo = { fullName: newAddr.contactName.trim(), phone: newAddr.phone.trim() };
        } else {
          payload.shippingAddressId = selectedAddressId;
        }
      } else {
        // Khách mới
        payload.customerInfo = { fullName: newCustomer.fullName.trim(), phone: newCustomer.phone.trim(), email: newCustomer.email.trim() || undefined };
        payload.newAddress = { provinceId: newAddr.provinceId, wardId: newAddr.wardId, detailAddress: newAddr.detailAddress.trim() };
      }

      const res = await createOrderAdmin(payload);
      router.push(`/admin/orders/${res.data.id}`);
    } catch (e: any) {
      setSubmitError(e?.message ?? "Đã xảy ra lỗi");
    } finally {
      setSubmitting(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="flex items-center gap-3 px-6 pt-5 pb-3">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer">
          <ArrowLeft size={14} /> Quay lại
        </button>
        <span className="text-neutral-dark">/</span>
        <Link href="/admin/orders" className="text-[13px] text-neutral-dark hover:text-accent">
          Đơn hàng
        </Link>
        <span className="text-neutral-dark">/</span>
        <span className="text-[13px] text-primary font-medium">Tạo đơn mới</span>
      </div>

      <div className="px-6">
        <div className="mb-5">
          <h1 className="text-[20px] font-bold text-primary">Tạo đơn hàng mới</h1>
          <p className="text-[13px] text-neutral-dark mt-1">Tạo đơn hàng thủ công từ admin panel.</p>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <div className="col-span-2 space-y-5">
            {/* ── 1. Khách hàng ── */}
            <SectionCard title="Khách hàng" icon={<User size={15} />}>
              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-xl bg-neutral-light-active border border-neutral">
                <button
                  onClick={() => setCustomerTab("existing")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${customerTab === "existing" ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
                >
                  <Users size={13} /> Khách hàng cũ
                </button>
                <button
                  onClick={() => setCustomerTab("new")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-colors cursor-pointer ${customerTab === "new" ? "bg-accent text-white shadow-sm" : "text-neutral-dark hover:text-primary"}`}
                >
                  <UserPlus size={13} /> Khách hàng mới
                </button>
              </div>

              {customerTab === "existing" ? (
                <>
                  {/* Search existing user */}
                  <div ref={userSearchRef} className="relative">
                    <Label required>Tìm khách hàng</Label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                      <input
                        value={selectedUser ? `${selectedUser.fullName} — ${selectedUser.email}` : userSearch}
                        onChange={(e) => {
                          setUserSearch(e.target.value);
                          setSelectedUser(null);
                        }}
                        placeholder="Tìm theo tên, email, SĐT..."
                        className={inputCls(!!errors.user) + " pl-8 pr-8"}
                        readOnly={!!selectedUser}
                      />
                      {selectedUser && (
                        <button
                          onClick={() => {
                            setSelectedUser(null);
                            setUserSearch("");
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-promotion cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      )}
                      {searchingUser && !selectedUser && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-dark" />}
                    </div>
                    {errors.user && <p className="text-[11px] text-promotion mt-1">{errors.user}</p>}

                    {userResults.length > 0 && !selectedUser && (
                      <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 max-h-52 overflow-y-auto">
                        {userResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => {
                              setSelectedUser(u);
                              setUserSearch("");
                              setUserResults([]);
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-light-active cursor-pointer text-left"
                          >
                            <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center shrink-0 text-[11px] font-bold">{u.fullName?.[0]?.toUpperCase() ?? "U"}</div>
                            <div className="min-w-0">
                              <p className="text-[13px] font-medium text-primary truncate">{u.fullName}</p>
                              <p className="text-[11px] text-neutral-dark">
                                {u.email} · {u.phone}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Địa chỉ của user đã chọn */}
                  {selectedUser && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Địa chỉ giao hàng</Label>
                        <button onClick={() => setShowNewAddress((v) => !v)} className="text-[11px] text-accent hover:underline cursor-pointer flex items-center gap-1">
                          <Plus size={11} /> {showNewAddress ? "Dùng địa chỉ có sẵn" : "Nhập địa chỉ mới"}
                        </button>
                      </div>

                      {!showNewAddress ? (
                        userAddresses.length > 0 ? (
                          <div className="space-y-2">
                            {userAddresses.map((addr) => (
                              <label
                                key={addr.id}
                                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${selectedAddressId === addr.id ? "border-accent bg-accent/5" : "border-neutral hover:border-accent/50"}`}
                              >
                                <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-0.5 accent-accent" />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[13px] font-medium text-primary">
                                    {addr.contactName} · {addr.phone}
                                    {addr.isDefault && <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent">Mặc định</span>}
                                  </p>
                                  <p className="text-[12px] text-neutral-dark mt-0.5">
                                    {addr.detailAddress}, {addr.ward.name}, {addr.province.name}
                                  </p>
                                </div>
                              </label>
                            ))}
                            {errors.address && <p className="text-[11px] text-promotion">{errors.address}</p>}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-neutral-light-active border border-neutral text-[12px] text-neutral-dark">
                            <MapPin size={13} /> Khách hàng chưa có địa chỉ. Nhập địa chỉ mới.
                          </div>
                        )
                      ) : (
                        <AddressForm provinces={provinces} wards={wards} addr={newAddr} setAddr={setNewAddr} errors={errors} />
                      )}
                    </div>
                  )}
                </>
              ) : (
                /* Khách mới */
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label required>Họ và tên</Label>
                      <input
                        value={newCustomer.fullName}
                        onChange={(e) => setNewCustomer((p) => ({ ...p, fullName: e.target.value }))}
                        placeholder="Nguyễn Văn A"
                        className={inputCls(!!errors.newFullName)}
                      />
                      {errors.newFullName && <p className="text-[11px] text-promotion mt-1">{errors.newFullName}</p>}
                    </div>
                    <div>
                      <Label required>Số điện thoại</Label>
                      <input value={newCustomer.phone} onChange={(e) => setNewCustomer((p) => ({ ...p, phone: e.target.value }))} placeholder="0912345678" className={inputCls(!!errors.newPhone)} />
                      {errors.newPhone && <p className="text-[11px] text-promotion mt-1">{errors.newPhone}</p>}
                    </div>
                  </div>
                  <div>
                    <Label>Email (tùy chọn)</Label>
                    <input type="email" value={newCustomer.email} onChange={(e) => setNewCustomer((p) => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className={inputCls()} />
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-primary mb-2">Địa chỉ giao hàng</p>
                    <AddressForm provinces={provinces} wards={wards} addr={newAddr} setAddr={setNewAddr} errors={errors} showNamePhone />
                  </div>
                </div>
              )}
            </SectionCard>

            {/* ── 2. Sản phẩm ── */}
            <SectionCard title="Sản phẩm" icon={<Package size={15} />}>
              <div ref={productSearchRef} className="relative">
                <Label>Tìm sản phẩm</Label>
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  <input
                    value={selectedProduct ? selectedProduct.name : productSearch}
                    onChange={(e) => {
                      if (selectedProduct) return; // readOnly effect khi đã chọn
                      setProductSearch(e.target.value);
                      // Nếu xóa hết thì ẩn dropdown
                      if (!e.target.value) setShowProductDropdown(false);
                    }}
                    readOnly={!!selectedProduct}
                    placeholder="Tìm theo tên sản phẩm... (VD: iPhone, MacBook)"
                    className={inputCls() + " pl-8 pr-8" + (selectedProduct ? " bg-neutral-light-active/60 cursor-default" : "")}
                  />
                  {/* Nút X khi đã chọn product */}
                  {selectedProduct && (
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setProductSearch("");
                        setVariants([]);
                        setSelectedAttrs({});
                        setMatchedVariant(null);
                        setShowProductDropdown(false);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-dark hover:text-promotion cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {searchingProduct && !selectedProduct && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-neutral-dark" />}
                </div>

                {showProductDropdown && productResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-neutral-light border border-neutral rounded-xl shadow-lg py-1 max-h-64 overflow-y-auto">
                    {productResults.map((p) => (
                      <button key={p.id} onClick={() => handleSelectProduct(p)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-neutral-light-active cursor-pointer text-left">
                        <div className="w-9 h-9 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
                          {p.thumbnail ? (
                            <Image src={p.thumbnail} alt={p.name} width={36} height={36} className="object-contain w-full h-full" unoptimized />
                          ) : (
                            <Package size={14} className="text-neutral-dark m-auto mt-2.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          {/* Hiển thị name gốc: "iPhone 13" không phải "iPhone 13 128GB" */}
                          <p className="text-[13px] font-medium text-primary truncate">{p.name}</p>
                          <p className="text-[11px] text-neutral-dark">
                            {p.brand?.name} · {p.category?.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Attribute selectors + add to cart */}
              {selectedProduct && (
                <div className="p-4 rounded-xl border border-neutral bg-neutral-light-active/40 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-neutral bg-neutral-light shrink-0">
                      {selectedProduct.thumbnail ? (
                        <Image src={selectedProduct.thumbnail} alt={selectedProduct.name} width={40} height={40} className="object-contain w-full h-full" unoptimized />
                      ) : (
                        <Package size={14} className="text-neutral-dark m-3" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-primary">{selectedProduct.name}</p>
                      <p className="text-[11px] text-neutral-dark">{selectedProduct.brand?.name}</p>
                    </div>
                  </div>

                  {loadingVariants ? (
                    <div className="flex items-center gap-2 text-[12px] text-neutral-dark">
                      <Loader2 size={13} className="animate-spin" /> Đang tải biến thể...
                    </div>
                  ) : attrGroups.length > 0 ? (
                    <div className="space-y-3">
                      {/* Attribute groups */}
                      {attrGroups.map((group) => (
                        <div key={group.code}>
                          <Label>{group.label}</Label>
                          <div className="flex flex-wrap gap-2">
                            {group.values.map((val) => {
                              const isSelected = selectedAttrs[group.code] === val.value;
                              const isEnabled = (val as any).enabled !== false;
                              return (
                                <button
                                  key={val.value}
                                  onClick={() => isEnabled && setSelectedAttrs((p) => ({ ...p, [group.code]: val.value }))}
                                  disabled={!isEnabled}
                                  title={!isEnabled ? "Không có sẵn với lựa chọn hiện tại" : val.label}
                                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] transition-all relative ${
                                    !isEnabled
                                      ? "border-neutral/40 text-neutral-dark/40 bg-neutral-light-active/50 cursor-not-allowed line-through"
                                      : isSelected
                                        ? "border-accent bg-accent/10 text-accent font-semibold cursor-pointer"
                                        : "border-neutral hover:border-accent/50 text-primary cursor-pointer"
                                  }`}
                                >
                                  {group.code === "color" && (val as any).imageUrl && (
                                    <Image src={(val as any).imageUrl} alt="" width={16} height={16} className={`rounded object-contain ${!isEnabled ? "opacity-40" : ""}`} unoptimized />
                                  )}
                                  {group.code === "color" && !(val as any).imageUrl && val.value && (
                                    <span className={`w-3.5 h-3.5 rounded-full border border-neutral/50 shrink-0 ${!isEnabled ? "opacity-40" : ""}`} style={{ background: val.value }} />
                                  )}
                                  {val.label}
                                  {/* Gạch chéo overlay khi disabled */}
                                  {!isEnabled && (
                                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="w-full h-px bg-neutral-dark/30 rotate-[-20deg] absolute" />
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Matched variant info + qty */}
                      {matchedVariant ? (
                        <div className="flex items-end gap-3 pt-1">
                          <div className="flex-1 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
                            <p className="text-[12px] font-semibold text-emerald-700">{matchedVariant.code}</p>
                            <p className="text-[15px] font-bold text-accent">{formatVND(matchedVariant.finalPrice ?? matchedVariant.price)}</p>
                            {(matchedVariant.discountPercentage ?? 0) > 0 && <p className="text-[11px] text-neutral-dark line-through">{formatVND(matchedVariant.price)}</p>}
                          </div>
                          <div>
                            <Label>Số lượng</Label>
                            <div className="flex items-center border border-neutral rounded-xl overflow-hidden w-28">
                              <button onClick={() => setAddQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
                                −
                              </button>
                              <input
                                type="number"
                                value={addQty}
                                onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                                className="flex-1 text-center text-[13px] bg-transparent border-none outline-none py-2 min-w-0"
                              />
                              <button onClick={() => setAddQty((q) => q + 1)} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={handleAddToCart}
                            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-xl cursor-pointer mb-0.5"
                          >
                            <ShoppingCart size={14} /> Thêm vào đơn
                          </button>
                        </div>
                      ) : (
                        <p className="text-[12px] text-neutral-dark/60 italic">Chọn đủ thuộc tính để xem biến thể.</p>
                      )}
                    </div>
                  ) : variants.length > 0 ? (
                    // Fallback: sản phẩm chỉ có 1 variant không có attributes
                    <div className="flex items-end gap-3">
                      <div className="flex-1 p-2.5 rounded-xl border border-emerald-200 bg-emerald-50">
                        <p className="text-[15px] font-bold text-accent">{formatVND(variants[0].finalPrice ?? variants[0].price)}</p>
                      </div>
                      <div>
                        <Label>Số lượng</Label>
                        <div className="flex items-center border border-neutral rounded-xl overflow-hidden w-28">
                          <button onClick={() => setAddQty((q) => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
                            −
                          </button>
                          <input
                            type="number"
                            value={addQty}
                            onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                            className="flex-1 text-center text-[13px] bg-transparent border-none outline-none py-2 min-w-0"
                          />
                          <button onClick={() => setAddQty((q) => q + 1)} className="px-3 py-2 hover:bg-neutral-light-active text-[14px] cursor-pointer">
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setMatchedVariant(variants[0]);
                          handleAddToCart();
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white text-[13px] font-medium rounded-xl cursor-pointer mb-0.5"
                      >
                        <ShoppingCart size={14} /> Thêm vào đơn
                      </button>
                    </div>
                  ) : null}
                </div>
              )}

              {errors.cart && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                  <AlertCircle size={13} /> {errors.cart}
                </div>
              )}

              {cart.length > 0 && (
                <div className="border border-neutral rounded-xl overflow-hidden">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-neutral-light-active border-b border-neutral">
                        <th className="text-left px-3 py-2 font-semibold text-neutral-dark">Sản phẩm</th>
                        <th className="text-right px-3 py-2 font-semibold text-neutral-dark">Đơn giá</th>
                        <th className="text-center px-3 py-2 font-semibold text-neutral-dark">SL</th>
                        <th className="text-right px-3 py-2 font-semibold text-neutral-dark">Tổng</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => (
                        <tr key={item._key} className="border-b border-neutral/50 last:border-0">
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-lg overflow-hidden border border-neutral bg-neutral-light-active shrink-0">
                                {item.productThumbnail ? (
                                  <Image src={item.productThumbnail} alt="" width={32} height={32} className="object-contain w-full h-full" unoptimized />
                                ) : (
                                  <Package size={11} className="text-neutral-dark m-2.5" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="text-primary font-medium truncate max-w-[160px]">{item.productName}</p>
                                <p className="text-neutral-dark text-[11px]">{item.variantLabel}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right">{formatVND(item.unitPrice)}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center border border-neutral rounded-lg overflow-hidden w-20 mx-auto">
                              <button onClick={() => updateQty(item._key, item.quantity - 1)} className="px-2 py-1 hover:bg-neutral-light-active text-[13px] cursor-pointer">
                                −
                              </button>
                              <span className="flex-1 text-center py-1">{item.quantity}</span>
                              <button onClick={() => updateQty(item._key, item.quantity + 1)} className="px-2 py-1 hover:bg-neutral-light-active text-[13px] cursor-pointer">
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-semibold text-accent">{formatVND(item.unitPrice * item.quantity)}</td>
                          <td className="px-3 py-2.5">
                            <button
                              onClick={() => removeFromCart(item._key)}
                              className="w-6 h-6 rounded-lg hover:bg-promotion-light hover:text-promotion flex items-center justify-center cursor-pointer text-neutral-dark"
                            >
                              <Trash2 size={11} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>

          {/* RIGHT 1/3 */}
          <div className="space-y-5">
            <SectionCard title="Thanh toán" icon={<CreditCard size={15} />}>
              <div>
                <Label required>Phương thức</Label>
                <Select
                  options={paymentMethods.map((p) => ({ value: p.id, label: p.name }))}
                  value={selectedPaymentId ? { value: selectedPaymentId, label: paymentMethods.find((p) => p.id === selectedPaymentId)?.name ?? "" } : null}
                  onChange={(o: SelectOption | null) => setSelectedPaymentId(o?.value ?? null)}
                  placeholder="— Chọn —"
                  styles={rsStyles(!!errors.payment)}
                  noOptionsMessage={() => "Không có"}
                />
                {errors.payment && <p className="text-[11px] text-promotion mt-1">{errors.payment}</p>}
              </div>
              <div>
                <Label>Trạng thái thanh toán</Label>
                <div className="flex gap-2">
                  {(["UNPAID", "PAID"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setPaymentStatus(s)}
                      className={`flex-1 py-2 rounded-xl border text-[12px] font-medium transition-colors cursor-pointer ${paymentStatus === s ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"}`}
                    >
                      {s === "UNPAID" ? "Chưa TT" : "Đã TT"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Trạng thái đơn</Label>
                <div className="flex gap-2">
                  {(["PENDING", "PROCESSING"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setOrderStatus(s)}
                      className={`flex-1 py-2 rounded-xl border text-[12px] font-medium transition-colors cursor-pointer ${orderStatus === s ? "border-accent bg-accent/10 text-accent" : "border-neutral text-primary hover:border-accent/50"}`}
                    >
                      {s === "PENDING" ? "Chờ duyệt" : "Xử lý"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Phí vận chuyển</Label>
                <input type="number" value={shippingFee} onChange={(e) => setShippingFee(e.target.value)} placeholder="0" className={inputCls()} />
              </div>
              <div>
                <Label>Voucher</Label>
                <div className="relative">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-dark pointer-events-none" />
                  <input value={voucherCode} onChange={(e) => setVoucherCode(e.target.value.toUpperCase())} placeholder="VOUCHER2026" className={inputCls() + " pl-8 font-mono"} />
                </div>
              </div>
            </SectionCard>

            {/* Summary */}
            <div className="bg-neutral-light border border-neutral rounded-2xl p-4 space-y-2.5 shadow-sm">
              <p className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider mb-3">Tóm tắt</p>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-dark">Tạm tính ({cart.reduce((s, c) => s + c.quantity, 0)} sp)</span>
                <span className="font-medium">{formatVND(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[13px]">
                <span className="text-neutral-dark">Phí ship</span>
                <span>{shippingFeeNum > 0 ? formatVND(shippingFeeNum) : <span className="text-emerald-600 font-medium">Miễn phí</span>}</span>
              </div>
              <div className="border-t border-neutral pt-2.5 flex justify-between">
                <span className="text-[14px] font-bold text-primary">Tổng cộng</span>
                <span className="text-[16px] font-bold text-accent">{formatVND(total)}</span>
              </div>
              {(selectedUser || (customerTab === "new" && newCustomer.fullName)) && (
                <div className="pt-2.5 border-t border-neutral">
                  <div className="flex items-center gap-1.5 text-[12px]">
                    <User size={11} className="text-neutral-dark shrink-0" />
                    <span className="font-medium text-primary">{selectedUser?.fullName ?? newCustomer.fullName}</span>
                    {customerTab === "new" && <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600">Mới</span>}
                  </div>
                  {selectedAddress && (
                    <div className="flex items-start gap-1.5 text-[12px] text-neutral-dark mt-1">
                      <MapPin size={11} className="shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {selectedAddress.detailAddress}, {selectedAddress.ward.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {submitError && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-promotion-light border border-promotion/30 text-promotion text-[12px]">
                <AlertCircle size={13} /> {submitError}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 bg-accent hover:bg-accent-hover text-white text-[14px] font-semibold rounded-xl cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Đang tạo...
                </>
              ) : (
                <>
                  <CheckCircle2 size={16} /> Tạo đơn hàng
                </>
              )}
            </button>
            <button
              onClick={() => router.back()}
              disabled={submitting}
              className="w-full py-2.5 border border-neutral rounded-xl text-[13px] text-primary hover:bg-neutral-light-active cursor-pointer disabled:opacity-50"
            >
              Huỷ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ADDRESS FORM sub-component
// ─────────────────────────────────────────────────────────────────────────────

interface AddressFormProps {
  provinces: Province[];
  wards: Ward[];
  addr: { contactName: string; phone: string; provinceId: string; wardId: string; detailAddress: string };
  setAddr: (fn: (p: any) => any) => void;
  errors: Record<string, string>;
  showNamePhone?: boolean; // Khách mới thì form này cũng có name/phone
}

function AddressForm({ provinces, wards, addr, setAddr, errors, showNamePhone }: AddressFormProps) {
  const rsStyles = () => ({
    control: (b: any) => ({
      ...b,
      borderRadius: "0.75rem",
      borderColor: "#d1d5db",
      boxShadow: "none",
      background: "var(--color-neutral-light,#fafafa)",
      "&:hover": { borderColor: "#9ca3af" },
      minHeight: "38px",
    }),
    valueContainer: (b: any) => ({ ...b, padding: "0.25rem 0.75rem" }),
    input: (b: any) => ({ ...b, margin: 0, padding: 0, fontSize: "13px" }),
    menu: (b: any) => ({ ...b, borderRadius: "0.75rem", marginTop: 4, boxShadow: "0 10px 15px -3px rgba(0,0,0,.1)", zIndex: 9999 }),
    option: (b: any, s: any) => ({ ...b, background: s.isSelected ? "#6366f1" : s.isFocused ? "#f3f4f6" : "white", color: s.isSelected ? "white" : "#111827", fontSize: "13px", padding: "8px 12px" }),
    singleValue: (b: any) => ({ ...b, fontSize: "13px" }),
    placeholder: (b: any) => ({ ...b, fontSize: "13px", color: "#9ca3af" }),
  });

  function inputCls(err?: boolean) {
    return `w-full px-3 py-2 text-[13px] bg-neutral-light border rounded-xl text-primary placeholder:text-neutral-dark/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all ${err ? "border-promotion" : "border-neutral"}`;
  }
  function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
      <label className="text-[11px] font-semibold text-neutral-dark uppercase tracking-wider block mb-1.5">
        {children}
        {required && <span className="text-promotion ml-0.5">*</span>}
      </label>
    );
  }

  return (
    <div className="space-y-3 p-4 rounded-xl border border-accent/20 bg-accent/5">
      {showNamePhone && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Họ tên người nhận</Label>
            <input value={addr.contactName} onChange={(e) => setAddr((p: any) => ({ ...p, contactName: e.target.value }))} placeholder="Nguyễn Văn A" className={inputCls(!!errors.contactName)} />
            {errors.contactName && <p className="text-[11px] text-promotion mt-1">{errors.contactName}</p>}
          </div>
          <div>
            <Label required>SĐT người nhận</Label>
            <input value={addr.phone} onChange={(e) => setAddr((p: any) => ({ ...p, phone: e.target.value }))} placeholder="0912345678" className={inputCls(!!errors.phone)} />
            {errors.phone && <p className="text-[11px] text-promotion mt-1">{errors.phone}</p>}
          </div>
        </div>
      )}
      {!showNamePhone && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label required>Họ tên</Label>
            <input value={addr.contactName} onChange={(e) => setAddr((p: any) => ({ ...p, contactName: e.target.value }))} placeholder="Nguyễn Văn A" className={inputCls(!!errors.contactName)} />
            {errors.contactName && <p className="text-[11px] text-promotion mt-1">{errors.contactName}</p>}
          </div>
          <div>
            <Label required>Số điện thoại</Label>
            <input value={addr.phone} onChange={(e) => setAddr((p: any) => ({ ...p, phone: e.target.value }))} placeholder="0912345678" className={inputCls(!!errors.phone)} />
            {errors.phone && <p className="text-[11px] text-promotion mt-1">{errors.phone}</p>}
          </div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label required>Tỉnh / Thành phố</Label>
          <Select
            options={provinces.map((p) => ({ value: p.id, label: p.fullName }))}
            value={addr.provinceId ? { value: addr.provinceId, label: provinces.find((p) => p.id === addr.provinceId)?.fullName ?? "" } : null}
            onChange={(o: any) => setAddr((p: any) => ({ ...p, provinceId: o?.value ?? "", wardId: "" }))}
            placeholder="— Chọn tỉnh —"
            isSearchable
            styles={rsStyles()}
            noOptionsMessage={() => "Không tìm thấy"}
          />
          {errors.province && <p className="text-[11px] text-promotion mt-1">{errors.province}</p>}
        </div>
        <div>
          <Label required>Phường / Xã</Label>
          <Select
            options={wards.map((w) => ({ value: w.id, label: w.fullName }))}
            value={addr.wardId ? { value: addr.wardId, label: wards.find((w) => w.id === addr.wardId)?.fullName ?? "" } : null}
            onChange={(o: any) => setAddr((p: any) => ({ ...p, wardId: o?.value ?? "" }))}
            placeholder={addr.provinceId ? "— Chọn phường/xã —" : "Chọn tỉnh trước"}
            isDisabled={!addr.provinceId}
            isSearchable
            styles={rsStyles()}
            noOptionsMessage={() => "Không tìm thấy"}
          />
          {errors.ward && <p className="text-[11px] text-promotion mt-1">{errors.ward}</p>}
        </div>
      </div>
      <div>
        <Label required>Địa chỉ chi tiết</Label>
        <input
          value={addr.detailAddress}
          onChange={(e) => setAddr((p: any) => ({ ...p, detailAddress: e.target.value }))}
          placeholder="Số nhà, tên đường..."
          className={inputCls(!!errors.detailAddress)}
        />
        {errors.detailAddress && <p className="text-[11px] text-promotion mt-1">{errors.detailAddress}</p>}
      </div>
    </div>
  );
}
