# アーキテクチャ・技術仕様

## 技術スタック

| レイヤー | 技術 | 役割 |
|---|---|---|
| フロントエンド | React + Vite | SPA。回答画面と管理画面を提供 |
| UI コンポーネント | HeroUI v3 beta | React Aria ベースのアクセシブルなコンポーネントライブラリ。beta 版のため破壊的変更の可能性あり |
| スタイリング | Tailwind CSS v4 + `@heroui/styles` + `@tailwindcss/typography` | ユーティリティファースト CSS。`@tailwindcss/vite` で統合。`prose` クラスで Markdown レンダリング |
| アニメーション | motion | 軽量アニメーションライブラリ（Framer Motion の後継） |
| ルーティング | react-router-dom v7（Declarative mode） | `<BrowserRouter>` + `<Routes>` による SPA ルーティング |
| バリデーション | Valibot | スキーマベースの型安全なバリデーション・型ガード（SSoT） |
| Markdown レンダリング | react-markdown + remark-gfm | アンケート説明文の Markdown 表示 |
| データ取得 | SWR（`useSWR` / `useSWRMutation`） | キャッシュ付きデータフェッチ・ミューテーション |
| API ドキュメント | hono-openapi + @hono/swagger-ui | Valibot スキーマから OpenAPI 3.1 自動生成 + Swagger UI |
| API クライアント生成 | Orval（@orval/swr） | OpenAPI → SWR hooks 自動生成 |
| バックエンド | Hono | REST API サーバー |
| DB | Prisma Postgres + Prisma ORM 7 | マネージド PostgreSQL（`@prisma/adapter-pg` で直接接続） |
| メール送信 | Resend | 回答コピーメールのトランザクショナル送信 |
| テスト | Vitest 4.x + @vitest/coverage-v8 | TDD ベースのユニットテスト・カバレッジ |
| デプロイ | Vercel | ホスティング + Serverless Functions |

## プロジェクト構造

```
prisma/
├── schema.prisma    # Prisma スキーマ定義
└── migrations/      # マイグレーション履歴
prisma.config.ts     # Prisma CLI 設定（datasource URL 等）
src/
├── generated/prisma/  # Prisma Client 生成コード（.gitignore 済み）
├── shared/          # サーバー・クライアント共通コード
│   └── schema/      # Valibot スキーマ + 導出型（SSoT）
├── server/          # Hono API サーバー
│   ├── index.ts     # エントリポイント（/api ベース）
│   ├── entry-vercel.ts # Vercel Serverless Function エントリ
│   ├── lib/db.ts    # Prisma クライアント（adapter-pg 直接接続）
│   ├── lib/email.ts # メール送信ユーティリティ（Resend SDK）
│   ├── middleware/   # 認証ミドルウェア等
│   └── routes/      # API ルート
│       ├── survey.ts          # 回答者向け API
│       ├── admin/             # 管理者向け API
│       │   ├── auth.ts
│       │   └── surveys.ts
│       └── data/              # データ投入 API（API キー認証）
│           └── surveys.ts
└── client/          # React SPA
    ├── main.tsx     # エントリポイント
    ├── globals.css  # Tailwind CSS + HeroUI スタイル
    ├── app.tsx      # ルーティング定義
    ├── lib/
    │   └── api-fetcher.ts  # Orval 用カスタムフェッチャー（API URL 付与 + credentials）
    ├── survey/      # 回答者向けページ
    └── admin/       # 管理画面ページ
```

## API エンドポイント

### 回答者向け（認証不要）

| メソッド | パス | 説明 | 状態 |
|---|---|---|---|
| GET | `/api/survey/:id` | アンケート取得（status=active のみ、それ以外は 404）。パラメータ定義・データエントリ一覧を含む | 実装済み |
| POST | `/api/survey/:id/submit` | 回答送信（status=active のみ、それ以外は 404）。`dataEntryId` でデータエントリに紐付け、`params` でパラメータ値を送信可能。`sendCopy: true` + `respondentEmail` 指定時に回答コピーメールを fire-and-forget で送信 | 実装済み |

### 管理者向け（要認証）

| メソッド | パス | 説明 | 状態 |
|---|---|---|---|
| POST | `/api/admin/auth/login` | ログイン（scrypt 検証 → Cookie 発行） | 実装済み |
| POST | `/api/admin/auth/logout` | ログアウト（Session 削除 → Cookie 削除） | 実装済み |
| GET | `/api/admin/auth/me` | セッション確認（ユーザー情報返却） | 実装済み |
| GET | `/api/admin/surveys` | アンケート一覧（createdAt 降順） | 実装済み |
| POST | `/api/admin/surveys` | アンケート作成（パラメータ定義を含む） | 実装済み |
| GET | `/api/admin/surveys/:id` | アンケート詳細（パラメータ定義・データエントリ一覧を含む、404 対応） | 実装済み |
| PUT | `/api/admin/surveys/:id` | アンケート内容更新（active/completed は質問変更不可、パラメータはステータス問わず変更可能） | 実装済み |
| PATCH | `/api/admin/surveys/:id` | アンケートステータス更新（draft/active/completed） | 実装済み |
| DELETE | `/api/admin/surveys/:id` | アンケート削除（completed は削除不可、レスポンスはカスケード削除） | 実装済み |
| GET | `/api/admin/surveys/:id/responses` | 回答一覧（各回答のパラメータ値・dataEntryId を含む、404 対応） | 実装済み |
| POST | `/api/admin/surveys/:id/data-entries` | データエントリ作成 | 実装済み |
| PUT | `/api/admin/surveys/:id/data-entries/:entryId` | データエントリ更新 | 実装済み |
| DELETE | `/api/admin/surveys/:id/data-entries/:entryId` | データエントリ削除（回答紐付きの場合は 400） | 実装済み |

### データ投入 API（API キー認証）

| メソッド | パス | 説明 | 状態 |
|---|---|---|---|
| POST | `/api/data/surveys` | アンケート作成（`status` 指定可） | 実装済み |
| GET | `/api/data/surveys` | アンケート一覧取得 | 実装済み |
| GET | `/api/data/surveys/:id` | アンケート詳細取得（データエントリ一覧を含む） | 実装済み |
| POST | `/api/data/surveys/:id/responses` | 回答一括投入（`dataEntryId` 対応） | 実装済み |
| GET | `/api/data/surveys/:id/data-entries` | データエントリ一覧取得 | 実装済み |
| POST | `/api/data/surveys/:id/data-entries` | データエントリ作成 | 実装済み |

### その他

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/doc` | OpenAPI JSON |
| GET | `/api/ui` | Swagger UI |

## API ドキュメント生成フロー

```
Valibot スキーマ（SSoT: src/shared/schema/）
  ├─→ hono-openapi: バリデーション + OpenAPI 3.1 自動生成
  │     ├─→ /api/doc: OpenAPI JSON エンドポイント
  │     └─→ /api/ui: Swagger UI（ブラウザで API テスト）
  └─→ Orval: openapi.json → SWR hooks 自動生成（src/generated/api/）
```

- `npm run generate:openapi` — OpenAPI JSON をファイルに出力（`openapi.json`）
- `npm run generate:client` — Orval で SWR hooks を生成（`src/generated/api/`）
- `npm run generate` — 上記 2 つを順に実行
- 生成物（`openapi.json`, `src/generated/`）は `.gitignore` 済み

## 認証フロー

```
ブラウザ → POST /api/admin/auth/login (email, password)
  → サーバー: AdminUser 検索 → scrypt でパスワード検証
  → 成功: Session レコード作成 → Set-Cookie: session=<sessionId> (HttpOnly, SameSite=Lax)
  → 失敗: 401 { error: "Invalid email or password" }

ブラウザ → GET /api/admin/surveys/* (Cookie: session=<sessionId>)
  → adminAuth ミドルウェア: Session 検索 → 期限チェック → c.set("user", { id, email })
  → 有効: next() → ルートハンドラ実行
  → 無効/なし: 401 { error: "Unauthorized" }

ブラウザ → POST /api/admin/auth/logout (Cookie: session=<sessionId>)
  → サーバー: Session レコード削除 → Cookie 削除
```

- パスワードハッシュ: `node:crypto` の `scrypt`（salt 16 bytes + key 64 bytes、`hex:hex` 形式）
- セッション有効期限: 7 日間
- Cookie: `HttpOnly`, `Secure`（本番のみ）, `SameSite=None`（本番）/ `Lax`（ローカル）, `Path=/`

## 開発環境

- `npm run dev` で Vite 開発サーバーを起動（フロント + API を単一プロセスで提供、ポート 5173）
- `@hono/vite-dev-server` により Hono API が Vite のミドルウェアとして動作
- Prisma スキーマは `prisma/schema.prisma`、CLI 設定は `prisma.config.ts`
- Prisma Client は `src/generated/prisma/` に生成（`.gitignore` 済み）
- 環境変数は `.env` に設定（`.env.example` 参照）
  - `DATABASE_URL` — Prisma Postgres 接続 URL
  - `RESEND_API_KEY` — Resend API キー（回答コピーメール送信に使用）
  - `RESEND_FROM_EMAIL` — 送信元メールアドレス（未設定時は Resend サンドボックスの `onboarding@resend.dev`）
  - `NISSHI_DEV_SURVEY_API_KEY` — データ投入 API の認証キー（`X-API-Key` ヘッダーで送信）
  - `VITE_API_URL` — API サーバーの URL（本番: `https://api.survey.nisshi.dev`、ローカルは空）
  - `ALLOWED_ORIGIN` — CORS 許可オリジン（本番: `https://survey.nisshi.dev`、ローカルは空）
- DB は [Prisma Postgres](https://console.prisma.io)（`@prisma/adapter-pg` で直接接続）

## UI 実装方針

- **HeroUI v3 beta をベースに UI を実装する**
- HeroUI v3 は Tailwind CSS v4 + React Aria Components ベースの複合コンポーネントライブラリ
- Provider 不要。コンポーネントを直接 import して使用する
- `onClick` ではなく `onPress` を使用する（React Aria 準拠）
- アニメーションは motion を使用する（HeroUI の CSS トランジションと併用可能）
- スタイルのカスタマイズは Tailwind CSS ユーティリティクラスまたは HeroUI のテーマ変数で行う
- HeroUI コンポーネントの実装時は `.claude/skills/heroui-react` のスクリプトで最新ドキュメントを参照する

## Vercel デプロイ（分離構成）

同一リポジトリから 2 つの Vercel プロジェクトとしてデプロイする。

| | フロントエンド | API |
|---|---|---|
| Vercel プロジェクト | nisshi-dev-survey（既存） | 新規作成 |
| ビルド | `npm run build`（SPA 静的ファイル） | `npm run build:api:vercel`（マイグレーション + バンドル済み Serverless Function） |
| ドメイン | survey.nisshi.dev | api.survey.nisshi.dev |

### フロントエンド

- Framework Preset を **Vite** にすることで SPA フォールバックが自動適用される
- `VITE_API_URL` 環境変数で API サーバーの URL を設定
- Orval 生成の SWR hooks は `apiFetcher`（`src/client/lib/api-fetcher.ts`）経由で API を呼び出す

### API（Serverless Function）

- `build:api`（`vite build --ssr`）で Hono アプリをバンドルし `api/index.js` を生成
- Vercel が `api/index.js` を Serverless Function として検出・実行
- `ALLOWED_ORIGIN` 環境変数で CORS 許可オリジンを設定
- Cookie は `SameSite=None; Secure` でクロスオリジン送信に対応

### ローカル開発

変更なし: `npm run dev` で Vite + Hono が同一プロセスで動作（ポート 5173）。
`VITE_API_URL` と `ALLOWED_ORIGIN` は未設定のまま。
