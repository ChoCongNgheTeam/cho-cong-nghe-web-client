"use client";

import { useState } from "react";
import Image from "next/image";
import type { VariantOption, VariantOptionValue } from "../../types";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function OptionValues({
  option,
  selectedOptions,
  onOptionChange,
}: {
  option: VariantOption;
  selectedOptions: Record<string, string>;
  onOptionChange?: (type: string, value: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const values = option.values ?? [];
  const LIMIT = 5;
  const displayed = showAll ? values : values.slice(0, LIMIT);
  const hasMore = values.length > LIMIT;

  return (
    <div className="grid grid-cols-3 gap-2">
      {displayed.map((val: VariantOptionValue) => {
        const active = selectedOptions[option.type] === val.value;
        const disabled = !val.enabled;
        return (
          <span
            key={val.value}
            onClick={() =>
              !disabled && onOptionChange?.(option.type, val.value)
            }
            className={`border rounded-sm px-3 py-2 sm:px-4 sm:py-3
              text-xs sm:text-sm font-bold relative overflow-hidden
              transition-colors duration-300 flex items-center gap-2
              break-words min-w-0
              ${
                disabled
                  ? "border-neutral text-primary bg-neutral opacity-40 cursor-not-allowed"
                  : active
                    ? "border-accent text-primary bg-accent-light cursor-pointer"
                    : "border-neutral-dark text-primary bg-neutral-light cursor-pointer hover:border-accent hover:bg-accent-light"
              }`}
          >
            {val.image?.imageUrl && (
              <Image
                src={val.image.imageUrl}
                alt={val.label}
                width={24}
                height={24}
                className="object-contain flex-shrink-0"
              />
            )}
            <span className="break-words min-w-0">{val.label}</span>
            {active && !disabled && (
              <div className="absolute -top-1 -right-2 w-0 h-0 border-l-[30px] border-l-transparent border-t-[30px] border-t-accent">
                <span className="absolute -top-[28px] -right-[-7px] text-white text-xs font-bold">
                  ✓
                </span>
              </div>
            )}
          </span>
        );
      })}

      {hasMore && (
        <button
          onClick={() => setShowAll((v) => !v)}
          className="border border-neutral-dark rounded-sm px-3 py-2 text-xs sm:text-sm
            text-accent font-medium flex items-center justify-center gap-1 leading-tight
            hover:border-accent hover:bg-accent-light transition-colors cursor-pointer"
        >
          {showAll ? (
            <span className="flex items-center gap-1">
              Thu gọn <ChevronUp size={14} />
            </span>
          ) : (
            <span className="flex items-center gap-1">
              Xem thêm <ChevronDown size={14} />
            </span>
          )}
        </button>
      )}
    </div>
  );
}
