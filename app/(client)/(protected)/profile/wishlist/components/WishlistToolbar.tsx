type Props = {
   value: 4 | 8 | 12;
   onChange: (v: 4 | 8 | 12) => void;
};

const OPTIONS: (4 | 8 | 12)[] = [4, 8, 12];

export default function WishlistToolbar({ value, onChange }: Props) {
   return (
      <div className="mb-6 flex items-center gap-2 text-sm">
         <span className="text-neutral-darker">Hiện</span>
         {OPTIONS.map((n) => (
            <button
               key={n}
               onClick={() => onChange(n)}
               className={`rounded border px-3 py-1 text-sm transition cursor-pointer text-primary ${
                  value === n
                     ? "border-primary"
                     : "border-neutral hover:bg-neutral"
               }`}
            >
               {n}
            </button>
         ))}
         <span className="text-neutral-darker">sản phẩm</span>
      </div>
   );
}
