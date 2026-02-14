# nisshi-dev Survey

Google Forms の軽量版。アンケートを作成し、固定 URL を共有して回答を集める。

## docs

| ドキュメント | 内容 |
|---|---|
| [docs/overview.md](docs/overview.md) | 要件定義・仕様 |
| [docs/architecture.md](docs/architecture.md) | アーキテクチャ・技術仕様 |
| [docs/git-guidelines.md](docs/git-guidelines.md) | Git ガイドライン |
| [docs/coding-rules.md](docs/coding-rules.md) | コーディングルール（ultracite / Biome） |

## 開発コマンド

- `npm run dev` — フロント (Vite:5173) + バック (Hono:3000) を同時起動
- `npm run build` — フロントエンドのビルド
- `npm run vercel-build` — Vercel 用ビルド（prisma generate 含む）

## ドキュメント管理

- 詳細なドキュメントは `docs/` に置く。CLAUDE.md には概要とリンクのみ記載する
- コード変更時に、関連する CLAUDE.md や docs/ の記述が実態と合っているか確認し、古くなっていれば更新する
  - 例: API ルート追加 → docs/architecture.md の API 一覧を更新
  - 例: データモデル変更 → docs/overview.md のデータモデル節を更新
  - 例: 開発コマンド変更 → CLAUDE.md の開発コマンド節を更新
