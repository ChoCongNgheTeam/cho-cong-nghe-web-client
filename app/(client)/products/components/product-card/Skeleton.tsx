export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-[4/5] bg-gray-200" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Features skeleton */}
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 rounded w-20" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>

        {/* Installment skeleton */}
        <div className="h-4 bg-gray-200 rounded w-24" />

        {/* Price skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-32" />
        </div>

        {/* Name skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
        </div>

        {/* Colors skeleton */}
        <div className="flex gap-2">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
        </div>

        {/* Footer skeleton */}
        <div className="flex justify-between pt-3 border-t">
          <div className="h-4 bg-gray-200 rounded w-16" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}