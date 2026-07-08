"use client";

import { Plus, Minus } from "lucide-react";

interface QuantityStepperProps {
  value: string | number;
  quantity: number;
  availableQuantity: number;
  size: "sm" | "md";
  onChange: (value: string) => void;
  onBlur: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function QuantityStepper({ value, quantity, availableQuantity, size, onChange, onBlur, onIncrease, onDecrease }: QuantityStepperProps) {
  const h = size === "md" ? "h-8 w-8" : "h-7 w-7";
  const inputH = size === "md" ? "h-8" : "h-7";
  const iconSize = size === "md" ? "h-4 w-4" : "h-3 w-3";

  return (
    <div className="flex items-center border border-neutral rounded w-fit shrink-0">
      <button
        onClick={onDecrease}
        disabled={quantity <= 1}
        className={`flex ${h} items-center justify-center rounded-l text-neutral-darker transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer`}
      >
        <Minus className={iconSize} />
      </button>

      <input
        type="number"
        min={1}
        max={availableQuantity}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        className={`${inputH} w-10 border-x border-neutral text-sm font-medium text-primary bg-transparent text-center outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />

      <button
        onClick={onIncrease}
        disabled={quantity >= availableQuantity}
        className={`flex ${h} items-center justify-center rounded-r text-neutral-darker transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer`}
      >
        <Plus className={iconSize} />
      </button>
    </div>
  );
}
