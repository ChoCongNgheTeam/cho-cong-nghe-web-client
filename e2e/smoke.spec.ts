import { test, expect } from "@playwright/test";

/**
 * Smoke test — cố tình viết TỐI GIẢN và dùng selector chắc chắn ổn định
 * (title từ metadata trong app/layout.tsx, semantic role) thay vì đoán class
 * CSS/text UI cụ thể, vì file này CHƯA được chạy thử qua trình duyệt thật
 * (môi trường build bị chặn cài Playwright browser). Coi đây là điểm khởi đầu
 * an toàn để bạn xác nhận Playwright hoạt động đúng, trước khi viết thêm các
 * spec sâu hơn (checkout, auth) theo đề xuất trong TEST_PLAN.md mục 5.3 —
 * những spec đó cần bạn tự thêm `data-testid` vào component thật hoặc dùng
 * `getByRole`/`getByText` khớp đúng UI hiện tại, việc mà tôi không thể tự
 * verify chính xác nếu không chạy được trình duyệt.
 */
test.describe("Smoke test", () => {
  test("trang chủ tải được và có đúng title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ChoCongNghe/i);
  });

  test("trang chủ không có lỗi console nghiêm trọng khi tải", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Lọc bỏ các warning vô hại thường gặp (favicon 404 tạm thời, extension trình
    // duyệt) — chỉ fail nếu có lỗi JS thực sự hoặc CSP bị vi phạm (dấu hiệu domain
    // thiếu whitelist trong middleware.ts, xem CODE_REVIEW.md mục 2.3).
    const meaningfulErrors = errors.filter((e) => !e.includes("favicon") && !e.toLowerCase().includes("extension"));
    expect(meaningfulErrors, `Console errors found:\n${meaningfulErrors.join("\n")}`).toEqual([]);
  });

  test("điều hướng tới trang tìm kiếm hoạt động", async ({ page }) => {
    await page.goto("/search?q=iphone");
    await expect(page).toHaveURL(/\/search/);
  });
});
