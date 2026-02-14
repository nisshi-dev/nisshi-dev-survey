# スナップショットと Ref

AI エージェントのコンテキスト使用量を大幅に削減するコンパクトな要素参照。

**関連**: [commands.md](commands.md) で完全なコマンドリファレンス、[SKILL.md](../SKILL.md) でクイックスタートを参照。

## 目次

- [Ref の仕組み](#how-refs-work)
- [スナップショットコマンド](#the-snapshot-command)
- [Ref の使用](#using-refs)
- [Ref のライフサイクル](#ref-lifecycle)
- [ベストプラクティス](#best-practices)
- [Ref 記法の詳細](#ref-notation-details)
- [トラブルシューティング](#troubleshooting)

## Ref の仕組み

従来のアプローチ:
```
完全な DOM/HTML → AI が解析 → CSS セレクタ → アクション（約 3000〜5000 トークン）
```

agent-browser のアプローチ:
```
コンパクトなスナップショット → @ref が割り当てられる → 直接インタラクション（約 200〜400 トークン）
```

## スナップショットコマンド

```bash
# 基本的なスナップショット（ページ構造を表示）
agent-browser snapshot

# インタラクティブスナップショット（-i フラグ） - 推奨
agent-browser snapshot -i
```

### スナップショットの出力フォーマット

```
Page: Example Site - Home
URL: https://example.com

@e1 [header]
  @e2 [nav]
    @e3 [a] "Home"
    @e4 [a] "Products"
    @e5 [a] "About"
  @e6 [button] "Sign In"

@e7 [main]
  @e8 [h1] "Welcome"
  @e9 [form]
    @e10 [input type="email"] placeholder="Email"
    @e11 [input type="password"] placeholder="Password"
    @e12 [button type="submit"] "Log In"

@e13 [footer]
  @e14 [a] "Privacy Policy"
```

## Ref の使用

Ref を取得したら、直接インタラクションできる:

```bash
# "Sign In" ボタンをクリック
agent-browser click @e6

# メール入力欄に入力
agent-browser fill @e10 "user@example.com"

# パスワードを入力
agent-browser fill @e11 "password123"

# フォームを送信
agent-browser click @e12
```

## Ref のライフサイクル

**重要**: ページが変更されると Ref は無効になります！

```bash
# 初期スナップショットを取得
agent-browser snapshot -i
# @e1 [button] "Next"

# クリックでページが変更される
agent-browser click @e1

# 新しい Ref を取得するために再スナップショットが必須！
agent-browser snapshot -i
# @e1 [h1] "Page 2"  ← 別の要素になっている！
```

## ベストプラクティス

### 1. インタラクション前に必ずスナップショットを取る

```bash
# 正しい方法
agent-browser open https://example.com
agent-browser snapshot -i          # まず Ref を取得
agent-browser click @e1            # Ref を使用

# 間違った方法
agent-browser open https://example.com
agent-browser click @e1            # Ref がまだ存在しない！
```

### 2. ナビゲーション後に再スナップショットする

```bash
agent-browser click @e5            # 新しいページに遷移
agent-browser snapshot -i          # 新しい Ref を取得
agent-browser click @e1            # 新しい Ref を使用
```

### 3. 動的変更後に再スナップショットする

```bash
agent-browser click @e1            # ドロップダウンを開く
agent-browser snapshot -i          # ドロップダウンのアイテムを確認
agent-browser click @e7            # アイテムを選択
```

### 4. 特定の領域をスナップショットする

複雑なページでは、特定のエリアをスナップショットする:

```bash
# フォームだけをスナップショット
agent-browser snapshot @e9
```

## Ref 記法の詳細

```
@e1 [tag type="value"] "text content" placeholder="hint"
│    │   │             │               │
│    │   │             │               └─ 追加属性
│    │   │             └─ 表示テキスト
│    │   └─ 主要属性の表示
│    └─ HTML タグ名
└─ 一意の Ref ID
```

### 一般的なパターン

```
@e1 [button] "Submit"                    # テキスト付きボタン
@e2 [input type="email"]                 # メール入力欄
@e3 [input type="password"]              # パスワード入力欄
@e4 [a href="/page"] "Link Text"         # アンカーリンク
@e5 [select]                             # ドロップダウン
@e6 [textarea] placeholder="Message"     # テキストエリア
@e7 [div class="modal"]                  # コンテナ（関連する場合）
@e8 [img alt="Logo"]                     # 画像
@e9 [checkbox] checked                   # チェック済みチェックボックス
@e10 [radio] selected                    # 選択済みラジオボタン
```

## トラブルシューティング

### "Ref not found" エラー

```bash
# Ref が変更された可能性がある - 再スナップショットする
agent-browser snapshot -i
```

### スナップショットに要素が表示されない

```bash
# スクロールして要素を表示させる
agent-browser scroll --bottom
agent-browser snapshot -i

# または動的コンテンツを待機する
agent-browser wait 1000
agent-browser snapshot -i
```

### 要素が多すぎる

```bash
# 特定のコンテナをスナップショット
agent-browser snapshot @e5

# またはテキストのみの抽出には get text を使用
agent-browser get text @e5
```
