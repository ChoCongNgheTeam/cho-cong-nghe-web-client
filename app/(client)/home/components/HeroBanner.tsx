import Image from "next/image";
import Link from "next/link";

interface HeroBannerProps {
  image?: string;
  href?: string;
  alt?: string;
}

export function HeroBanner({ image = "https://clickbuy.com.vn/uploads/media/657-GNxxO.png", href = "/sale", alt = "Banner khuyến mãi" }: HeroBannerProps) {
  return (
    <div className="container pb-2">
      <Link href={href} className="relative block w-full overflow-hidden rounded-xl group" style={{ height: "clamp(56px, 8vw, 110px)" }}>
        <Image src={image} alt={alt} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.02]" priority />
        {/* Shine effect on hover */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          }}
        />
      </Link>
    </div>
  );
}
