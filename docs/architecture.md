# アーキテクチャ・技術仕様

## 技術スタック

| レイヤー | 技術 | 役割 |
|---|---|---|
| フロントエンド | React + Vite | SPA。回答画面と管理画面を提供 |
| バックエンド | Hono | REST API サーバー |
| DB | PostgreSQL + Prisma | データ永続化 |
| デプロイ | Vercel | ホスティング + Serverless Functions |

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

## API エンドポイント

### 回答者向け（認証不要）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/survey/:id` | アンケート取得 |
| POST | `/api/survey/:id/submit` | 回答送信 |

### 管理者向け（要認証）

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/admin/auth/login` | ログイン |
| POST | `/api/admin/auth/logout` | ログアウト |
| GET | `/api/admin/auth/me` | セッション確認 |
| GET | `/api/admin/surveys` | アンケート一覧 |
| POST | `/api/admin/surveys` | アンケート作成 |
| GET | `/api/admin/surveys/:id` | アンケート詳細 |
| GET | `/api/admin/surveys/:id/responses` | 回答一覧 |

### その他

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/health` | ヘルスチェック |

## 開発環境

- `npm run dev` で Vite 開発サーバーを起動（フロント + API を単一プロセスで提供、ポート 5173）
- `@hono/vite-dev-server` により Hono API が Vite のミドルウェアとして動作
- Prisma スキーマは `prisma/schema.prisma`
- 環境変数は `.env` に `DATABASE_URL` を設定（`.env.example` 参照）

## Vercel デプロイ

- `vercel.ts`（`@vercel/config`）の rewrites で `/api/*` を Serverless Function、それ以外を SPA にルーティング
- `vercel-build` スクリプトで `prisma generate && vite build` を実行
