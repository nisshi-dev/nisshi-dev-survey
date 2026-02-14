---
name: heroui-react
description: "HeroUI v3 React コンポーネントライブラリ（Tailwind CSS v4 + React Aria）。HeroUI コンポーネントの利用、インストール、テーマカスタマイズ、コンポーネントドキュメント参照時に使用。キーワード: HeroUI, Hero UI, heroui, @heroui/react, @heroui/styles。"
metadata:
  author: heroui
  version: "2.0.0"
---

# HeroUI v3 React 開発ガイド

HeroUI v3 は **Tailwind CSS v4** と **React Aria Components** をベースに構築されたコンポーネントライブラリで、アクセシブルかつカスタマイズ可能な React 向け UI コンポーネントを提供する。

---

## 重要: v3 専用 - v2 の知識は使用しないこと

**このガイドは HeroUI v3 専用。** HeroUI v2 の既存知識は一切使用しないこと。

### v3 での変更点

| 機能             | v2（使用禁止）                     | v3（こちらを使用）                            |
| ---------------- | --------------------------------- | ------------------------------------------- |
| Provider         | `<HeroUIProvider>` が必須          | **Provider 不要**                            |
| アニメーション    | `framer-motion` パッケージ         | CSS ベース、追加依存なし                      |
| コンポーネント API | フラット props: `<Card title="x">` | 複合: `<Card><Card.Header>`                 |
| スタイリング      | Tailwind v3 + `@heroui/theme`     | Tailwind v4 + `@heroui/styles@beta`         |
| パッケージ       | `@heroui/system`, `@heroui/theme` | `@heroui/react@beta`, `@heroui/styles@beta` |

### 誤り（v2 パターン）

```tsx
// これはやらないこと - v2 パターン
import { HeroUIProvider } from "@heroui/react";
import { motion } from "framer-motion";

<HeroUIProvider>
	<Card title="Product" description="A great product" />
</HeroUIProvider>;
```

### 正解（v3 パターン）

```tsx
// こちらを使用 - v3 パターン（Provider 不要、複合コンポーネント）
import { Card } from "@heroui/react@beta";

<Card>
	<Card.Header>
		<Card.Title>Product</Card.Title>
		<Card.Description>A great product</Card.Description>
	</Card.Header>
</Card>;
```

**実装前に必ず v3 ドキュメントを取得すること。** v2 パターンが動作すると仮定しないこと。

---

## 基本原則

- 見た目の記述よりセマンティックバリアント（`primary`, `secondary`, `tertiary`）を優先
- 設定より合成（複合コンポーネント）
- `oklch` 色空間による CSS 変数ベースのテーマシステム
- 予測可能なスタイリングのための BEM 命名規則

---

## ドキュメント・コンポーネント情報へのアクセス

**コンポーネントの詳細、使用例、props、実装パターンについては、必ずドキュメントを取得すること:**

### スクリプトの使用

```bash
# 利用可能な全コンポーネントの一覧
node scripts/list_components.mjs

# コンポーネントドキュメント（MDX）の取得
node scripts/get_component_docs.mjs Button
node scripts/get_component_docs.mjs Button Card TextField

# コンポーネントのソースコード取得
node scripts/get_source.mjs Button

# コンポーネントの CSS スタイル（BEM クラス）取得
node scripts/get_styles.mjs Button

# テーマ変数の取得
node scripts/get_theme.mjs

# コンポーネント以外のドキュメント（ガイド、リリースノート）取得
node scripts/get_docs.mjs /docs/react/getting-started/theming
```

### MDX の直接 URL

コンポーネントドキュメント: `https://v3.heroui.com/docs/react/components/{component-name}.mdx`

例:

- Button: `https://v3.heroui.com/docs/react/components/button.mdx`
- Modal: `https://v3.heroui.com/docs/react/components/modal.mdx`
- Form: `https://v3.heroui.com/docs/react/components/form.mdx`

入門ガイド: `https://v3.heroui.com/docs/react/getting-started/{topic}.mdx`

**重要:** 実装前に必ずコンポーネントドキュメントを取得すること。MDX ドキュメントには完全な使用例、props、構造、API リファレンスが含まれている。

---

## インストール要点

**重要**: HeroUI v3 は現在 BETA 版。パッケージインストール時は必ず `@beta` タグを使用すること。

### クイックインストール

```bash
npm i @heroui/styles@beta @heroui/react@beta tailwind-variants
```

### フレームワークセットアップ（Next.js App Router - 推奨）

1. **依存パッケージのインストール:**

```bash
npm i @heroui/styles@beta @heroui/react@beta tailwind-variants tailwindcss @tailwindcss/postcss postcss
```

2. **`app/globals.css` の作成/更新:**

```css
/* Tailwind CSS v4 - 最初に記述すること */
@import "tailwindcss";

/* HeroUI v3 スタイル - Tailwind の後に記述すること */
@import "@heroui/styles";
```

3. **`app/layout.tsx` でのインポート:**

```tsx
import "./globals.css";

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="ja" suppressHydrationWarning>
			<body>
				{/* HeroUI v3 では Provider 不要！ */}
				{children}
			</body>
		</html>
	);
}
```

4. **PostCSS の設定（`postcss.config.mjs`）:**

```js
export default {
	plugins: {
		"@tailwindcss/postcss": {},
	},
};
```

### セットアップの重要要件

1. **Tailwind CSS v4 は必須** - HeroUI v3 は Tailwind CSS v3 では動作しない
2. **Provider 不要** - HeroUI v2 と異なり、v3 コンポーネントは Provider なしで直接動作する
3. **複合コンポーネントを使用** - コンポーネントは複合構造を使用する（例: `Card.Header`, `Card.Content`）
4. **onClick ではなく onPress を使用** - アクセシビリティ向上のため、`onPress` イベントハンドラを使用する
5. **インポート順序が重要** - 必ず Tailwind CSS を HeroUI スタイルより先にインポートする

---

## コンポーネントパターン

HeroUI v3 は**複合コンポーネントパターン**を採用。各コンポーネントはドット記法でアクセスするサブコンポーネントを持つ。

**例 - Card:**

```tsx
<Card>
	<Card.Header>
		<Card.Title>タイトル</Card.Title>
		<Card.Description>説明文</Card.Description>
	</Card.Header>
	<Card.Content>{/* コンテンツ */}</Card.Content>
	<Card.Footer>{/* アクション */}</Card.Footer>
</Card>
```

**要点:**

- 必ず複合構造を使用する - props にフラット化しないこと
- サブコンポーネントはドット記法でアクセスする（例: `Card.Header`）
- 各サブコンポーネントは独自の props を持つ場合がある
- **完全な構造と使用例についてはコンポーネントドキュメントを取得すること**

---

## セマンティックバリアント

HeroUI は機能的な意図を伝えるためにセマンティックな命名を使用する:

| バリアント   | 目的                              | 使用頻度       |
| ----------- | --------------------------------- | -------------- |
| `primary`   | 前に進むためのメインアクション       | 1 コンテキストに 1 つ |
| `secondary` | 代替アクション                     | 複数可          |
| `tertiary`  | 却下アクション（キャンセル、スキップ） | 控えめに        |
| `danger`    | 破壊的アクション                   | 必要時のみ      |
| `ghost`     | 低強調アクション                   | 最小限の重み     |
| `outline`   | 補助的アクション                   | ボーダースタイル  |

**生のカラー値は使用しないこと** - セマンティックバリアントはテーマやアクセシビリティに適応する。

---

## テーマシステム

HeroUI v3 は `oklch` 色空間の CSS 変数を使用する:

```css
:root {
	--accent: oklch(0.6204 0.195 253.83);
	--accent-foreground: var(--snow);
	--background: oklch(0.9702 0 0);
	--foreground: var(--eclipse);
}
```

**現在のテーマ変数を取得:**

```bash
node scripts/get_theme.mjs
```

**カラー命名規則:**

- サフィックスなし = 背景色（例: `--accent`）
- `-foreground` 付き = テキスト色（例: `--accent-foreground`）

**テーマ切り替え:**

```html
<html class="dark" data-theme="dark"></html>
```

テーマの詳細については: `https://v3.heroui.com/docs/react/getting-started/theming.mdx` を取得すること
