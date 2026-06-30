interface StarRatingProps {
  average: number; // 0–5
  count?: number; // nếu truyền vào sẽ hiện (count)
  size?: "sm" | "md";
}

export function StarRating({ average, count, size = "sm" }: StarRatingProps) {
  const textSize = size === "sm" ? "text-[10px] sm:text-[11px]" : "text-xs sm:text-sm";
  const starSize = size === "sm" ? "text-[11px] sm:text-[12px]" : "text-sm sm:text-base";

  return (
    <div className={`flex items-center gap-1 ${textSize}`}>
      <div className="flex items-center gap-[1px]">
        {Array.from({ length: 5 }, (_, i) => {
          const filled = i + 1 <= Math.floor(average);
          const half = !filled && i < average && average - i >= 0.25;

          return (
            <span key={i} className={`relative inline-block leading-none ${starSize}`}>
              {/* star xám nền */}
              <span className="text-neutral-300 dark:text-neutral-600">★</span>

              {/* overlay vàng: full hoặc half */}
              {(filled || half) && (
                <span className="absolute inset-0 overflow-hidden text-yellow-400" style={{ width: filled ? "100%" : "50%" }}>
                  ★
                </span>
              )}
            </span>
          );
        })}
      </div>

      {count !== undefined && <span className="text-neutral-500 dark:text-neutral-400">({count})</span>}
    </div>
  );
}
