export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 grid gap-12 md:grid-cols-2">
      <div className="h-96 animate-pulse rounded bg-gray-200" />

      <div className="space-y-4">
        <div className="h-8 w-2/3 animate-pulse rounded bg-gray-200" />
        <div className="h-6 w-1/3 animate-pulse rounded bg-gray-200" />
        <div className="h-10 w-40 animate-pulse rounded bg-gray-200" />
      </div>
    </div>
  );
}
