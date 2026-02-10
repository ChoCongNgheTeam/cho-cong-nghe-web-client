type Props = {
  value: 4 | 8 | 12;
  onChange: (v: 4 | 8 | 12) => void;
};

const OPTIONS: (4 | 8 | 12)[] = [4, 8, 12];

export default function WishlistToolbar({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 mb-6">
      <span className="text-sm text-primary-light">Hiện</span>

      {OPTIONS.map((n) => (
        <button
          key={n}
          onClick={() => onChange(n)}
          className={`px-3 py-1 rounded border text-sm transition
            ${
              value === n
                ? "bg-primary text-white"
                : "hover:bg-neutral-light"
            }`}
        >
          {n}
        </button>
      ))}

      <span className="text-sm text-primary-light">
        sản phẩm
      </span>
    </div>
  );
}
