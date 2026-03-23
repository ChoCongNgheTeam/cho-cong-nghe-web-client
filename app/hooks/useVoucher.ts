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
  maxDiscountValue?: number; // ← thêm dòng này
  isPrivate?: boolean;
  remainingUses?: number;
}

export interface AppliedVoucher {
  code: string;
  value: number;
  id: string;
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

interface VoucherDetailResponse {
  data: Voucher;
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
  formatPrice: (price: number) => string;
  formatDate: (dateString?: string) => string | null;
}

// ─── Hook ──────────────────────────────────────────────────────────────────

export function useVoucher({ cartTotal = 0, cartItems = [], initialCode = "", initialValue = 0, initialId = "" }: UseVoucherOptions = {}): UseVoucherReturn {
  // ── List ──────────────────────────────────────────────────────────────────
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(false);

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

  // ── Sync initial values (ví dụ khi load từ localStorage) ─────────────────
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
   * Tính discount của voucher dựa trên eligible subtotal.
   * - Nếu voucher có targets (không phải ALL) → tính trên subtotal các item match target
   * - Nếu không → tính trên toàn bộ cartTotal
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

  const canUseVoucher = useCallback((voucher: Voucher): boolean => voucher.isAvailable && !voucher.isExpired && voucher.isActive && cartTotal >= voucher.minOrderValue, [cartTotal]);

  // ── Fetch list ────────────────────────────────────────────────────────────

  const fetchVouchers = useCallback(async () => {
    setIsLoadingList(true);
    try {
      // 1. Luôn fetch public vouchers
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
            isPrivate: true, // ← flag để sort ưu tiên
          }));

          // Merge: private lên đầu, loại trùng code với public
          const publicCodes = new Set(allVouchers.map((v) => v.code));
          const uniquePrivate = privateVouchers.filter((v) => !publicCodes.has(v.code));
          allVouchers = [...uniquePrivate, ...allVouchers];
        } catch {
          // silent — không có private voucher thì dùng public thôi
        }
      }

      // 3. Sort theo rule production
      const sorted = sortVouchers(allVouchers, cartTotal);
      setVouchers(sorted);
    } catch {
      setVouchers([]);
    } finally {
      setIsLoadingList(false);
    }
  }, [cartTotal, isAuthenticated]);

  // ── Internal: validate & apply a Voucher object ───────────────────────────

  const validateAndApply = useCallback(
    (voucher: Voucher) => {
      if (voucher.isExpired) {
        setError("Mã voucher đã hết hạn");
        setIsSuccess(false);
        return false;
      }
      if (!voucher.isActive) {
        setError("Mã voucher không còn hiệu lực");
        setIsSuccess(false);
        return false;
      }
      if (cartTotal < voucher.minOrderValue) {
        setError(`Đơn tối thiểu ${formatPrice(voucher.minOrderValue)} để dùng mã này`);
        setIsSuccess(false);
        return false;
      }
      if (!voucher.isAvailable) {
        setError("Mã voucher đã hết lượt sử dụng");
        setIsSuccess(false);
        return false;
      }

      const discountValue = calculateDiscount(voucher);
      setInputCodeRaw(voucher.code);
      setError("");
      setIsSuccess(true);
      setApplied({
        code: voucher.code,
        value: discountValue,
        id: voucher.id,
      });
      return true;
    },
    [cartTotal, calculateDiscount, formatPrice],
  );

  // ── Public: apply from text input (gọi API /vouchers/code/:code) ──────────

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
    formatPrice,
    formatDate,
  };
}
