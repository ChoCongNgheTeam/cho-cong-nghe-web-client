/**
 * StatusBadge — component pill trạng thái dùng chung.
 * Trước đây 7 module (Promotion, Voucher, Blog, Campaign, Review,
 * Comment, Product) tự viết lại y hệt đoạn markup này, chỉ khác
 * label/màu.
 */

interface StatusBadgeProps {
  label: string;
  /** Tailwind classes cho màu chữ + nền, vd "text-emerald-600 bg-emerald-50" */
  className: string;
  size?: "sm" | "md";
  /** "rounded" (rounded-lg, mặc định — dùng cho hầu hết badge)
   *  "pill" (rounded-full — dùng cho ProductStatusBadge để giữ nguyên hình dạng cũ) */
  shape?: "rounded" | "pill";
}

export function StatusBadge({ label, className, size = "md", shape = "rounded" }: StatusBadgeProps) {
  const shapeClass = shape === "pill" ? "rounded-full" : "rounded-lg";
  const sizeClass = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-0.5 text-[11px]";

  return <span className={`inline-flex items-center font-semibold whitespace-nowrap ${shapeClass} ${sizeClass} ${className}`}>{label}</span>;
}
