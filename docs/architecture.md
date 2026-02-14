# アーキテクチャ・技術仕様

## 技術スタック

| レイヤー | 技術 | 役割 |
|---|---|---|
| フロントエンド | React + Vite | SPA。回答画面と管理画面を提供 |
| ルーティング | react-router-dom v7（Declarative mode） | `<BrowserRouter>` + `<Routes>` による SPA ルーティング |
| データ取得 | SWR（`useSWR` / `useSWRMutation`） | キャッシュ付きデータフェッチ・ミューテーション |
| バックエンド | Hono | REST API サーバー |
| DB | Prisma Postgres + Prisma ORM 7 | マネージド PostgreSQL（`@prisma/adapter-pg` で直接接続） |
| デプロイ | Vercel | ホスティング + Serverless Functions |

## プロジェクト構造

```
prisma/
├── schema.prisma    # Prisma スキーマ定義
└── migrations/      # マイグレーション履歴
prisma.config.ts     # Prisma CLI 設定（datasource URL 等）
src/
├── generated/prisma/  # Prisma Client 生成コード（.gitignore 済み）
├── server/          # Hono API サーバー
│   ├── index.ts     # エントリポイント（/api ベース）
│   ├── lib/db.ts    # Prisma クライアント（adapter-pg 直接接続）
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
- Prisma スキーマは `prisma/schema.prisma`、CLI 設定は `prisma.config.ts`
- Prisma Client は `src/generated/prisma/` に生成（`.gitignore` 済み）
- 環境変数は `.env` に `DATABASE_URL` を設定（`.env.example` 参照）
- DB は [Prisma Postgres](https://console.prisma.io)（`@prisma/adapter-pg` で直接接続）

## Vercel デプロイ

- `vercel.ts`（`@vercel/config`）の rewrites で `/api/*` を Serverless Function、それ以外を SPA にルーティング
- `build` スクリプト（`prisma generate && vite build`）を Vercel もローカルも共通で使用
