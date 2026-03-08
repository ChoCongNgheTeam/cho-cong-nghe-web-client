"use client";
import { useState } from "react";

type Props = {
  faq: any;
};

export default function FaqItem({ faq }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-stone-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 bg-white hover:bg-stone-50 transition-colors text-left"
      >
        <span className="font-medium text-stone-800 text-sm">
          {faq.q}
        </span>

        <span
          className={`shrink-0 w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        >
          +
        </span>
      </button>

      {open && (
        <div className="px-5 py-4 bg-stone-50 border-t border-stone-200">
          <p className="text-stone-600 text-sm leading-relaxed">
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}