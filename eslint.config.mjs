import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Tắt các rule ESLint xung đột với Prettier (vd. indent, quotes) — PHẢI đứng
  // SAU CÙNG trong mảng để override đúng thứ tự, nếu không Prettier và ESLint
  // sẽ "cãi nhau" liên tục mỗi lần chạy lint-staged (một bên sửa, một bên báo lỗi).
  prettierConfig,
  {
    rules: {
      // eslint-plugin-react-hooks v7 (bundled với eslint-config-next 16) thêm rule
      // này, tự động gắn cờ MỌI pattern "gọi hàm fetch trong useEffect khi mount"
      // (vd. `useEffect(() => { fetchBlog(); }, [fetchBlog])`) — đây là pattern cực
      // kỳ phổ biến, dùng khắp codebase này (BlogDetailClient, admin products/blogs,
      // trend-forecast...), không phải bug thật. Sửa "đúng chuẩn" theo khuyến nghị
      // của rule (dùng React Query/SWR hoặc `use()` hook) là 1 cuộc refactor lớn,
      // không nên ép vào 1 commit vá bảo mật. Hạ xuống "warn" để không chặn commit,
      // nhưng vẫn hiển thị để cân nhắc refactor dần về sau.
      "react-hooks/set-state-in-effect": "warn",
      // 3 rule dưới đây CÙNG HỌ với set-state-in-effect ở trên — cũng thuộc bộ
      // "React Compiler" rule mới của eslint-plugin-react-hooks v7, cũng gắn cờ
      // pattern có sẵn khắp codebase từ trước khi repo có ESLint nghiêm ngặt:
      // - static-components: định nghĩa component con bên trong hàm render của
      //   component cha (vd. renderXxx() trả JSX) — anti-pattern thật nhưng phổ
      //   biến, sửa đúng chuẩn cần tách file, không nên ép vào 1 lần vá bảo mật.
      // - refs: đọc `.current` của ref ngay trong lúc render thay vì trong
      //   effect/event handler.
      // - immutability: gắn cờ NHẦM (false positive) case gọi 1 const function
      //   được khai báo sau trong file nhưng chỉ thực thi bên trong callback bất
      //   đồng bộ (.then()) — lúc đó hàm component đã chạy xong, biến đã tồn tại,
      //   hoàn toàn an toàn runtime. Rule chỉ phân tích tĩnh theo vị trí dòng,
      //   không hiểu ngữ cảnh bất đồng bộ nên báo nhầm.
      "react-hooks/static-components": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      // 60 lỗi (hầu hết dấu " hoặc ' chưa escape trong JSX text) rải rác khắp
      // repo — không auto-fix được bằng `eslint --fix` (đã thử, rule này không
      // hỗ trợ autofix). Sửa tay từng cái là refactor diện rộng không liên quan
      // tới bảo mật, không nên chặn CI vì việc này. Hạ xuống "warn" để track nợ
      // kỹ thuật, dọn dần khi đụng tới từng file thay vì 1 lần sửa hàng loạt.
      "react/no-unescaped-entities": "warn",
      // Codebase có nhiều `any` từ trước (đặc biệt ở các trang admin xử lý response
      // API chưa có type đầy đủ) — bật "error" ngay bây giờ sẽ chặn mọi commit tương
      // lai cho tới khi type hết toàn bộ, không thực tế cho 1 đồ án đang chạy nước
      // rút. Hạ xuống "warn" để track nợ kỹ thuật mà không chặn CI/commit.
      "@typescript-eslint/no-explicit-any": "warn",
      // Mặc định rule này CHỈ cho phép @ts-expect-error, không cho @ts-ignore — vì
      // @ts-expect-error tự báo lỗi nếu dòng dưới không còn lỗi (tính năng tốt).
      // NHƯNG có đúng 1 trường hợp trong repo (CKEditorClient.tsx) mà lỗi TS chỉ
      // xuất hiện trên MỘT SỐ môi trường (khác biệt Windows/Linux khi pnpm resolve
      // node_modules) — @ts-expect-error sẽ tự báo "unused directive" ở máy không
      // gặp lỗi, nên buộc phải dùng @ts-ignore ở đúng chỗ đó. Cho phép cả 2 miễn
      // là có description (giải thích lý do) để tránh lạm dụng bừa bãi.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": "allow-with-description",
          "ts-nocheck": true,
          "ts-check": false,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
