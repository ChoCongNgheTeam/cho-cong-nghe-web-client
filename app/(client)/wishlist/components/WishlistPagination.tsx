type Props = {
  page: number;
  total: number;
  onChange: (p: number) => void;
};

export default function WishlistPagination({
  page,
  total,
  onChange,
}: Props) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: total }).map((_, i) => {
        const p = i + 1;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-8 h-8 rounded-full border transition
              ${
                p === page
                  ? "bg-primary text-white"
                  : "hover:bg-neutral-light"
              }`}
          >
            {p}
          </button>
        );
      })}
    </div>
  );
}
