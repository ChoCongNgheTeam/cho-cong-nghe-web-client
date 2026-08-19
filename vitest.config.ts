import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    globals: true,
    // config/api.config.ts đọc process.env.NEXT_PUBLIC_API_BASE_URL với non-null
    // assertion (!) — nếu thiếu biến này mọi test động tới lib/api/client.ts sẽ
    // throw "API_BASE_URL chưa được cấu hình" trước khi chạm logic cần test.
    env: {
      NEXT_PUBLIC_API_BASE_URL: "http://localhost:4000",
    },
    setupFiles: ["./vitest.setup.ts"],
    css: false,
    include: ["**/*.{test,spec}.{ts,tsx}"],
    exclude: ["node_modules", ".next", "e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      reportsDirectory: "./coverage",
      include: ["helpers/**", "lib/**", "hooks/**", "store/**", "components/**"],
      exclude: ["**/*.d.ts", "**/*.config.*", "**/types/**", ".next/**", "e2e/**"],
      // Ngưỡng khởi điểm thấp vì repo hiện gần như chưa có test.
      // Siết dần lên khi coverage thật tăng (xem TEST_PLAN.md).
      thresholds: {
        lines: 25,
        statements: 25,
        functions: 25,
        branches: 20,
      },
    },
  },
});
