// Tất cả màu lấy từ CSS variables trong globals.css → tự đổi theo theme (light/dark)
// promotion = đỏ khuyến mãi, accent = cam thương hiệu

export const flashSale = {
  promotion: "rgb(var(--promotion))",
  promotionHover: "rgb(var(--promotion-hover))",
  promotionDark: "rgb(var(--promotion-dark))",
  promotionDarker: "rgb(var(--promotion-darker))",
  accent: "rgb(var(--accent))",

  priceGradient: "linear-gradient(135deg, rgb(var(--promotion)) 0%, rgb(var(--promotion-dark)) 100%)",
  priceShadow: "0 2px 8px rgb(var(--promotion) / 0.25)",

  headerGradient: "linear-gradient(160deg, rgb(var(--dark)) 0%, rgb(var(--dark-dark)) 55%, rgb(var(--dark-darker)) 100%)",
  headerGlow: `
    radial-gradient(ellipse at 12% 130%, rgb(var(--promotion) / 0.25) 0%, transparent 48%),
    radial-gradient(ellipse at 88% 130%, rgb(var(--promotion) / 0.12) 0%, transparent 38%)
  `,

  ctaBorderGlow: "0 2px 8px rgb(var(--promotion) / 0.35)",
} as const;
