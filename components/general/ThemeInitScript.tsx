"use client";

import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT_SCRIPT = `
  try {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
`;

/**
 * Chèn script chống FOUC theme (dark/light) trực tiếp vào HTML stream lúc SSR
 * qua useServerInsertedHTML — thay vì để <script> là 1 phần tử JSX bình thường
 * trong cây React. Next.js 16.2+/React 19 cảnh báo "Encountered a script tag
 * while rendering React component" cho MỌI <script> nằm trong cây React
 * (kể cả next/script strategy="beforeInteractive") — đây là false positive
 * đã biết, chưa được Next.js/React fix. useServerInsertedHTML né được vì nó
 * chèn HTML thẳng vào stream SSR, không đi qua reconciliation của React nên
 * không bị runtime kiểm tra/cảnh báo. Hành vi chống flash giữ nguyên như cũ.
 */
export default function ThemeInitScript() {
  useServerInsertedHTML(() => <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />);
  return null;
}
