"use client";

// global-error.tsx chỉ kích hoạt khi chính app/layout.tsx (root layout) throw —
// ví dụ nếu headers()/nonce hoặc font loading lỗi. Vì nó THAY THẾ root layout nên
// bắt buộc phải tự khai báo <html>/<body> (quy ước của Next.js App Router), không
// thể tái dùng RouteError/logError vì các module đó có thể phụ thuộc context đã hỏng.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Không dùng logError()/hook phức tạp ở đây vì global-error.tsx thay thế cả root
  // layout khi chính layout bị lỗi — các module đó có thể phụ thuộc context đã hỏng.
  // console.error là API tối giản nhất, gần như không thể tự nó throw thêm lỗi.
  if (typeof window !== "undefined") {
    console.error("Global error boundary caught error:", error);
  }

  return (
    <html lang="vi">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ fontSize: 20, fontWeight: 600 }}>Ứng dụng gặp sự cố nghiêm trọng</h2>
          <p style={{ fontSize: 14, color: "#666", maxWidth: 420 }}>Vui lòng tải lại trang. Nếu lỗi tiếp diễn, hãy liên hệ hỗ trợ.</p>
          <button
            onClick={reset}
            style={{
              padding: "10px 24px",
              borderRadius: 999,
              background: "#111",
              color: "#fff",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Thử lại
          </button>
        </div>
      </body>
    </html>
  );
}
