export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 space-y-4">
      <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-gray-200" />

      <div className="space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 animate-pulse rounded bg-gray-200" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
