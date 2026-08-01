"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Truck, Loader2, Ban } from "lucide-react";
import { getShipmentByOrder, cancelShipment } from "@/app/(admin)/admin/shipments/_lib/shipments";
import { CreateShipmentModal } from "./CreateShipmentModal";
import { ShipmentStatusBadge } from "./ShipmentStatusBadge";
import { ConfirmDeleteModal } from "@/components/admin/shared/ConfirmDeleteModal";
import { formatDate } from "@/helpers";
import type { Shipment, ShipmentStatus } from "@/app/(admin)/admin/shipments/shipment.types";

interface ShipmentSectionProps {
  orderId: string;
  orderCode: string;
}

const NOT_CANCELLABLE: ShipmentStatus[] = ["DELIVERED", "CANCELLED"];

/**
 * ShipmentSection — nội dung phần "Vận chuyển" trên trang chi tiết Order.
 * KHÔNG tự vẽ khung SectionCard (vì SectionCard hiện là component cục bộ,
 * không export, khai báo ngay trong orders/[id]/page.tsx) — bọc component
 * này trong <SectionCard title="Vận chuyển" icon={<Truck size={15} />}> của
 * chính trang đó, đặt cạnh SectionCard "Địa chỉ giao hàng":
 *
 *   <SectionCard title="Vận chuyển" icon={<Truck size={15} />}>
 *     <ShipmentSection orderId={order.id} orderCode={order.orderCode} />
 *   </SectionCard>
 */
export function ShipmentSection({ orderId, orderCode }: ShipmentSectionProps) {
  const [shipment, setShipment] = useState<Shipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getShipmentByOrder(orderId);
    setShipment(res);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCancelConfirm = async () => {
    if (!shipment) return;
    setCancelling(true);
    setCancelError(null);
    try {
      await cancelShipment(shipment.id);
      setShowCancel(false);
      load();
    } catch (err: unknown) {
      setCancelError((err as Error)?.message || "Không thể huỷ vận đơn");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 size={18} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!shipment) {
    return (
      <>
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] text-neutral-dark">Đơn hàng chưa có vận đơn</p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-accent hover:bg-accent/90 text-white text-[12px] font-semibold transition-colors cursor-pointer"
          >
            <Truck size={13} /> Tạo vận đơn
          </button>
        </div>
        <CreateShipmentModal
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          orderId={orderId}
          orderCode={orderCode}
          onCreated={() => {
            setShowCreate(false);
            load();
          }}
        />
      </>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-semibold text-primary">{shipment.provider.name}</p>
          {shipment.providerOrderCode && <p className="text-[12px] text-neutral-dark font-mono">{shipment.providerOrderCode}</p>}
        </div>
        <ShipmentStatusBadge status={shipment.status} />
      </div>

      {shipment.expectedDeliveryAt && <p className="text-[12px] text-neutral-dark">Dự kiến giao: {formatDate(shipment.expectedDeliveryAt)}</p>}
      {shipment.failedReason && <p className="text-[12px] text-promotion">Lý do thất bại: {shipment.failedReason}</p>}

      <div className="flex items-center gap-3 pt-1">
        <Link href="/admin/shipments" className="text-[12px] text-accent hover:underline cursor-pointer">
          Xem chi tiết vận đơn
        </Link>
        {!NOT_CANCELLABLE.includes(shipment.status) && (
          <button onClick={() => setShowCancel(true)} className="flex items-center gap-1 text-[12px] text-promotion hover:underline cursor-pointer">
            <Ban size={12} /> Huỷ vận đơn
          </button>
        )}
      </div>

      {showCancel && (
        <ConfirmDeleteModal
          isOpen={showCancel}
          onClose={() => {
            setShowCancel(false);
            setCancelError(null);
          }}
          title="Huỷ vận đơn?"
          description="Vận đơn sẽ được báo huỷ với nhà vận chuyển."
          warningText="Hành động này không thể hoàn tác."
          onConfirm={handleCancelConfirm}
          loading={cancelling}
          error={cancelError}
          confirmLabel="Huỷ vận đơn"
          confirmLoadingLabel="Đang huỷ..."
        />
      )}
    </div>
  );
}
