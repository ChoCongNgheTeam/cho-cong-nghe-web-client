# 🛒 Chợ Công Nghệ – Web Client

Frontend cho dự án **Chợ Công Nghệ**, được xây dựng với **Next.js (App Router)**, **React**, **TypeScript** và **Tailwind CSS**.

## 📋 Yêu cầu hệ thống

- **Node.js**: >= 20.x
- **npm / yarn / pnpm / bun**
- **Backend API** đã chạy (xem README backend)

## 🚀 Hướng dẫn cài đặt

### 1. Clone Repository

```bash
git clone <https://github.com/ChoCongNgheTeam/cho-cong-nghe-web-client.git>
cd cho-cong-nghe-web-client
```
### 2. Cấu hình Environment Variables
Tạo file `.env.local` ở thư mục root và cấu hình theo template sau:

```env
# Public (client-side)
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Server-only
INTERNAL_API_SECRET=xxx
```

> ⚠️ **Lưu ý**: 
Chỉ biến bắt đầu bằng NEXT_PUBLIC_ mới dùng ở client
INTERNAL_API_SECRET chỉ dùng phía server (App Router)

### 3. Cài đặt Dependencies
```bash
npm install
```
### 4. Chạy Development Server
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


