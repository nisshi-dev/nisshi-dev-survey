# コーディングルール

[ultracite](https://github.com/haydenbleasel/ultracite) を使用してリント・フォーマットを統一している。
ultracite は **Biome** をラップした統合ツール。

## コマンド

| コマンド | 説明 |
|---|---|
| `npm run check` | リント・フォーマットの検査（修正なし） |
| `npm run fix` | 自動修正 |

## 構成

`biome.jsonc` で `ultracite/biome/core` と `ultracite/biome/react` を継承している。

---

## フォーマッター

| 項目 | 設定値 |
|---|---|
| インデント | スペース 2 |
| 改行コード | LF |
| 行幅 | 80 文字 |
| セミコロン | あり |
| 末尾カンマ | ES5 準拠（配列・オブジェクトのみ） |
| アロー関数の括弧 | 常にあり `(x) => ...` |
| JSX 引用符 | ダブルクォート |
| ブラケットスペース | あり `{ key: value }` |

---

## リントルール概要

### アクセシビリティ（a11y）

- `<img>` には `alt`、`<button>` には `type`、`<html>` には `lang` を付ける
- インタラクティブ要素にはキーボードイベントを併記する
- ARIA 属性はロールに対して適切なもののみ使用する
- `tabindex` に正の値を使用しない
- `autofocus` は **許可**

### 複雑さ（complexity）

- 認知的複雑度は最大 **20**
- `forEach` 禁止 → `for...of` を使う
- 不要な `catch`・`constructor`・`continue`・`label`・`ternary` を禁止
- `arguments` オブジェクト禁止
- `void` 演算子禁止
- オプショナルチェーン・アロー関数を推奨

### 正確性（correctness）

- 未宣言の変数・未使用の変数・未使用の import はエラー
- `const` への再代入禁止
- `switch` 内の変数宣言禁止（ブロックスコープで囲む）
- `isNaN()` を使い `=== NaN` と比較しない
- `parseInt` には基数を渡す

### パフォーマンス

- ループ内でのスプレッド蓄積（`...spread`）禁止
- バレルファイル（`index.ts` で re-export）禁止
- `delete` 演算子禁止（`undefined` を代入する）
- 名前空間 import（`import * as`）禁止
- 正規表現はトップレベルで定義する

### セキュリティ

- `eval()` 禁止
- `dangerouslySetInnerHTML` 禁止
- `target="_blank"` には `rel="noreferrer"` を付ける

### スタイル

- **`enum` 禁止** → ユニオン型や `as const` を使う
- **ネストした三項演算子禁止**
- **非 null アサーション（`!`）禁止**
- `var` 禁止 → `const` / `let`
- 型定義は `type` より **`interface`** を優先
- ファイル名は **kebab-case**（ASCII 必須）
- `import type` / `export type` を適切に使う
- ブロック文（`{}`）を常に使用（省略禁止）
- パラメータへの再代入禁止
- `substr` 禁止 → `substring` / `slice`
- テンプレートリテラルを推奨

### 疑わしいコード（suspicious）

- `alert()` / `debugger` 禁止
- `any` の明示的使用はエラー
- `==` 禁止 → `===` を使う
- `@ts-ignore` 禁止 → `@ts-expect-error` を使う
- 空のブロック文禁止
- ビット演算子禁止
- `console` は **許可**

---

## React 固有ルール

- `children` を props として渡さない
- コンポーネントのネスト定義禁止
- `useEffect` 等の依存配列は網羅する（`useExhaustiveDependencies`）
- Hooks はトップレベルでのみ呼び出す
- 配列の JSX レンダリングには `key` を付ける（`index` を key にしない）
- JSX props の重複禁止
- 関数コンポーネントを使用する

---

## CSS ルール

- 不明なプロパティ・関数・単位・擬似クラス・擬似要素はエラー
- ショートハンドプロパティの上書き禁止
- `@import` の重複禁止
- 詳細度の降順はエラー
- `!important` は **許可**

---

## 自動整理（Assist）

- import の自動ソート
- JSX 属性の自動ソート
- Tailwind CSS クラスの自動ソート（対象: `clsx`, `cva`, `tw`, `twMerge`, `cn`, `twJoin`, `tv`）
- オブジェクトキーのソートは **無効**

---

## ファイル別の例外

| 対象 | 緩和ルール |
|---|---|
| テストファイル（`*.test.*`, `*.spec.*`） | 認知的複雑度・`console`・`any` を許可 |
| スクリプト（`scripts/`, `bin/`, `*.mjs`） | `console`・`process.env` を許可 |
| Storybook（`*.stories.*`） | 未使用 import・変数を許可 |
| 型定義ファイル（`*.d.ts`） | 未使用変数・未宣言変数を許可 |
| ビルド出力（`dist/`, `build/`, `.next/`） | リント・フォーマット無効 |
