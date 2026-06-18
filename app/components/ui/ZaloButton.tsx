"use client";

import Image from "next/image";
import Link from "next/link";

const ZALO_URL = "https://zalo.me/0815934934";

export default function ZaloButton() {
  return (
    <Link
      href={ZALO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat Zalo"
      className="fixed z-50 w-12 h-12 rounded-full flex items-center justify-center
        bg-white border border-neutral-100
        shadow-[0_8px_30px_rgb(0,0,0,0.14)] hover:shadow-[0_12px_36px_rgb(0,0,0,0.20)]
        hover:scale-105 active:scale-95
        transition-all duration-300
        bottom-[160px] right-2
        md:bottom-[72px] md:right-2"
    >
      <Image src="/images/icons8-zalo-96.png" alt="Zalo" width={32} height={32} className="object-contain" />
    </Link>
  );
}
