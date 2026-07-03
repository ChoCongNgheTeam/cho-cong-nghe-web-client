interface SlideDotsProps {
  pageCount: number;
  activePage: number;
  isAnimating: boolean;
  onSelect: (index: number) => void;
}

export function SlideDots({ pageCount, activePage, isAnimating, onSelect }: SlideDotsProps) {
  return (
    <div className="flex items-center justify-center gap-2 my-4">
      {Array.from({ length: pageCount }).map((_, index) => (
        <button
          key={index}
          onClick={() => onSelect(index)}
          disabled={isAnimating}
          aria-label={`Go to slide page ${index + 1}`}
          className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${activePage === index ? "w-8 bg-primary" : "w-2 bg-neutral-dark hover:bg-neutral-dark-hover"}`}
        />
      ))}
    </div>
  );
}
