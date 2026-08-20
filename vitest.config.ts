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
      // Ngưỡng khởi điểm — ĐÃ ĐO THỰC TẾ bằng `pnpm run test:coverage`, không phải
      // số đoán. Coverage tính trên TOÀN BỘ thư mục include ở trên (helpers, lib,
      // hooks, store, components), không chỉ 6 file đang có test — nên với 42 test
      // hiện tại, coverage thật rất thấp (statements 5.35%, branches 4.41%,
      // functions 3.03%, lines 5.76%). Đặt ngưỡng THẤP HƠN số đo thật 1 chút để có
      // buffer, mục đích ngưỡng này là "không cho coverage TỤT xuống thấp hơn nữa"
      // (regression floor), không phải mục tiêu để đạt tới. Mỗi khi thêm test cho
      // module mới (xem TEST_PLAN.md mục 5.1), nâng số này lên khớp coverage mới đo
      // được — đừng đặt ngưỡng cao hơn thực tế, nếu không `pnpm run test:coverage`
      // (và CI) sẽ fail ngay cả khi không có gì thực sự sai.
      thresholds: {
        lines: 5,
        statements: 5,
        functions: 3,
        branches: 4,
      },
    },
  },
});
