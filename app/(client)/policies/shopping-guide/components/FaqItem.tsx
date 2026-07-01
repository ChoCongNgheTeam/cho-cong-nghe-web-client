"use client";
import { useState } from "react";
import type { FaqEntry } from "../data";

type Props = {
  faq: FaqEntry;
};

export default function FaqItem({ faq }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-neutral rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-neutral-light hover:bg-neutral-light-hover transition-colors text-left"
      >
        <span className="font-medium text-primary text-sm">
          {faq.q}
        </span>

        <span
          className={`shrink-0 w-6 h-6 rounded-full bg-neutral flex items-center justify-center text-neutral-dark transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-5 py-4 bg-neutral-light-hover border-t border-neutral">
          <p className="text-neutral-darker text-sm leading-relaxed">
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}
