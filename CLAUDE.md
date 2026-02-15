# nisshi-dev Survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。
UI は **HeroUI v3 beta** + **Tailwind CSS v4** + **motion** で実装する。

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

- `npm run dev` — Vite 開発サーバー起動（フロント + API を単一プロセスで提供、ポート 5173）
- `npm run build` — マイグレーション適用 + prisma generate + コード生成 + Vite ビルド
- `npm run preview` — ビルド成果物のプレビュー

### リント・フォーマット

- `npm run check` — リント・フォーマットの検査
- `npm run fix` — 自動修正

### テスト

- `npm test` — Vitest をウォッチモードで起動
- `npm run test:run` — テストを1回実行（CI 向け）
- `npm run test:coverage` — カバレッジ付きでテストを実行

### データベース（`db:*`）

- `npm run db:generate` — Prisma Client 生成
- `npm run db:migrate` — マイグレーション作成・適用（開発用）
- `npm run db:migrate:deploy` — マイグレーション適用のみ（本番/CI 用）
- `npm run db:studio` — Prisma Studio 起動（ブラウザで DB を閲覧・編集）
- `npm run db:seed` — 管理者ユーザー作成（`ADMIN_EMAIL`, `ADMIN_PASSWORD` 環境変数が必要）

### コード生成（`generate:*`）

- `npm run generate` — OpenAPI JSON 出力 + SWR hooks 生成
- `npm run generate:openapi` — OpenAPI JSON をファイルに出力
- `npm run generate:client` — Orval で SWR hooks を生成

### ユーティリティ

- `npm run clean` — ビルドキャッシュの削除（`dist/`, `node_modules/.cache/`）

## ドキュメント管理

- 詳細なドキュメントは `docs/` に置く。CLAUDE.md には概要とリンクのみ記載する
- コード変更時に、関連する CLAUDE.md や docs/ の記述が実態と合っているか確認し、古くなっていれば更新する
  - 例: API ルート追加 → docs/architecture.md の API 一覧を更新
  - 例: データモデル変更 → docs/overview.md のデータモデル節を更新
  - 例: 開発コマンド変更 → CLAUDE.md の開発コマンド節を更新
