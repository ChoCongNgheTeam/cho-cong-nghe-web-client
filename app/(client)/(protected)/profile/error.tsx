"use client";

export default function ProfileError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center">
      <h2 className="mb-4 text-xl font-semibold">Có lỗi xảy ra 😢</h2>
      <button onClick={reset} className="rounded bg-black px-4 py-2 text-white">
        Thử lại
      </button>
    </div>
  );
}
