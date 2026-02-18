# アーキテクチャ・技術仕様

## 構成概要

フロントエンドと API は別リポジトリに完全分離されている。

| | フロントエンド（本リポ） | API |
|---|---|---|
| リポジトリ | `nisshi-dev-survey` | `nisshi-dev-survey-api` |
| ドメイン | survey.nisshi.dev | nisshi-dev-survey-api.nisshi.workers.dev |
| デプロイ先 | Vercel | Cloudflare Workers |
| Framework | Vite（SPA） | Hono |

API の技術仕様・エンドポイント・認証フローは API リポジトリの `docs/architecture.md` を参照。

## 技術スタック

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

## プロジェクト構造

```
src/
├── generated/api/    # Orval 生成コード（.gitignore 済み）
├── types/
│   └── survey.ts     # 型定義・定数（API 側の Valibot スキーマが SSoT）
├── main.tsx          # エントリポイント
├── globals.css       # Tailwind CSS + HeroUI スタイル
├── app.tsx           # ルーティング定義
├── lib/
│   └── api-fetcher.ts  # Orval 用カスタムフェッチャー（API URL 付与 + credentials）
├── components/       # 再利用可能なコンポーネント
└── routes/           # ページコンポーネント
    ├── lp.tsx           # ランディングページ
    ├── survey/          # 回答者向けページ
    └── admin/           # 管理画面ページ
```

## API クライアント生成フロー

```
[API リポ] Valibot スキーマ（SSoT）
  └─→ npm run dev → localhost:8787/doc で OpenAPI JSON を配信

[フロントリポ] npm run generate:client
  └─→ Orval: localhost:8787/doc から OpenAPI 仕様を取得 → SWR hooks 自動生成（src/generated/api/）
```

Vercel ビルドでは環境変数 `OPENAPI_URL=https://nisshi-dev-survey-api.nisshi.workers.dev/doc` を設定し、デプロイ済み API から取得する。

## 開発環境

- フロントと API を別プロセスで起動する
  - API: `npm run dev`（localhost:8787）— `wrangler dev`
  - フロント: `npm run dev`（localhost:5173）— Vite の `server.proxy` で `/api/*` を localhost:8787 にプロキシ（`/api` プレフィックスを除去して転送）
- 環境変数は `.env` に設定
  - `VITE_API_URL` — API の URL（本番: `https://nisshi-dev-survey-api.nisshi.workers.dev`、開発時は未設定 → `/api` プレフィックス経由でプロキシ）

## UI 実装方針

- **HeroUI v3 beta をベースに UI を実装する**
- HeroUI v3 は Tailwind CSS v4 + React Aria Components ベースの複合コンポーネントライブラリ
- Provider 不要。コンポーネントを直接 import して使用する
- `onClick` ではなく `onPress` を使用する（React Aria 準拠）
- アニメーションは motion を使用する（HeroUI の CSS トランジションと併用可能）
- スタイルのカスタマイズは Tailwind CSS ユーティリティクラスまたは HeroUI のテーマ変数で行う
- HeroUI コンポーネントの実装時は `.claude/skills/heroui-react` のスクリプトで最新ドキュメントを参照する

## Vercel デプロイ

- **Framework Preset:** Vite（`vercel.json` で明示指定）
- **ビルドコマンド:** `npm run build`（Orval API クライアント生成 + Vite ビルド）
- **出力:** `dist/` を静的ファイルとして配信
- **SPA フォールバック:** `vercel.json` の `rewrites` で全パスを `index.html` にフォールバック
- **環境変数:**
  - `VITE_API_URL=https://nisshi-dev-survey-api.nisshi.workers.dev`
  - `OPENAPI_URL=https://nisshi-dev-survey-api.nisshi.workers.dev/doc`
