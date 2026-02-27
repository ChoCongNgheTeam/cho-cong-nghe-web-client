import { useState } from "react";
import { Brand } from "../brand.types";
import Image from "next/image";
import { ImageOff } from "lucide-react";

export function BrandImage({ brand }: { brand: Brand }) {
   const [imgError, setImgError] = useState(false);

   const src = brand.imageUrl ?? null;

   if (src && !imgError) {
      return (
         <div className="relative w-7 h-7 shrink-0">
            <Image
               src={src}
               alt={brand.name}
               fill
               className="object-contain"
               onError={() => setImgError(true)}
               sizes="75"
               unoptimized={!brand.imageUrl} // chỉ optimize ảnh Cloudinary
            />
         </div>
      );
   }

   return (
      <div className="w-7 h-7 rounded-lg bg-neutral-light-active flex items-center justify-center shrink-0 text-neutral-dark">
         <ImageOff size={14} strokeWidth={1.5} />
      </div>
   );
}
