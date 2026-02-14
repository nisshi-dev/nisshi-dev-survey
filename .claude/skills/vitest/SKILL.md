---
name: vitest
description: Vite ベースの高速ユニットテストフレームワーク。Jest 互換 API を提供。テストの作成、モック、カバレッジ設定、テストのフィルタリングやフィクスチャを扱う時に使用。
metadata:
  author: Anthony Fu
  version: "2026.1.28"
  source: Generated from https://github.com/vitest-dev/vitest, scripts located at https://github.com/antfu/skills
---

Vitest は Vite を基盤とした次世代テストフレームワーク。Jest 互換の API を提供し、ESM・TypeScript・JSX をネイティブにサポートする（設定不要）。Vitest は Vite アプリと同じ設定、トランスフォーマー、リゾルバー、プラグインを共有する。

**主な特徴:**
- Vite ネイティブ: Vite の変換パイプラインを使用し、HMR のような高速テスト更新を実現
- Jest 互換: 多くの Jest テストスイートのドロップイン置き換え
- スマートウォッチモード: モジュールグラフに基づき影響のあるテストのみ再実行
- ESM、TypeScript、JSX を設定なしでネイティブサポート
- マルチスレッドワーカーによる並列テスト実行
- V8 または Istanbul による組み込みカバレッジ
- スナップショットテスト、モック、スパイユーティリティ

> このスキルは Vitest 3.x ベース、2026-01-28 に生成。

## コア

| トピック | 説明 | リファレンス |
|---------|------|-------------|
| 設定 | Vitest と Vite の設定統合、defineConfig の使い方 | [core-config](references/core-config.md) |
| CLI | コマンドラインインターフェース、コマンドとオプション | [core-cli](references/core-cli.md) |
| Test API | test/it 関数、skip・only・concurrent 等の修飾子 | [core-test-api](references/core-test-api.md) |
| Describe API | テストのグルーピングとネストされたスイート用の describe/suite | [core-describe](references/core-describe.md) |
| Expect API | toBe、toEqual、マッチャー、非対称マッチャーによるアサーション | [core-expect](references/core-expect.md) |
| フック | beforeEach、afterEach、beforeAll、afterAll、aroundEach | [core-hooks](references/core-hooks.md) |

## 機能

| トピック | 説明 | リファレンス |
|---------|------|-------------|
| モック | vi ユーティリティによる関数・モジュール・タイマー・日付のモック | [features-mocking](references/features-mocking.md) |
| スナップショット | toMatchSnapshot とインラインスナップショットによるスナップショットテスト | [features-snapshots](references/features-snapshots.md) |
| カバレッジ | V8 または Istanbul プロバイダによるコードカバレッジ | [features-coverage](references/features-coverage.md) |
| テストコンテキスト | テストフィクスチャ、context.expect、カスタムフィクスチャ用の test.extend | [features-context](references/features-context.md) |
| 並行実行 | 並行テスト、並列実行、シャーディング | [features-concurrency](references/features-concurrency.md) |
| フィルタリング | 名前、ファイルパターン、タグによるテストのフィルタリング | [features-filtering](references/features-filtering.md) |

## 応用

| トピック | 説明 | リファレンス |
|---------|------|-------------|
| Vi ユーティリティ | vi ヘルパー: mock、spyOn、フェイクタイマー、hoisted、waitFor | [advanced-vi](references/advanced-vi.md) |
| 環境 | テスト環境: node、jsdom、happy-dom、カスタム | [advanced-environments](references/advanced-environments.md) |
| 型テスト | expectTypeOf と assertType による型レベルテスト | [advanced-type-testing](references/advanced-type-testing.md) |
| プロジェクト | マルチプロジェクトワークスペース、プロジェクトごとの異なる設定 | [advanced-projects](references/advanced-projects.md) |
