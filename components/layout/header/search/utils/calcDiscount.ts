export function calcDiscount(origin: number, base: number): number {
  if (!origin || origin <= base) return 0;
  return Math.round(((origin - base) / origin) * 100);
}
