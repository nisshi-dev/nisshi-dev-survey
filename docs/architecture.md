# アーキテクチャ・技術仕様

## 構成概要

フロントエンドと API は別リポジトリ・別 Vercel プロジェクトに完全分離されている。

| | フロントエンド | API |
|---|---|---|
| リポジトリ | `nisshi-dev-survey` | `nisshi-dev-survey-api` |
| ドメイン | survey.nisshi.dev | api.survey.nisshi.dev |
| Framework | Vite（SPA） | Hono（Vite SSR ビルド） |
| Build | `npm run build` | `npm run build:vercel` |

## 技術スタック（フロントエンド）

| レイヤー | 技術 | 役割 |
|---|---|---|
| フロントエンド | React + Vite | SPA。回答画面と管理画面を提供 |
| UI コンポーネント | HeroUI v3 beta | React Aria ベースのアクセシブルなコンポーネントライブラリ。beta 版のため破壊的変更の可能性あり |
| スタイリング | Tailwind CSS v4 + `@heroui/styles` + `@tailwindcss/typography` | ユーティリティファースト CSS。`@tailwindcss/vite` で統合。`prose` クラスで Markdown レンダリング |
| アニメーション | motion | 軽量アニメーションライブラリ（Framer Motion の後継） |
| ルーティング | react-router-dom v7（Declarative mode） | `<BrowserRouter>` + `<Routes>` による SPA ルーティング |
| Markdown レンダリング | react-markdown + remark-gfm | アンケート説明文の Markdown 表示 |
| データ取得 | SWR（`useSWR` / `useSWRMutation`） | キャッシュ付きデータフェッチ・ミューテーション |
| API クライアント生成 | Orval（@orval/swr） | OpenAPI → SWR hooks 自動生成 |
| テスト | Vitest 4.x + @vitest/coverage-v8 | TDD ベースのユニットテスト・カバレッジ |
| デプロイ | Vercel（Vite preset） | 静的ファイルホスティング + SPA フォールバック |

## 技術スタック（API）— 別リポジトリ

| レイヤー | 技術 | 役割 |
|---|---|---|
| バックエンド | Hono | REST API サーバー |
| バリデーション | Valibot | スキーマベースの型安全なバリデーション・型ガード（SSoT） |
| API ドキュメント | hono-openapi + @hono/swagger-ui | Valibot スキーマから OpenAPI 3.1 自動生成 + Swagger UI |
| DB | Prisma Postgres + Prisma ORM 7 | マネージド PostgreSQL（`@prisma/adapter-pg` で直接接続） |
| メール送信 | Resend | 回答コピーメールのトランザクショナル送信 |
| テスト | Vitest 4.x | TDD ベースのユニットテスト |
| デプロイ | Vercel（Other preset） | `vite build --ssr` で全依存をバンドル → Serverless Function |

## プロジェクト構造（フロントエンド）

```
src/
├── generated/api/    # Orval 生成コード（.gitignore 済み）
├── shared/           # フロント側の型定義
│   └── schema/       # API の Valibot スキーマに対応する TypeScript 型
│       └── survey.ts # Question, SurveyParam 等（API 側が SSoT）
└── client/           # React SPA
    ├── main.tsx      # エントリポイント
    ├── globals.css   # Tailwind CSS + HeroUI スタイル
    ├── app.tsx       # ルーティング定義
    ├── lib/
    │   └── api-fetcher.ts  # Orval 用カスタムフェッチャー（API URL 付与 + credentials）
    ├── components/   # 再利用可能なコンポーネント
    └── routes/       # ページコンポーネント
        ├── lp.tsx           # ランディングページ
        ├── survey/          # 回答者向けページ
        └── admin/           # 管理画面ページ
```

## API エンドポイント

API は `api.survey.nisshi.dev` で提供される。詳細は API リポジトリを参照。

### 回答者向け（認証不要）

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/survey/:id` | アンケート取得（status=active のみ） |
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
| PUT | `/api/admin/surveys/:id` | アンケート内容更新 |
| PATCH | `/api/admin/surveys/:id` | ステータス更新 |
| DELETE | `/api/admin/surveys/:id` | アンケート削除 |
| GET | `/api/admin/surveys/:id/responses` | 回答一覧 |
| POST | `/api/admin/surveys/:id/data-entries` | データエントリ作成 |
| PUT | `/api/admin/surveys/:id/data-entries/:entryId` | データエントリ更新 |
| DELETE | `/api/admin/surveys/:id/data-entries/:entryId` | データエントリ削除 |

### データ投入 API（API キー認証）

| メソッド | パス | 説明 |
|---|---|---|
| POST | `/api/data/surveys` | アンケート作成 |
| GET | `/api/data/surveys` | アンケート一覧 |
| GET | `/api/data/surveys/:id` | アンケート詳細 |
| POST | `/api/data/surveys/:id/responses` | 回答一括投入 |
| GET | `/api/data/surveys/:id/data-entries` | データエントリ一覧 |
| POST | `/api/data/surveys/:id/data-entries` | データエントリ作成 |

### その他

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/doc` | OpenAPI JSON |
| GET | `/api/ui` | Swagger UI |

## API ドキュメント生成フロー

```
[API リポ] Valibot スキーマ（SSoT: src/shared/schema/）
  ├─→ hono-openapi: バリデーション + OpenAPI 3.1 自動生成
  │     ├─→ /api/doc: OpenAPI JSON エンドポイント
  │     └─→ /api/ui: Swagger UI（ブラウザで API テスト）
  └─→ npm run generate:openapi → openapi.json

[フロントリポ] openapi.json をコピー
  └─→ Orval: openapi.json → SWR hooks 自動生成（src/generated/api/）
```

## 認証フロー

```
ブラウザ → POST /api/admin/auth/login (email, password)
  → サーバー: AdminUser 検索 → scrypt でパスワード検証
  → 成功: Session レコード作成 → Set-Cookie: session=<sessionId> (HttpOnly, Secure, SameSite=None)
  → 失敗: 401 { error: "Invalid email or password" }

ブラウザ → GET /api/admin/surveys/* (Cookie: session=<sessionId>)
  → adminAuth ミドルウェア: Session 検索 → 期限チェック → c.set("user", { id, email })
  → 有効: next() → ルートハンドラ実行
  → 無効/なし: 401 { error: "Unauthorized" }
```

- パスワードハッシュ: `node:crypto` の `scrypt`（salt 16 bytes + key 64 bytes、`hex:hex` 形式）
- セッション有効期限: 7 日間
- Cookie: `HttpOnly`, `Secure`（本番のみ）, `SameSite=None`（本番）/ `Lax`（ローカル）, `Path=/`

## 開発環境

- フロントとAPIを別プロセスで起動する
  - API: `npm run dev`（localhost:3000）— `@hono/node-server` で起動
  - フロント: `npm run dev`（localhost:5173）— Vite の `server.proxy` で `/api` を localhost:3000 にプロキシ
- 環境変数は `.env` に設定
  - `VITE_API_URL` — API の URL（本番: `https://api.survey.nisshi.dev`、開発時は空 → プロキシ経由）

## UI 実装方針

- **HeroUI v3 beta をベースに UI を実装する**
- HeroUI v3 は Tailwind CSS v4 + React Aria Components ベースの複合コンポーネントライブラリ
- Provider 不要。コンポーネントを直接 import して使用する
- `onClick` ではなく `onPress` を使用する（React Aria 準拠）
- アニメーションは motion を使用する（HeroUI の CSS トランジションと併用可能）
- スタイルのカスタマイズは Tailwind CSS ユーティリティクラスまたは HeroUI のテーマ変数で行う
- HeroUI コンポーネントの実装時は `.claude/skills/heroui-react` のスクリプトで最新ドキュメントを参照する

## Vercel デプロイ

### フロントエンド（survey.nisshi.dev）

- **Framework Preset:** Vite
- **ビルドコマンド:** `npm run build`（Orval API クライアント生成 + Vite ビルド）
- **出力:** `dist/` を静的ファイルとして配信（SPA フォールバック自動設定）
- **環境変数:** `VITE_API_URL=https://api.survey.nisshi.dev`

### API（api.survey.nisshi.dev）— 別プロジェクト

- **Framework Preset:** Other
- **ビルドコマンド:** `npm run build:vercel`（Prisma Client 生成 + `vite build --ssr` で全依存をバンドル）
- **Output Directory:** `dist`
- **環境変数:** `DATABASE_URL`, `ALLOWED_ORIGIN=https://survey.nisshi.dev`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `NISSHI_DEV_SURVEY_API_KEY`
