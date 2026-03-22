import Link from "next/link";
interface LinkWithIconProps {
   href: string;
   icon: React.ReactNode;
   text: string;
   mobileText: string;
}
const LinkWithIcon: React.FC<LinkWithIconProps> = ({
   href,
   icon,
   text,
   mobileText,
}) => {
   return (
      <Link
         href={href}
         className="flex items-center gap-1 hover:text-primary hover:underline whitespace-nowrap"
      >
         {icon}
         <span className="hidden lg:inline text-[13px]">{text}</span>
         <span className="lg:hidden">{mobileText}</span>
      </Link>
   );
};
export default LinkWithIcon;
