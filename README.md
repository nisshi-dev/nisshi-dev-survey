# nisshi-dev Survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。

**https://survey.nisshi.dev**

## API ドキュメント

Swagger UI で全エンドポイントの仕様確認・テスト実行が可能。

| URL | 説明 |
|---|---|
| https://survey.nisshi.dev/api/ui | Swagger UI |
| https://survey.nisshi.dev/api/doc | OpenAPI JSON |

Valibot スキーマから OpenAPI 3.1 を自動生成している。

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + Vite 7 |
| UI コンポーネント | HeroUI v3 beta |
| スタイリング | Tailwind CSS v4 |
| アニメーション | motion |
| ルーティング | react-router-dom v7 |
| バリデーション | Valibot |
| データ取得 | SWR |
| API クライアント生成 | Orval |
| バックエンド | Hono |
| DB | PostgreSQL + Prisma ORM 7 |
| テスト | Vitest 4.x |
| リント・フォーマット | ultracite (Biome) |
| デプロイ | Vercel |

## セットアップ

```bash
npm install
cp .env.example .env
# .env の各変数を設定
npm run db:migrate:deploy
npm run db:generate
npm run db:seed  # 管理者ユーザー作成（ADMIN_EMAIL, ADMIN_PASSWORD が必要）
npm run generate
```

### 環境変数

| 変数 | 説明 |
|---|---|
| `DATABASE_URL` | Prisma Postgres 接続 URL |
| `ADMIN_EMAIL` | 管理者メールアドレス（seed 用） |
| `ADMIN_PASSWORD` | 管理者パスワード（seed 用） |
| `RESEND_API_KEY` | Resend API キー（回答コピーメール送信用） |
| `RESEND_FROM_EMAIL` | 送信元メールアドレス（未設定時は `onboarding@resend.dev`） |
| `NISSHI_DEV_SURVEY_API_KEY` | データ投入 API の認証キー |

## 開発

```bash
npm run dev
```

Vite 開発サーバーがフロントエンドと API を単一プロセスで提供する。

- http://localhost:5173 — フロントエンド + API
- http://localhost:5173/api/ui — Swagger UI（ローカル）

### 主要コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run check` | リント・フォーマット検査 |
| `npm run fix` | 自動修正 |
| `npm run test:run` | テスト実行 |
| `npm run db:migrate` | マイグレーション作成・適用 |
| `npm run db:studio` | Prisma Studio 起動 |
| `npm run generate` | OpenAPI → SWR hooks 生成 |

詳細は [CLAUDE.md](CLAUDE.md) および [docs/](docs/) を参照。
