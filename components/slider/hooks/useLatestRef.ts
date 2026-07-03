import { useEffect, useRef } from "react";

/**
 * Giữ tham chiếu tới giá trị mới nhất mà không cần đưa vào dependency array.
 * Dùng trong các callback cố ý giữ deps rỗng (moveSlide, handleDragEnd...)
 * nhưng vẫn cần đọc giá trị "tươi" tại thời điểm gọi — tránh stale closure.
 */
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
