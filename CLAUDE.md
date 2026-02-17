# nisshi-dev Survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。
UI は **HeroUI v3 beta** + **Tailwind CSS v4** + **motion** で実装する。

## アーキテクチャ

フロントエンドとAPIは別リポジトリ・別 Vercel プロジェクトに分離されている。

| | フロントエンド | API |
|---|---|---|
| リポジトリ | `nisshi-dev-survey`（本リポ） | `nisshi-dev-survey-api`（別リポ） |
| ドメイン | survey.nisshi.dev | api.survey.nisshi.dev |
| Framework | Vite | Other（Vite SSR ビルド） |

## docs

| ドキュメント | 内容 |
|---|---|
| [docs/overview.md](docs/overview.md) | 要件定義・仕様 |
| [docs/architecture.md](docs/architecture.md) | アーキテクチャ・技術仕様 |
| [docs/git-guidelines.md](docs/git-guidelines.md) | Git ガイドライン |
| [docs/coding-rules.md](docs/coding-rules.md) | コーディングルール（ultracite / Biome） |
| [docs/validation.md](docs/validation.md) | バリデーション・型ガード方針（Valibot） |

## 開発手法: TDD（テスト駆動開発）

**このプロジェクトでは TDD を必須とする。** 機能実装・バグ修正のすべてにおいて、実装コードより先にテストを書くこと。

### エージェントへの指示

1. **コードを書く前に `/test-driven-development` スキルを呼び出す** — TDD のルールとワークフローがロードされる
2. **テストの書き方は `/vitest` スキルを参照する** — Vitest 4.x の API・モック・設定の詳細が得られる
3. **Red → Green → Refactor のサイクルを厳守する**
   - RED: 失敗するテストを書き、`npm run test:run` で失敗を確認
   - GREEN: テストを通す最小限のコードを書き、成功を確認
   - REFACTOR: テストをグリーンに保ちながらコードを整理
4. **テストなしにプロダクションコードを書かない（例外なし）**
5. **テストは `npm run test:run` で実行し、結果を確認してから次に進む**

## 開発コマンド

### 開発・ビルド

- `npm run dev` — Vite 開発サーバー起動（ポート 5173、`/api` は localhost:3000 にプロキシ）
- `npm run build` — Orval クライアント生成 + Vite ビルド
- `npm run preview` — ビルド成果物のプレビュー

### リント・フォーマット

- `npm run check` — リント・フォーマットの検査
- `npm run fix` — 自動修正

### テスト

- `npm test` — Vitest をウォッチモードで起動
- `npm run test:run` — テストを1回実行（CI 向け）
- `npm run test:coverage` — カバレッジ付きでテストを実行

### コード生成（`generate:*`）

- `npm run generate:client` — Orval で SWR hooks を生成（`openapi.json` から）

### ユーティリティ

- `npm run clean` — ビルドキャッシュの削除（`dist/`, `node_modules/.cache/`）

## 開発ワークフロー

```
ターミナル1（API）:
  cd nisshi-dev-survey-api && npm run dev  # localhost:3000

ターミナル2（フロント）:
  cd nisshi-dev-survey && npm run dev      # localhost:5173 → /api proxy → :3000
```

API 変更時の型同期フロー:
1. API リポで変更
2. API リポで `npm run generate:openapi` → `openapi.json` 生成
3. `openapi.json` をフロントリポにコピー
4. フロントリポで `npm run generate:client` → SWR hooks 再生成
5. `src/shared/schema/survey.ts` の型定義も必要に応じて同期

## ドキュメント管理

- 詳細なドキュメントは `docs/` に置く。CLAUDE.md には概要とリンクのみ記載する
- コード変更時に、関連する CLAUDE.md や docs/ の記述が実態と合っているか確認し、古くなっていれば更新する
  - 例: API ルート追加 → docs/architecture.md の API 一覧を更新
  - 例: データモデル変更 → docs/overview.md のデータモデル節を更新
  - 例: 開発コマンド変更 → CLAUDE.md の開発コマンド節を更新
