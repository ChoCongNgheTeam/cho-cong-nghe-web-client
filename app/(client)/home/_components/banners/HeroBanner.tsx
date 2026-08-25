import Image from "next/image";
import Link from "next/link";

interface HeroBannerProps {
  image?: string;
  href?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function HeroBanner({
  image = "https://res.cloudinary.com/da3eksemd/image/upload/v1787551151/media/jzum1nypdca04ufbsxen.png",
  href = "/category/iphone-17-series",
  alt = "Banner khuyến mãi",
  width = 1920, // Kích thước chiều rộng thực tế của ảnh gốc (ví dụ)
  height = 567, // Chiều cao thực tế của ảnh gốc
}: HeroBannerProps) {
  return (
    <div className="container pb-2">
      <Link href={href} className="relative block w-full overflow-hidden rounded-xl group">
        <Image
          src={image}
          alt={alt}
          width={width}
          height={height}
          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          priority
        />
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
