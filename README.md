# Hitokoto

シンプルなアンケート収集アプリ。

## 技術スタック

- フロントエンド: React + Vite
- バックエンド: Hono
- DB: PostgreSQL + Prisma
- デプロイ: Vercel

## セットアップ

```bash
npm install
cp .env.example .env
# .env の DATABASE_URL を編集
npx prisma generate
```

## 開発

```bash
npm run dev
```

- フロントエンド: http://localhost:5173
- API: http://localhost:3000/api/health
