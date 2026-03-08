import Image from "next/image";
import { User } from "lucide-react";

interface UserAvatarProps {
   avatarImage?: string;
   fullName: string;
   size?: number;
   className?: string;
}

export default function UserAvatar({
   avatarImage,
   fullName,
   size = 48,
   className = "",
}: UserAvatarProps) {
   return (
      <div
         className={`rounded-full overflow-hidden bg-neutral border-2 border-accent shrink-0 flex items-center justify-center ${className}`}
         style={{ width: size, height: size }}
      >
         {avatarImage ? (
            <Image
               src={avatarImage}
               alt={fullName}
               width={size}
               height={size}
               className="w-full h-full object-cover"
            />
         ) : (
            <User
               className="text-neutral-dark"
               style={{ width: size * 0.5, height: size * 0.5 }}
            />
         )}
      </div>
   );
}
