"use client";

import { useState } from "react";
import type { useRouter } from "next/navigation";
import { logError } from "@/lib/monitoring/log-error";
import { createAddress, deleteAddress, placeOrder } from "../_lib/api";
import type { CheckoutPaymentInfo } from "../_lib/api";
import type { Province, Ward, SavedAddress } from "../_lib";

interface ApiErrorShape {
  response?: { data?: { code?: string; message?: string } };
  message?: string;
}

function isApiErrorShape(err: unknown): err is ApiErrorShape {
  return typeof err === "object" && err !== null;
}

export function parseCheckoutError(err: unknown): string {
  const shape = isApiErrorShape(err) ? err : {};
  const data = shape.response?.data ?? {};
  const code = data.code ?? "";
  const message = data.message ?? shape.message ?? "";
  const lower = message.toLowerCase();

  if (code === "OUT_OF_STOCK" || lower.includes("out of stock") || lower.includes("hết hàng")) return "Một số sản phẩm trong đơn đã hết hàng. Vui lòng quay lại giỏ hàng và cập nhật lại.";
  if (code === "VOUCHER_EXPIRED" || (lower.includes("voucher") && lower.includes("expired"))) return "Voucher đã hết hạn. Vui lòng chọn voucher khác hoặc đặt hàng không dùng voucher.";
  if (code === "VOUCHER_USED" || (lower.includes("voucher") && lower.includes("used"))) return "Voucher này đã được sử dụng. Vui lòng chọn voucher khác.";
  if (code === "VOUCHER_INVALID" || (lower.includes("voucher") && lower.includes("invalid"))) return "Voucher không hợp lệ. Vui lòng kiểm tra lại mã giảm giá.";
  if (code === "PAYMENT_FAILED" || (lower.includes("payment") && lower.includes("failed"))) return "Thanh toán thất bại. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.";

  return message || "Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại.";
}

interface Toast {
  error: (msg: string) => void;
}

interface UseCheckoutSubmitArgs {
  router: ReturnType<typeof useRouter>;
  toast: Toast;
  refetchCart: () => Promise<unknown> | void;
  contactName: string;
  contactPhone: string;
  selectedSavedAddress: SavedAddress | null;
  provinceCode: string;
  wardCode: string;
  provinces: Province[];
  wards: Ward[];
  detailAddress: string;
  wantSaveAddress: boolean | null;
  selectedPaymentMethodId: string;
  agreedToTerms: boolean;
  voucherId: string;
}

export function useCheckoutSubmit({
  router,
  toast,
  refetchCart,
  contactName,
  contactPhone,
  selectedSavedAddress,
  provinceCode,
  wardCode,
  provinces,
  wards,
  detailAddress,
  wantSaveAddress,
  selectedPaymentMethodId,
  agreedToTerms,
  voucherId,
}: UseCheckoutSubmitArgs) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [paymentResultModal, setPaymentResultModal] = useState<{
    isOpen: boolean;
    paymentInfo: CheckoutPaymentInfo;
    orderId: string;
  }>({ isOpen: false, paymentInfo: null, orderId: "" });

  const handleCheckoutClick = () => {
    if (!contactName.trim()) {
      toast.error("Vui lòng nhập họ tên người nhận");
      return;
    }
    if (!contactPhone.trim()) {
      toast.error("Vui lòng nhập số điện thoại người nhận");
      return;
    }
    if (!selectedSavedAddress && (!provinceCode || !wardCode || !detailAddress.trim())) {
      toast.error("Vui lòng điền đầy đủ địa chỉ giao hàng");
      return;
    }
    if (!selectedPaymentMethodId) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }
    if (!agreedToTerms) {
      toast.error("Vui lòng đồng ý với điều khoản đặt hàng");
      return;
    }
    setShowConfirmModal(true);
  };

  const navigateAfterOrder = (orderCode: string, orderId: string, paymentMethodCode: string, paymentInfo: CheckoutPaymentInfo) => {
    const m = paymentMethodCode.toUpperCase();
    if (m.includes("COD") || m.includes("BANK_TRANSFER")) {
      router.push(`/order/${orderCode}/payment`);
      return;
    }
    if (m.includes("MOMO") || m.includes("VNPAY") || m.includes("ZALOPAY")) {
      const paymentUrl = paymentInfo && "paymentUrl" in paymentInfo ? paymentInfo.paymentUrl : undefined;
      if (paymentUrl) window.location.href = paymentUrl;
      else toast.error("Không lấy được đường dẫn thanh toán.");
      return;
    }
    if (m.includes("STRIPE") || m.includes("CREDIT_CARD")) {
      if (paymentInfo && "clientSecret" in paymentInfo) {
        setPaymentResultModal({ isOpen: true, paymentInfo, orderId });
      } else {
        logError("useCheckoutSubmit: missing Stripe paymentInfo", { paymentMethodCode, orderId });
        toast.error("Không lấy được thông tin thanh toán Stripe.");
      }
      return;
    }
    router.push(`/order/${orderCode}/payment`);
  };

  const handlePlaceOrder = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    let tempAddressId: string | null = null;

    try {
      let addressId = selectedSavedAddress?.id ?? null;

      if (!addressId) {
        const selectedProvince = provinces.find((p) => p.code === provinceCode);
        const selectedWard = wards.find((w) => w.code === wardCode);

        if (!selectedProvince || !selectedWard) {
          toast.error("Vui lòng chọn đầy đủ Tỉnh/Thành phố và Phường/Xã");
          return;
        }

        try {
          const created = await createAddress({
            contactName,
            phone: contactPhone,
            provinceCode,
            provinceName: selectedProvince.fullName || selectedProvince.name,
            wardCode,
            wardName: selectedWard.fullName || selectedWard.name,
            detailAddress,
            type: "HOME",
            isDefault: false,
          });
          tempAddressId = created?.id ?? null;
          addressId = tempAddressId;
        } catch (addrErr) {
          const shape = isApiErrorShape(addrErr) ? addrErr : {};
          const addrCode = shape.response?.data?.code ?? "";
          const addrMsg = shape.response?.data?.message ?? shape.message ?? "";
          const msgLower = addrMsg.toLowerCase();
          const isDuplicate = addrCode === "DUPLICATE" || msgLower.includes("duplicate") || msgLower.includes("đã được sử dụng");

          if (isDuplicate) {
            const match = addrMsg.match(/field:\s*([^đ]+)/i);
            const fields = match ? match[1].split(",").map((f: string) => f.trim().toLowerCase()) : [];
            const hasPhone = fields.includes("phone");
            const hasAddress = fields.includes("detailaddress");

            if (hasPhone && hasAddress) toast.error("Số điện thoại và địa chỉ này đã được lưu. Vui lòng chọn từ địa chỉ đã lưu.");
            else if (hasPhone) toast.error("Số điện thoại này đã được dùng cho một địa chỉ khác. Vui lòng dùng số khác hoặc chọn từ địa chỉ đã lưu.");
            else if (hasAddress) toast.error("Địa chỉ này đã tồn tại. Vui lòng chọn từ địa chỉ đã lưu.");
            else toast.error("Thông tin địa chỉ bị trùng lặp. Vui lòng chọn từ địa chỉ đã lưu.");
          } else {
            logError("useCheckoutSubmit: create address failed", addrErr);
            toast.error(addrMsg || "Không thể lưu địa chỉ. Vui lòng thử lại.");
          }
          return;
        }
      }

      if (!addressId) {
        toast.error("Không thể xác định địa chỉ giao hàng. Vui lòng thử lại.");
        return;
      }

      const res = await placeOrder({
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: addressId,
        contactName,
        phone: contactPhone,
        ...(voucherId ? { voucherId } : {}),
      });

      if (res?.success) {
        localStorage.removeItem("checkoutData");
        await refetchCart();
        if (tempAddressId && wantSaveAddress === false) {
          deleteAddress(tempAddressId).catch((err) => logError("useCheckoutSubmit: cleanup temp address failed", err));
        }
        navigateAfterOrder(res.data.orderCode, res.data.orderId, res.data.paymentMethodCode, res.data.paymentInfo);
      }
    } catch (err) {
      if (tempAddressId) deleteAddress(tempAddressId).catch((cleanupErr) => logError("useCheckoutSubmit: cleanup temp address after order failure failed", cleanupErr));
      logError("useCheckoutSubmit: place order failed", err);
      toast.error(parseCheckoutError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    showConfirmModal,
    setShowConfirmModal,
    paymentResultModal,
    setPaymentResultModal,
    handleCheckoutClick,
    handlePlaceOrder,
  };
}
