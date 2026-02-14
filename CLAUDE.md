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

## 開発手法

**TDD（テスト駆動開発）を採用する。** 機能実装・バグ修正の際は `/test-driven-development` スキルを使い、Red-Green-Refactor サイクルに従うこと。

- 失敗するテストを先に書く → 失敗を確認 → 最小限の実装 → リファクタリング
- テストなしにプロダクションコードを書かない
- 詳細は `.claude/skills/test-driven-development/SKILL.md` を参照

## 開発コマンド

- `npm run dev` — Vite 開発サーバー起動（フロント + API を単一プロセスで提供、ポート 5173）
- `npm run build` — prisma generate + フロントエンドのビルド

## ドキュメント管理

- 詳細なドキュメントは `docs/` に置く。CLAUDE.md には概要とリンクのみ記載する
- コード変更時に、関連する CLAUDE.md や docs/ の記述が実態と合っているか確認し、古くなっていれば更新する
  - 例: API ルート追加 → docs/architecture.md の API 一覧を更新
  - 例: データモデル変更 → docs/overview.md のデータモデル節を更新
  - 例: 開発コマンド変更 → CLAUDE.md の開発コマンド節を更新
