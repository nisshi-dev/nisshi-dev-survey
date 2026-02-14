# Hitokoto

シンプルなアンケート収集アプリ。管理者がアンケートを作成し、固定 URL を共有して回答を集める。

## サービス概要

- 回答者: `/survey/:id` にアクセスして回答。アカウント不要、何度でも回答可能（Google Forms と同じオープン方式）
- 管理者: メール + パスワードでログインし、アンケートの作成・回答の閲覧を行う

## 技術スタック

- フロントエンド: React SPA (Vite)
- バックエンド: Hono
- DB: PostgreSQL + Prisma
- デプロイ: Vercel

## プロジェクト構造

```
src/
├── server/          # Hono API サーバー
│   ├── index.ts     # エントリポイント（/api ベース）
│   ├── lib/db.ts    # Prisma クライアント
│   ├── middleware/   # 認証ミドルウェア等
│   └── routes/      # API ルート
│       ├── survey.ts          # 回答者向け API
│       └── admin/             # 管理者向け API
│           ├── auth.ts
│           └── surveys.ts
└── client/          # React SPA
    ├── main.tsx     # エントリポイント
    ├── App.tsx      # ルーティング定義
    ├── survey/      # 回答者向けページ
    └── admin/       # 管理画面ページ
```

## データモデル

- Survey → Response（1対多）: アンケートと回答
- AdminUser → Session（1対多）: 管理者とログインセッション

## 開発コマンド

- `npm run dev` — フロント (Vite:5173) + バック (Hono:3000) を同時起動
- `npm run build` — フロントエンドのビルド
- `npm run vercel-build` — Vercel 用ビルド（prisma generate 含む）

## 開発時の注意

- API は `/api` プレフィックス付き。Vite の proxy で開発時は 5173 → 3000 に転送される
- Prisma スキーマは `prisma/schema.prisma`
- 環境変数は `.env` に `DATABASE_URL` を設定（`.env.example` 参照）
