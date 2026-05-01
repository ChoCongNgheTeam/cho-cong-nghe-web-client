"use client";
import { WithPermission } from "@/components/admin/WithPermission";
import AdminPaymentMethodsPage from "@/(admin)/admin/payment-methods/page";

export default function StaffPaymentMethodsPage() {
  return (
    <WithPermission permission="canPaymentView" redirect="/staff/403">
      <AdminPaymentMethodsPage />
    </WithPermission>
  );
}
