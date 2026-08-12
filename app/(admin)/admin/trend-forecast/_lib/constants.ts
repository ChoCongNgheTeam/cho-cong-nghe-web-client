export const DAYS_OPTIONS = [7, 30, 90];

export const SCORE_LEVELS = [
  { min: 80, label: "Rất nóng", color: "text-promotion bg-promotion-light" },
  { min: 50, label: "Đáng chú ý", color: "text-amber-500 bg-amber-50" },
  { min: 0, label: "Bình thường", color: "text-neutral-dark bg-neutral-light-active" },
];

export function getScoreLevel(score: number) {
  return SCORE_LEVELS.find((l) => score >= l.min) ?? SCORE_LEVELS[SCORE_LEVELS.length - 1];
}

/** "LAST_7_DAYS" -> "7 ngày gần nhất" */
export function periodLabel(period: string | undefined) {
  if (!period) return "—";
  const match = period.match(/^LAST_(\d+)_DAYS$/);
  return match ? `${match[1]} ngày gần nhất` : period;
}
