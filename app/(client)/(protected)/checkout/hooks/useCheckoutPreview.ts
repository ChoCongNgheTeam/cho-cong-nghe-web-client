"use client";

import { useCallback, useEffect, useState } from "react";
import { logError } from "@/lib/monitoring/log-error";
import { getCheckoutPreview } from "../_lib/api";
import type { PreviewData } from "../_lib";

interface UseCheckoutPreviewArgs {
  activeAddressId: string | null;
  selectedPaymentMethodId: string;
  voucherId: string;
  cartItemIds: string[];
}

export function useCheckoutPreview({ activeAddressId, selectedPaymentMethodId, voucherId, cartItemIds }: UseCheckoutPreviewArgs) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);

  const fetchPreview = useCallback(async () => {
    if (!activeAddressId || !selectedPaymentMethodId) return;
    try {
      const params = new URLSearchParams({
        paymentMethodId: selectedPaymentMethodId,
        shippingAddressId: activeAddressId,
        ...(voucherId ? { voucherId } : {}),
      });
      cartItemIds.forEach((id) => params.append("cartItemIds[]", id));
      const data = await getCheckoutPreview(params);
      setPreviewData(data);
    } catch (err) {
      logError("useCheckoutPreview: fetch checkout preview failed", err, { activeAddressId, selectedPaymentMethodId });
    }
  }, [activeAddressId, selectedPaymentMethodId, voucherId, cartItemIds]);

  useEffect(() => {
    // Fetch-on-dependency-change hợp lệ (phí ship/giảm giá tính từ server) —
    // rule set-state-in-effect false-positive với pattern này, xem facebook/react#34743.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPreview();
  }, [fetchPreview]);

  return { previewData };
}
