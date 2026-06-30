export const flashSale = {
  promotion: "rgb(var(--promotion))",
  promotionHover: "rgb(var(--promotion-hover))",
  promotionDark: "rgb(var(--promotion-dark))",
  promotionDarker: "rgb(var(--promotion-darker))",
  accent: "rgb(var(--accent))",

  priceGradient: "linear-gradient(135deg, rgb(var(--accent)) 0%, rgb(var(--promotion)) 100%)",
  priceShadow: "0 3px 14px rgb(var(--accent) / 0.4), 0 0 0 1px rgba(255,255,255,0.1)",

  headerGradient: "linear-gradient(160deg, #0c4a6e 0%, #0369a1 60%, #0284c7 100%)",

  headerGlow: `
  radial-gradient(ellipse at 12% 150%, rgba(3, 105, 161, 0.2) 0%, transparent 40%),
  radial-gradient(ellipse at 88% 150%, rgba(14, 116, 144, 0.15) 0%, transparent 30%)
`,

  ctaBorderGlow: "0 2px 8px rgba(3, 105, 161, 0.4)",
} as const;
