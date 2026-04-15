import Image from "next/image";

interface PageLoaderProps {
  message?: string;
}

export default function PageLoader({ message = "Đang tải..." }: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        {/* Mascot + shadow */}
        <div className="relative">
          <div className="animate-mascot-float">
            <Image src="/images/Robot-mascot-v2.png" alt="Linh vật CCN Shop" width={96} height={96} className="object-contain drop-shadow-2xl" priority />
          </div>
          <div className="w-14 h-2.5 bg-black/25 rounded-full mx-auto mt-2 animate-mascot-shadow" />
        </div>

        {/* Text */}
        <p className="text-white/90 text-sm font-medium">{message}</p>

        {/* Dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-dot1" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-dot2" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-dot3" />
        </div>
      </div>
    </div>
  );
}
