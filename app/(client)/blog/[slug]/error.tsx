"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-16 text-center">
      <h1 className="mb-2 text-2xl font-semibold">Có lỗi xảy ra</h1>
      <p className="mb-6 text-gray-600">Không thể tải bài viết. Vui lòng thử lại.</p>
      <button onClick={reset} className="rounded-md border px-4 py-2">
        Thử lại
      </button>
    </div>
  );
}
