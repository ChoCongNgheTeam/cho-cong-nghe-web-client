type IconProps = {
  className?: string;
};

export default function CompareIcon({
  className = "w-4 h-4",
}: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M18 8L22 12L18 16" />
      <path d="M6 8L2 12L6 16" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  );
}
