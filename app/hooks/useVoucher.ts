"use client";

import { useState, useEffect, useCallback } from "react";
import apiRequest from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { sortVouchers } from "@/helpers/sortVouchers";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface VoucherTarget {
  id: string;
  targetType: "ALL" | "BRAND" | "CATEGORY" | "PRODUCT";
  targetId: string;
}

interface CartItem {
  productId: string;
  categoryId?: string;
  brandId?: string;
  categoryPath?: string[];
  /** Thành tiền item (unit_price × quantity, sau promotion). Dùng để tính eligible subtotal. */
  itemTotal?: number;
}

export interface Voucher {
  id: string;
  code: string;
  description: string;
  discountType: "DISCOUNT_PERCENT" | "DISCOUNT_FIXED";
  discountValue: number;
  minOrderValue: number;
  maxUses?: number;
  maxUsesPerUser?: number;
  usesCount: number;
  priority?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  isExpired: boolean;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
  targets?: VoucherTarget[];
  maxDiscountValue?: number;
  isPrivate?: boolean;
  remainingUses?: number;
}

export interface AppliedVoucher {
  code: string;
  value: number;
  id: string;
}

/**
 * Kết quả validate target của 1 voucher.
 * - ok: true  → voucher áp dụng được cho giỏ hàng hiện tại
 * - ok: false → bị disable, reason chứa message hiển thị cho user
 */
interface EligibleResult {
  ok: boolean;
  reason?: string;
}

interface VoucherListResponse {
  data: Voucher[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

interface ValidateResponse {
  data: { discount: number; voucher: { id: string } } | null;
  message?: string;
}

interface UseVoucherOptions {
  cartTotal?: number;
  cartItems?: CartItem[];
  initialCode?: string;
  initialValue?: number;
  initialId?: string;
}

interface UseVoucherReturn {
  // ── List state ────────────────────────────────────────────────────────────
  vouchers: Voucher[];
  isLoadingList: boolean;
  /** true khi đang chạy batch-validate targets sau khi fetch list */
  isValidatingTargets: boolean;
  fetchVouchers: () => Promise<void>;

  // ── Input state ───────────────────────────────────────────────────────────
  inputCode: string;
  setInputCode: (code: string) => void;
  isApplying: boolean;
  error: string;
  isSuccess: boolean;

  // ── Applied voucher ───────────────────────────────────────────────────────
  applied: AppliedVoucher;
  applyByInput: () => Promise<void>;
  applyFromList: (voucher: Voucher) => void;
  clearVoucher: () => void;

  // ── Copy helper ───────────────────────────────────────────────────────────
  copiedCode: string;
  copyCode: (code: string) => void;

  // ── Helpers ───────────────────────────────────────────────────────────────
  calculateDiscount: (voucher: Voucher) => number;
  canUseVoucher: (voucher: Voucher) => boolean;
  /** Lý do tại sao voucher bị disable (bao gồm cả "không hợp sản phẩm") */
  getDisabledReason: (voucher: Voucher) => string | null;
  formatPrice: (price: number) => string;
  formatDate: (dateString?: string) => string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useVoucher({ cartTotal = 0, cartItems = [], initialCode = "", initialValue = 0, initialId = "" }: UseVoucherOptions = {}): UseVoucherReturn {
  // ── List ──────────────────────────────────────────────────────────────────
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isValidatingTargets, setIsValidatingTargets] = useState(false);

  /**
   * Map voucherId → kết quả validate target từ server.
   * Chỉ được set sau khi fetchVouchers() chạy xong batch-validate.
   * Voucher chưa có trong map → chưa validate xong → coi như ok (lạc quan)
   * để tránh flash disable ngay khi đang load.
   */
  const [eligibleMap, setEligibleMap] = useState<Record<string, EligibleResult>>({});

  // ── Input ─────────────────────────────────────────────────────────────────
  const [inputCode, setInputCodeRaw] = useState(initialCode);
  const [isApplying, setIsApplying] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(!!initialCode);

  const { isAuthenticated } = useAuth();

  // ── Applied ───────────────────────────────────────────────────────────────
  const [applied, setApplied] = useState<AppliedVoucher>({
    code: initialCode,
    value: initialValue,
    id: initialId,
  });

  // ── Copy ──────────────────────────────────────────────────────────────────
  const [copiedCode, setCopiedCode] = useState("");

  // ── Sync initial values ───────────────────────────────────────────────────
  useEffect(() => {
    if (initialCode) {
      setInputCodeRaw(initialCode);
      setApplied({ code: initialCode, value: initialValue, id: initialId });
      setIsSuccess(true);
    }
  }, [initialCode, initialValue, initialId]);

  // ── Helpers ───────────────────────────────────────────────────────────────

  const formatPrice = useCallback((price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫", []);

  const formatDate = useCallback((dateString?: string): string | null => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString("vi-VN");
  }, []);

  /**
   * Tính discount client-side (chỉ dùng cho hiển thị preview trong list).
   * Discount thực tế luôn lấy từ server khi apply.
   */
  const calculateDiscount = useCallback(
    (voucher: Voucher, items: CartItem[] = cartItems): number => {
      const targets = voucher.targets ?? [];
      const hasAll = targets.length === 0 || targets.some((t) => t.targetType === "ALL");

      let base = cartTotal;
      if (!hasAll) {
        const hasItemTotals = items.some((item) => (item.itemTotal ?? 0) > 0);
        if (hasItemTotals) {
          base = items
            .filter((item) =>
              targets.some((t) => {
                if (!t.targetId) return false;
                switch (t.targetType) {
                  case "PRODUCT":
                    return t.targetId === item.productId;
                  case "BRAND":
                    return t.targetId === item.brandId;
                  case "CATEGORY":
                    return item.categoryPath?.includes(t.targetId) || item.categoryId === t.targetId;
                  default:
                    return false;
                }
              }),
            )
            .reduce((sum, item) => sum + (item.itemTotal ?? 0), 0);
        }
      }

      if (voucher.discountType === "DISCOUNT_FIXED") {
        return Math.min(voucher.discountValue, base);
      }

      const raw = Math.floor((base * voucher.discountValue) / 100);
      return voucher.maxDiscountValue ? Math.min(raw, voucher.maxDiscountValue) : raw;
    },
    [cartTotal, cartItems],
  );

  /**
   * Check xem voucher có thể dùng không, bao gồm:
   * 1. Các điều kiện cơ bản (isAvailable, isExpired, isActive, minOrderValue)
   * 2. Kết quả validate target từ server (eligibleMap)
   */
  const canUseVoucher = useCallback(
    (voucher: Voucher): boolean => {
      const basicOk = voucher.isAvailable && !voucher.isExpired && voucher.isActive && cartTotal >= voucher.minOrderValue;

      if (!basicOk) return false;

      // Nếu chưa có kết quả validate → lạc quan (true) để tránh flash
      const eligible = eligibleMap[voucher.id];
      if (eligible === undefined) return true;

      return eligible.ok;
    },
    [cartTotal, eligibleMap],
  );

  /**
   * Trả về lý do tại sao voucher bị disable, hoặc null nếu có thể dùng.
   * Dùng để hiển thị message dưới card voucher.
   */
  const getDisabledReason = useCallback(
    (voucher: Voucher): string | null => {
      if (voucher.isExpired) return "Mã đã hết hạn";
      if (!voucher.isActive) return "Mã không còn hiệu lực";
      if (!voucher.isAvailable) return "Mã đã hết lượt";
      if (cartTotal < voucher.minOrderValue) return `Cần thêm ${formatPrice(voucher.minOrderValue - cartTotal)} để dùng mã`;

      // Check target eligibility từ server
      const eligible = eligibleMap[voucher.id];
      if (eligible !== undefined && !eligible.ok) {
        return eligible.reason ?? "Voucher không áp dụng cho sản phẩm trong giỏ hàng";
      }

      return null;
    },
    [cartTotal, eligibleMap, formatPrice],
  );

  // ── Fetch list + batch-validate targets ───────────────────────────────────

  const fetchVouchers = useCallback(async () => {
    setIsLoadingList(true);
    try {
      // 1. Fetch public vouchers
      const publicRes = await apiRequest.get<VoucherListResponse>("/vouchers", {
        params: { cartTotal, limit: 20 },
        noAuth: true,
      });
      let allVouchers: Voucher[] = publicRes.data ?? [];

      // 2. Nếu đã login → fetch thêm private vouchers
      if (isAuthenticated) {
        try {
          const privateRes = await apiRequest.get<{ data: any[] }>("/vouchers/my-vouchers");
          const privateVouchers: Voucher[] = (privateRes.data ?? []).map((v: any) => ({
            id: v.id,
            code: v.code,
            description: v.description ?? "",
            discountType: v.discountType,
            discountValue: Number(v.discountValue),
            minOrderValue: Number(v.minOrderValue),
            maxDiscountValue: v.maxDiscountValue ? Number(v.maxDiscountValue) : undefined,
            maxUses: v.maxUses ?? undefined,
            maxUsesPerUser: v.maxUsesPerUser ?? undefined,
            usesCount: v.usedCount ?? v.usesCount ?? 0,
            remainingUses: v.remainingUses ?? undefined,
            startDate: v.startDate ?? undefined,
            endDate: v.endDate ?? undefined,
            isActive: v.isActive ?? true,
            isExpired: v.isExpired ?? false,
            isAvailable: v.canUse ?? v.isAvailable ?? true,
            isPrivate: true,
          }));

          const publicCodes = new Set(allVouchers.map((v) => v.code));
          const uniquePrivate = privateVouchers.filter((v) => !publicCodes.has(v.code));
          allVouchers = [...uniquePrivate, ...allVouchers];
        } catch {
          // silent
        }
      }

      // 3. Sort
      const sorted = sortVouchers(allVouchers, cartTotal);
      setVouchers(sorted);

      // 4. Batch-validate targets — chỉ validate các voucher "cơ bản" ok
      //    (tránh gọi API cho voucher đã expired/hết lượt rõ ràng)
      const toValidate = sorted.filter((v) => v.isActive && !v.isExpired && v.isAvailable && cartTotal >= v.minOrderValue);

      if (toValidate.length > 0 && cartItems.length > 0) {
        setIsValidatingTargets(true);

        const results = await Promise.allSettled(
          toValidate.map((v) =>
            apiRequest.post<ValidateResponse>("/vouchers/validate", {
              code: v.code,
              orderTotal: cartTotal,
              cartItems,
            }),
          ),
        );

        const newMap: Record<string, EligibleResult> = {};

        toValidate.forEach((v, idx) => {
          const result = results[idx];

          if (result.status === "fulfilled") {
            const res = result.value;
            // Server trả data: null nghĩa là validate fail
            if (res.data === null) {
              newMap[v.id] = {
                ok: false,
                reason: res.message ?? "Voucher không áp dụng cho sản phẩm trong giỏ hàng",
              };
            } else {
              newMap[v.id] = { ok: true };
            }
          } else {
            // Network error hoặc 4xx từ server
            const errMsg = (result.reason as any)?.response?.data?.message ?? "Voucher không áp dụng cho sản phẩm trong giỏ hàng";
            newMap[v.id] = { ok: false, reason: errMsg };
          }
        });

        setEligibleMap(newMap);
        setIsValidatingTargets(false);
      } else {
        // Không có gì để validate → reset map
        setEligibleMap({});
      }
    } catch {
      setVouchers([]);
      setEligibleMap({});
    } finally {
      setIsLoadingList(false);
    }
  }, [cartTotal, cartItems, isAuthenticated]);

  // ── Public: apply from text input ────────────────────────────────────────

  const applyByInput = useCallback(async () => {
    const normalized = inputCode.trim().toUpperCase();
    if (!normalized) {
      setError("Vui lòng nhập mã voucher");
      return;
    }

    setIsApplying(true);
    try {
      const res = await apiRequest.post<ValidateResponse>("/vouchers/validate", {
        code: normalized,
        orderTotal: cartTotal,
        cartItems,
      });
      if (!res.data) {
        setError(res.message ?? "Mã không hợp lệ");
        setIsSuccess(false);
        return;
      }
      setApplied({ code: normalized, value: res.data.discount, id: res.data.voucher.id });
      setError("");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Mã voucher không tồn tại hoặc không hợp lệ");
      setIsSuccess(false);
    } finally {
      setIsApplying(false);
    }
  }, [inputCode, cartTotal, cartItems]);

  // ── Public: clear ─────────────────────────────────────────────────────────

  const clearVoucher = useCallback(() => {
    setInputCodeRaw("");
    setError("");
    setIsSuccess(false);
    setApplied({ code: "", value: 0, id: "" });
  }, []);

  // ── Public: apply by clicking from list ───────────────────────────────────

  const applyFromList = useCallback(
    async (voucher: Voucher) => {
      if (applied.code === voucher.code) {
        clearVoucher();
        return;
      }
      if (!canUseVoucher(voucher)) return;

      setIsApplying(true);
      try {
        const res = await apiRequest.post<ValidateResponse>("/vouchers/validate", {
          code: voucher.code,
          orderTotal: cartTotal,
          cartItems,
        });
        if (!res.data) {
          setError(res.message ?? "Mã không áp dụng được");
          return;
        }
        setInputCodeRaw(voucher.code);
        setError("");
        setIsSuccess(true);
        setApplied({ code: voucher.code, value: res.data.discount, id: res.data.voucher.id });
      } catch (err: any) {
        setError(err?.response?.data?.message ?? "Không thể áp dụng voucher này");
      } finally {
        setIsApplying(false);
      }
    },
    [applied.code, canUseVoucher, clearVoucher, cartTotal, cartItems],
  );

  // ── Copy ──────────────────────────────────────────────────────────────────

  const copyCode = useCallback((code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }, []);

  // ── setInputCode (uppercase + reset error) ────────────────────────────────

  const setInputCode = useCallback((val: string) => {
    setInputCodeRaw(val.toUpperCase());
    setError("");
    setIsSuccess(false);
  }, []);

  return {
    vouchers,
    isLoadingList,
    isValidatingTargets,
    fetchVouchers,

    inputCode,
    setInputCode,
    isApplying,
    error,
    isSuccess,

    applied,
    applyByInput,
    applyFromList,
    clearVoucher,

    copiedCode,
    copyCode,

    calculateDiscount,
    canUseVoucher,
    getDisabledReason,
    formatPrice,
    formatDate,
  };
}
