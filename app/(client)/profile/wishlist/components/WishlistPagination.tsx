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
    <div className="mt-8 flex justify-center gap-2">
      {Array.from({ length: total }).map((_, i) => {
        const p = i + 1;
        const isActive = p === page;
        return (
          <button
            key={p}
            onClick={() => onChange(p)}
            aria-label={`Trang ${p}`}
            className={`h-2.5 rounded-full transition ${
              isActive
                ? "w-8 bg-primary"
                : "w-2.5 bg-neutral hover:bg-neutral-dark"
            }`}
          />
        );
      })}
    </div>
  );
}
