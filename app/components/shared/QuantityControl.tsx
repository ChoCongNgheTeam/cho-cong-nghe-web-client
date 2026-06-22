import { memo, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";

interface QuantityControlProps {
  maxStock: number;
  onChange: (qty: number) => void;
}

const QuantityControl = memo(function QuantityControl({ maxStock, onChange }: QuantityControlProps) {
  const [quantity, setQuantity] = useState(1);

  const handleChange = (newQty: number) => {
    const clamped = Math.min(Math.max(1, newQty), maxStock);
    setQuantity(clamped);
    onChange(clamped);
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center border border-neutral rounded-lg overflow-hidden">
        <button
          onClick={() => handleChange(quantity - 1)}
          disabled={quantity <= 1}
          className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FaMinus className="text-primary text-sm" />
        </button>
        <input
          type="number"
          min="1"
          max={maxStock}
          value={quantity}
          onChange={(e) => handleChange(parseInt(e.target.value) || 1)}
          className="w-16 h-10 text-center border-x border-neutral focus:outline-none bg-neutral-light text-primary font-medium [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          onClick={() => handleChange(quantity + 1)}
          disabled={quantity >= maxStock}
          className="w-10 h-10 flex items-center justify-center bg-neutral-light hover:bg-neutral transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <FaPlus className="text-primary text-sm" />
        </button>
      </div>
      <span className="text-xs sm:text-sm text-neutral-dark">Còn {maxStock} sản phẩm</span>
    </div>
  );
});

export default QuantityControl;
