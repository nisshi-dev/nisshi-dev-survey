# Hitokoto

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。

詳細は [docs/overview.md](docs/overview.md) を参照。

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

## Git ガイドライン

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従う。

```
<prefix>: <要約（日本語）>
```

prefix 一覧:

- `feat:` — 新機能
- `fix:` — バグ修正
- `refactor:` — 機能変更を伴わないコード改善
- `docs:` — ドキュメントのみの変更
- `style:` — フォーマット変更（動作に影響しない）
- `chore:` — ビルド設定、依存関係の更新など

ルール:

- 要約は日本語で簡潔に書く
- body が必要な場合は空行を挟んで詳細を書く
- 1コミット1関心事。変更が複数の関心事にまたがる場合は分割する

### ブランチ

- `main` — 本番ブランチ
- `feat/<name>` — 機能開発
- `fix/<name>` — バグ修正

## 開発時の注意

- API は `/api` プレフィックス付き。Vite の proxy で開発時は 5173 → 3000 に転送される
- Prisma スキーマは `prisma/schema.prisma`
- 環境変数は `.env` に `DATABASE_URL` を設定（`.env.example` 参照）
