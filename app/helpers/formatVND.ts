export function formatVND(amount: string | number) {
   return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
   }).format(Number(amount));
}
