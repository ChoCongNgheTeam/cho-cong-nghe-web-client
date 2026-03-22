"use client";

import { useState, useEffect, useCallback } from "react";
import apiRequest from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────

export interface VoucherTarget {
   id: string;
   targetType: "ALL" | "BRAND" | "CATEGORY" | "PRODUCT";
   targetId: string;
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

interface UseVoucherOptions {
   /** Tổng tiền giỏ hàng để tính discount và kiểm tra điều kiện */
   cartTotal?: number;
   /** Voucher code đang được áp dụng từ bên ngoài (ví dụ: load từ localStorage) */
   initialCode?: string;
   /** Voucher value đang được áp dụng từ bên ngoài */
   initialValue?: number;
   /** Voucher id đang được áp dụng từ bên ngoài */
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

export function useVoucher({
   cartTotal = 0,
   initialCode = "",
   initialValue = 0,
   initialId = "",
}: UseVoucherOptions = {}): UseVoucherReturn {
   // ── List ──────────────────────────────────────────────────────────────────
   const [vouchers, setVouchers] = useState<Voucher[]>([]);
   const [isLoadingList, setIsLoadingList] = useState(false);

   // ── Input ─────────────────────────────────────────────────────────────────
   const [inputCode, setInputCodeRaw] = useState(initialCode);
   const [isApplying, setIsApplying] = useState(false);
   const [error, setError] = useState("");
   const [isSuccess, setIsSuccess] = useState(!!initialCode);

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

   const formatPrice = useCallback(
      (price: number) => new Intl.NumberFormat("vi-VN").format(price) + "₫",
      [],
   );

   const formatDate = useCallback((dateString?: string): string | null => {
      if (!dateString) return null;
      return new Date(dateString).toLocaleDateString("vi-VN");
   }, []);

   const calculateDiscount = useCallback(
      (voucher: Voucher): number => {
         if (voucher.discountType === "DISCOUNT_FIXED")
            return voucher.discountValue;
         const percent = Math.floor((cartTotal * voucher.discountValue) / 100);
         return voucher.maxDiscountValue
            ? Math.min(percent, voucher.maxDiscountValue)
            : percent;
      },
      [cartTotal],
   );

   const canUseVoucher = useCallback(
      (voucher: Voucher): boolean =>
         voucher.isAvailable &&
         !voucher.isExpired &&
         voucher.isActive &&
         cartTotal >= voucher.minOrderValue,
      [cartTotal],
   );

   // ── Fetch list ────────────────────────────────────────────────────────────

   const fetchVouchers = useCallback(async () => {
      setIsLoadingList(true);
      try {
         const res = await apiRequest.get<VoucherListResponse>("/vouchers", {
            noAuth: true,
         });
         console.log(res);

         setVouchers(res.data);
      } catch {
         setVouchers([]);
      } finally {
         setIsLoadingList(false);
      }
   }, []);

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
            setError(
               `Đơn tối thiểu ${formatPrice(voucher.minOrderValue)} để dùng mã này`,
            );
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
         const res = await apiRequest.get<VoucherDetailResponse>(
            `/vouchers/code/${normalized}`,
            { noAuth: true },
         );
         console.log(res);
         validateAndApply(res.data);
      } catch {
         setError("Mã voucher không tồn tại hoặc không hợp lệ");
         setIsSuccess(false);
      } finally {
         setIsApplying(false);
      }
   }, [inputCode, validateAndApply]);

   // ── Public: apply by clicking from list ───────────────────────────────────

   const applyFromList = useCallback(
      (voucher: Voucher) => {
         // Toggle off nếu đang chọn cùng voucher
         if (applied.code === voucher.code) {
            clearVoucher();
            return;
         }
         if (!canUseVoucher(voucher)) return;
         validateAndApply(voucher);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [applied.code, canUseVoucher, validateAndApply],
   );

   // ── Public: clear ─────────────────────────────────────────────────────────

   const clearVoucher = useCallback(() => {
      setInputCodeRaw("");
      setError("");
      setIsSuccess(false);
      setApplied({ code: "", value: 0, id: "" });
   }, []);

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
