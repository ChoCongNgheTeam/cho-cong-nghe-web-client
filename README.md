This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```
Frontend chạy tại:
👉 http://localhost:3000

### 5.📦 Scripts Available
```bash
npm run dev     # Development
npm run build   # Build production
npm run start   # Run production
npm run lint    # Lint code
```

## 📁 Cấu trúc dự án
cho-cong-nghe-web-client/
├── .next/
├── app/
│   ├── (admin)/
│   ├── (client)/
│   ├── api/
│   ├── components/
│   ├── config/
│   ├── contexts/
│   ├── helpers/
│   ├── hooks/
│   ├── lib/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── sitemap.ts
├── node_modules/
├── public/
├── .env.local
├── .gitignore
├── eslint.config.mjs
├── middlewares.ts
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
└── robots.ts

## 🔗 Kết nối Backend
Frontend gọi API thông qua:
```bash
process.env.NEXT_PUBLIC_API_BASE_URL
```
Backend mặc định chạy tại:
👉 `http://localhost:5000`

## 🤝 Contributing

1. Tạo branch mới từ `develop`
2. Commit changes của bạn
3. Push lên GitHub
4. Tạo Pull Request

## 📞 Liên hệ

Nếu gặp vấn đề, liên hệ team leader để được hỗ trợ.