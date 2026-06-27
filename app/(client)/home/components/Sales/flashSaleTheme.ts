export const flashSale = {
  promotion: "rgb(var(--promotion))",
  promotionHover: "rgb(var(--promotion-hover))",
  promotionDark: "rgb(var(--promotion-dark))",
  promotionDarker: "rgb(var(--promotion-darker))",
  accent: "rgb(var(--accent))",

  priceGradient: "linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--promotion)) 100%)",
  priceShadow: "0 3px 14px rgb(var(--accent) / 0.4), 0 0 0 1px rgba(255,255,255,0.1)",

  // Đổi sang hệ đỏ-cam ấm, đồng tông với header
  // accent-dark (#c0392b) → promotion-dark (#98151a): gradient warm đỏ đậm, không u tối
  headerGradient: "linear-gradient(160deg, rgb(var(--accent-dark)) 0%, rgb(var(--promotion-dark)) 55%, rgb(var(--promotion-darker)) 100%)",

  // Glow cam nhẹ ở góc thay vì đỏ thuần → tạo cảm giác ấm, liên kết với header cam
  headerGlow: `
    radial-gradient(ellipse at 12% 130%, rgb(var(--accent) / 0.30) 0%, transparent 48%),
    radial-gradient(ellipse at 88% 130%, rgb(var(--accent-dark) / 0.20) 0%, transparent 38%)
  `,

  ctaBorderGlow: "0 2px 8px rgb(var(--promotion) / 0.35)",
} as const;
