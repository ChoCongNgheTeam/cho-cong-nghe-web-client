import Link from "next/link";

interface LinkWithIconProps {
  href: string;
  icon: React.ReactNode;
  text: string;
  mobileText: string;
}

// Opacity thấp hơn cũ (0.55 → hover 0.85) để phù hợp với HeaderTop navy tối
const LinkWithIcon: React.FC<LinkWithIconProps> = ({ href, icon, text, mobileText }) => {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 whitespace-nowrap transition-colors duration-150"
      style={{ color: "rgba(255,255,255,0.55)" }}
      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.9)")}
      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)")}
    >
      {icon}
      <span className="hidden lg:inline text-[13px]">{text}</span>
      <span className="lg:hidden">{mobileText}</span>
    </Link>
  );
};

export default LinkWithIcon;
