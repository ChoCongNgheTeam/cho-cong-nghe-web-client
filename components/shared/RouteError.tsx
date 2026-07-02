"use client";

interface RouteErrorProps {
  reset: () => void;
  title?: string;
  description?: string;
}

export function RouteError({ reset, title = "Đã có lỗi xảy ra", description = "Vui lòng thử lại sau ít phút." }: RouteErrorProps) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-xl font-semibold text-neutral-dark">{title}</h2>
      <p className="text-neutral text-sm max-w-md">{description}</p>
      <button onClick={reset} className="px-6 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-active transition-colors">
        Thử lại
      </button>
    </div>
  );
}
