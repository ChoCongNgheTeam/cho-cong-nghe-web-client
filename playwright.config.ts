import { defineConfig, devices } from "@playwright/test";

// CHƯA cài được @playwright/test trong môi trường build này (sandbox chặn
// network tải browser binary, npm install trả 403). File này viết sẵn theo
// đúng convention chính thức của Playwright — bạn cần tự cài & chạy để xác
// nhận (xem hướng dẫn trong TEST_PLAN.md mục 5.3):
//   npm install -D @playwright/test
//   npx playwright install --with-deps chromium
//   npx playwright test

const PORT = 3000;
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-chrome", use: { ...devices["Pixel 7"] } },
  ],
  // Tự khởi động `next dev` trước khi chạy test nếu chưa có server nào chạy sẵn
  // ở BASE_URL — tiện cho local dev, nhưng trên CI nên start server ở 1 step
  // riêng (build production trước) để test chạy trên bundle thật, không phải dev mode.
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
