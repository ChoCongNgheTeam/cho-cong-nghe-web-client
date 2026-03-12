import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { Order } from "../../type/order";
import { statusConfig } from "./Constants";
import CancelOrderButton from "./CancelOrderButton";
import ReorderButton from "./ReorderButton";

interface OrderCardProps {
  order: Order;
  onViewDetail: () => void;
  onCancelSuccess: () => void;
  onReorderSuccess: () => void;
  onBeforeNavigate: () => Promise<void> | void;
}

export default function OrderCard({
  order,
  onViewDetail,
  onCancelSuccess,
  onReorderSuccess,
  onBeforeNavigate,
}: OrderCardProps) {
  const status = statusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-primary-dark",
    bgColor: "bg-neutral-light-active",
  };

  const showReorder = ["DELIVERED", "CANCELLED"].includes(order.orderStatus);
  const showCancel = ["PENDING", "PROCESSING"].includes(order.orderStatus);

  return (
    <div className="bg-neutral-light rounded-lg border border-neutral overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col justify-between gap-2 px-6 py-3 bg-neutral-light-active border-b border-neutral">
        <div className="flex justify-between">
          <div className="flex-col font-medium text-primary">
            <h2>Đơn hàng: #{order.orderCode}</h2>
          </div>
          <span
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status.label}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm text-primary-dark">
          <span>
            Ngày đặt:{" "}
            <span className="text-primary">
              {new Date(order.orderDate).toLocaleDateString("vi-VN")}
            </span>
          </span>
          <span className="text-primary">•</span>
          <span>{order.paymentMethod.description}</span>
          <span className="text-primary">•</span>
          <span>{order.orderItems.length} sản phẩm</span>
        </div>
      </div>

      {/* Product List */}
      <div className="divide-y divide-neutral">
        {order.orderItems.map((item) => {
          const imageUrl =
            item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
          const attrs = item.productVariant?.variantAttributes
            ?.map((a) => a.attributeOption.value)
            .join(" · ");

          return (
            <div key={item.id} className="flex gap-4 px-6 py-4">
              <div className="relative w-16 h-16 shrink-0 bg-neutral-light-active overflow-hidden">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={item.productVariant?.product?.name ?? ""}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-medium text-primary mb-1 line-clamp-2">
                  {item.productVariant?.product?.name}
                </h3>
                {attrs && (
                  <p className="text-sm text-primary-dark mb-0.5">{attrs}</p>
                )}
                <p className="text-sm text-primary-dark">
                  Số lượng: {item.quantity}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="font-semibold text-primary">
                  {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                </p>
                {Number(item.productVariant?.price) >
                  Number(item.unitPrice) && (
                  <p className="text-sm line-through text-primary-dark">
                    {Number(item.productVariant?.price).toLocaleString("vi-VN")}
                    ₫
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-neutral-light-active border-t border-neutral">
        <div className="flex gap-4 mb-2 justify-between">
          <button
            onClick={onViewDetail}
            className="h-9 flex items-center gap-1 px-3 rounded-lg border border-neutral
              text-neutral-dark hover:bg-neutral-light transition-colors cursor-pointer"
          >
            Xem chi tiết
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="text-right">
            <span className="text-primary-dark text-sm">Tổng tiền:</span>
            <span className="text-promotion font-semibold ml-2 text-lg">
              {Number(order.totalAmount).toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {(showReorder || showCancel) && (
          <div className="flex gap-2 justify-end">
            {showReorder && (
              <ReorderButton
                orderId={order.id}
                onReorderSuccess={onReorderSuccess}
                onBeforeNavigate={onBeforeNavigate}
              />
            )}
            {showCancel && (
              <CancelOrderButton
                orderId={order.id}
                onCancelSuccess={onCancelSuccess}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}