type SaleBannerItem = {
  image: string;
};

export default function SaleBannerCard({
  item,
  className = "",
}: {
  item: SaleBannerItem;
  className?: string;
}) {
  return (
    <div
      className={`
        overflow-hidden rounded-2xl
        shadow-sm hover:shadow-md transition
        cursor-pointer
        ${className}
      `}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.image}
        alt=""
        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
}
