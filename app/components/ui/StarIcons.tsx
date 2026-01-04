type StarIconProps = {
  filled?: boolean;
  className?: string;
};

export default function StarIcon({
  filled = true,
  className = "w-3 h-3",
}: StarIconProps) {
  return (
    <svg
      className={`
        ${className}
        ${filled ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"}
        transition-colors
      `}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
