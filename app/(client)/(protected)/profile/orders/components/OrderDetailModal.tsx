import Image from "next/image";
import { MapPin, CreditCard, Package } from "lucide-react";
import { Order } from "../../type/order";
import { statusConfig } from "./Constants";

export default function OrderDetailModal({ order }: { order: Order }) {
  const status = statusConfig[order.orderStatus] ?? {
    label: order.orderStatus,
    color: "text-primary",
    bgColor: "bg-neutral-light-active",
  };

  return (
    <div className="max-h-[75vh] overflow-y-auto custom-scroll px-6 pl-2 mt-6">
      {/* Title */}
      <h2 className="text-lg font-semibold text-primary mb-1 border-b pb-3 border-neutral flex items-center justify-between">
        Chi tiết đơn hàng
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${status.color} ${status.bgColor}`}
        >
          {status.label}
        </span>
      </h2>

      <div className="divide-y divide-neutral space-y-0 p-2">
        {/* Thông tin đơn */}
        <div className="py-4 space-y-1.5 text-sm text-primary">
          <p>
            <span className="font-medium text-primary">Ngày đặt:</span>{" "}
            {new Date(order.orderDate).toLocaleString("vi-VN")}
          </p>
          <p>
            <span className="font-medium text-primary">Thanh toán:</span>{" "}
            {order.paymentMethod.name} —{" "}
            <span
              className={
                order.paymentStatus === "PAID"
                  ? "text-green-600 font-medium"
                  : "text-yellow-600 font-medium"
              }
            >
              {order.paymentStatus === "PAID"
                ? "Đã thanh toán"
                : "Chưa thanh toán"}
            </span>
          </p>
        </div>

        {/* Địa chỉ giao hàng */}
        <div className="py-4">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-2">
            <MapPin size={15} className="text-promotion" />
            Địa chỉ giao hàng
          </p>
          <div className="bg-neutral-light-active rounded-lg px-4 py-3 text-sm text-primary-dark space-y-1">
            <p className="font-medium text-primary">
              {order.shippingContactName}
            </p>
            <p>
              {order.shippingDetail}, {order.shippingWard},{" "}
              {order.shippingProvince}
            </p>
          </div>
        </div>

        {/* Danh sách sản phẩm */}
        <div className="py-4">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-3">
            <Package size={15} className="text-promotion" />
            Sản phẩm ({order.orderItems.length})
          </p>
          <div className="divide-y border rounded-lg overflow-hidden border-neutral">
            {order.orderItems.map((item) => {
              const imageUrl =
                item.productVariant?.product?.img?.[0]?.imageUrl ?? "";
              const attrs = item.productVariant?.variantAttributes
                ?.map((a) => a.attributeOption.value)
                .join(" · ");
              return (
                <div
                  key={item.id}
                  className="flex gap-3 px-4 py-3 bg-neutral-light"
                >
                  <div className="relative w-14 h-14 shrink-0 bg-neutral-light-active overflow-hidden">
                    {imageUrl && (
                      <Image
                        src={imageUrl}
                        alt={item.productVariant?.product?.name ?? ""}
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary line-clamp-2">
                      {item.productVariant?.product?.name}
                    </p>
                    {attrs && (
                      <p className="text-xs text-primary-dark mt-0.5">
                        {attrs}
                      </p>
                    )}
                    <p className="text-xs text-primary-dark mt-0.5">
                      x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary shrink-0">
                    {Number(item.unitPrice).toLocaleString("vi-VN")}₫
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tổng tiền */}
        <div className="py-4">
          <p className="text-sm font-medium text-primary flex items-center gap-1.5 mb-3">
            <CreditCard size={15} className="text-promotion" />
            Thanh toán
          </p>
          <div className="bg-neutral-light-active rounded-lg px-4 py-3 space-y-2 text-sm">
            <div className="flex justify-between text-primary-dark">
              <span>Tạm tính</span>
              <span>
                {Number(order.subtotalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
            <div className="flex justify-between text-primary-dark">
              <span>Phí vận chuyển</span>
              <span>
                {Number(order.shippingFee) === 0 ? (
                  <span className="text-green-600">Miễn phí</span>
                ) : (
                  `${Number(order.shippingFee).toLocaleString("vi-VN")}₫`
                )}
              </span>
            </div>
            {Number(order.voucherDiscount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Giảm giá voucher</span>
                <span>
                  -{Number(order.voucherDiscount).toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-primary border-t border-neutral pt-2 mt-1">
              <span>Tổng cộng</span>
              <span className="text-promotion text-base">
                {Number(order.totalAmount).toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}