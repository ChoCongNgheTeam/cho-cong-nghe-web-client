import Link from "next/link";
import { LinkWithIconProps } from "../types";

const LinkWithIcon = ({ href, icon, text, mobileText }: LinkWithIconProps) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 whitespace-nowrap transition-colors duration-150"
      style={{ color: "rgba(255,255,255,0.8)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,2)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)")}
    >
      {icon}
      <span className="hidden lg:inline text-[13px]">{text}</span>
      <span className="lg:hidden">{mobileText}</span>
    </Link>
  );
};

export default LinkWithIcon;
