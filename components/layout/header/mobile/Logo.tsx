import Link from "next/link";
import { memo } from "react";
import Image from "next/image";
import { useGeneralSettings } from "../../../../hooks/useGeneralSettings";

const FALLBACK_LOGO = "/logo-ccn.png";

const MobileLogo = memo(() => {
  const { logoUrl, siteName, isLoading: settingsLoading } = useGeneralSettings();
  const resolvedLogo = !settingsLoading && logoUrl ? logoUrl : FALLBACK_LOGO;
  return (
    <Link href="/" className="absolute left-1/2 -translate-x-1/2">
      <Image
        src={resolvedLogo}
        width={140}
        height={44}
        alt={siteName || "Logo"}
        className="h-9 w-auto"
        priority
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = FALLBACK_LOGO;
        }}
      />
    </Link>
  );
});
MobileLogo.displayName = "MobileLogo";

export default MobileLogo;
