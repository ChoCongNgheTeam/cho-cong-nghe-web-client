export default function AddressSkeleton() {
  return (
    <div className="animate-pulse">
      {/* ── Header ── */}
      <div className="mt-1 sm:mt-2 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Title */}
          <div className="h-6 w-40 bg-neutral rounded-md" />
          {/* Add button */}
          <div className="h-9 w-36 bg-neutral rounded-lg" />
        </div>
      </div>

      {/* ── Address Cards ── */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-neutral-light rounded-xl border border-neutral p-4 sm:p-5 space-y-3">
            {/* Top row: type badge + default badge */}
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-neutral rounded-full" />
              {i === 1 && <div className="h-5 w-24 bg-neutral rounded-full" />}
            </div>

            {/* Name + phone */}
            <div className="flex items-center gap-4">
              <div className="h-4 w-28 bg-neutral rounded-md" />
              <div className="h-4 w-px bg-neutral" />
              <div className="h-4 w-24 bg-neutral rounded-md" />
            </div>

            {/* Address line */}
            <div className="space-y-1.5">
              <div className="h-3.5 w-full bg-neutral rounded-md" />
              <div className="h-3.5 w-3/4 bg-neutral rounded-md" />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-1 border-t border-neutral">
              <div className="h-7 w-16 bg-neutral rounded-md" />
              <div className="h-7 w-16 bg-neutral rounded-md" />
              {i !== 1 && <div className="ml-auto h-7 w-28 bg-neutral rounded-md" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
