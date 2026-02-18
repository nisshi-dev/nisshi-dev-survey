# nisshi-dev-survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。

**https://survey.nisshi.dev**

## アーキテクチャ

フロントエンドと API は別リポジトリに分離されている。

| | フロントエンド（本リポ） | API |
|---|---|---|
| リポジトリ | `nisshi-dev-survey` | `nisshi-dev-survey-api` |
| デプロイ先 | Vercel | Cloudflare Workers |
| Framework | Vite（SPA） | Hono |

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フロントエンド | React 19 + Vite 7 |
| UI コンポーネント | HeroUI v3 beta |
| スタイリング | Tailwind CSS v4 |
| アニメーション | motion |
| ルーティング | react-router-dom v7 |
| データ取得 | SWR |
| API クライアント生成 | Orval |
| テスト | Vitest 4.x |
| リント・フォーマット | ultracite (Biome) |

## セットアップ

```bash
npm install
npm run generate:client  # API 開発サーバー起動済みの場合
```

### 環境変数

| 変数 | 説明 | 必要な場面 |
|---|---|---|
| `VITE_API_URL` | API の URL | 本番ビルド |
| `OPENAPI_URL` | OpenAPI JSON の URL | Vercel ビルド |

## 開発

```bash
# ターミナル1: API（別リポ）
cd nisshi-dev-survey-api && npm run dev  # localhost:8787

# ターミナル2: フロントエンド（本リポ）
npm run dev  # localhost:5173 → /api/* を localhost:8787 にプロキシ
```

### 主要コマンド

| コマンド | 説明 |
|---|---|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | プロダクションビルド |
| `npm run check` | リント・フォーマット検査 |
| `npm run fix` | 自動修正 |
| `npm run test:run` | テスト実行 |
| `npm run generate:client` | OpenAPI → SWR hooks 生成 |

詳細は [CLAUDE.md](CLAUDE.md) および [docs/](docs/) を参照。
