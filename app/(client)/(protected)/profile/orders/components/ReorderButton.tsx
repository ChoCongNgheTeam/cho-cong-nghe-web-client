"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";

interface ReorderButtonProps {
  orderId: string;
  onReorderSuccess?: () => void;
  onBeforeNavigate?: () => Promise<void> | void;
}

interface ReorderResponse {
  success: boolean;
  data: {
    addedCount: number;
    outOfStockCount: number;
  };
  message: string;
}

export default function ReorderButton({ orderId, onReorderSuccess, onBeforeNavigate }: ReorderButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { warning, error: toastError } = useToasty();

  const handleReorder = async () => {
    setLoading(true);

    try {
      const res: ReorderResponse = await apiRequest.post(`/orders/my/${orderId}/reorder`);

      const { addedCount, outOfStockCount } = res.data;

      if (addedCount > 0) {
        // Refetch cart trước khi navigate → trang /cart có data ngay, không cần F5
        await onBeforeNavigate?.();

        if (outOfStockCount > 0) {
          warning(`Đã thêm ${addedCount} sản phẩm. ${outOfStockCount} sản phẩm đã hết hàng.`);
        }
        router.push("/cart");
      } else {
        toastError("Tất cả sản phẩm trong đơn đã hết hàng.");
      }

      onReorderSuccess?.();
    } catch (err: any) {
      toastError("Không thể mua lại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleReorder}
      disabled={loading}
      className="h-9 flex items-center gap-1.5 bg-promotion hover:bg-promotion-hover text-white 
        px-6 rounded-lg text-sm font-medium transition-colors cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <RotateCcw className="w-4 h-4" />}
      {loading ? "Đang xử lý..." : "Mua lại"}
    </button>
  );
}
