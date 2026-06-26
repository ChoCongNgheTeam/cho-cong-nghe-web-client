import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import Link from "next/link";
import Image from "next/image";
import { memo } from "react";
const FALLBACK_LOGO = "/logo-dark-5.png";

const HeaderLogo = memo(() => {
  const { logoUrl, siteName, isLoading } = useGeneralSettings();
  const resolvedLogo = !isLoading && logoUrl ? logoUrl : FALLBACK_LOGO;

  return (
    <Link href="/" className="shrink-0 pr-2">
      <Image
        src={resolvedLogo}
        width={180}
        height={60}
        alt={siteName || "Logo"}
        className="h-12 lg:h-15 w-auto hover:opacity-80 transition-opacity"
        priority
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
        }}
      />
    </Link>
  );
});
HeaderLogo.displayName = "HeaderLogo";

export default HeaderLogo;
