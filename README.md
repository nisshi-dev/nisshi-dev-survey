# nisshi-dev Survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。

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
cp .env .env.local
# .env.local の DATABASE_URL 等を編集
npm run db:generate
npm run db:migrate
npm run generate
```

## 開発

```bash
npm run dev
```

Vite 開発サーバーがフロントエンドと API を単一プロセスで提供します。

- http://localhost:5173 — フロントエンド + API

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

詳細は [CLAUDE.md](CLAUDE.md) および [docs/](docs/) を参照してください。
