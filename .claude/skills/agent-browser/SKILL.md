---
name: agent-browser
description: AI エージェント向けブラウザ自動化 CLI。ウェブサイトの操作（ページ遷移、フォーム入力、ボタンクリック、スクリーンショット取得、データ抽出、Web アプリテスト、ブラウザタスクの自動化）が必要な場合に使用。「ウェブサイトを開いて」「フォームに入力して」「ボタンをクリック」「スクリーンショットを撮って」「ページからデータを取得」「Web アプリをテスト」「サイトにログイン」「ブラウザ操作を自動化」など。
allowed-tools: Bash(agent-browser:*)
---

# agent-browser によるブラウザ自動化

## 基本ワークフロー

すべてのブラウザ自動化は以下のパターンに従う:

1. **遷移**: `agent-browser open <url>`
2. **スナップショット**: `agent-browser snapshot -i`（`@e1`, `@e2` のような要素参照を取得）
3. **操作**: 参照を使ってクリック、入力、選択
4. **再スナップショット**: ページ遷移や DOM 変更後に新しい参照を取得

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# 出力: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # 結果を確認
```

## 基本コマンド

```bash
# ナビゲーション
agent-browser open <url>              # URL に遷移（別名: goto, navigate）
agent-browser close                   # ブラウザを閉じる

# スナップショット
agent-browser snapshot -i             # インタラクティブ要素と参照（推奨）
agent-browser snapshot -i -C          # カーソル操作可能な要素も含める（onclick 付き div、cursor:pointer）
agent-browser snapshot -s "#selector" # CSS セレクタでスコープ指定

# 操作（snapshot の @refs を使用）
agent-browser click @e1               # 要素をクリック
agent-browser fill @e2 "text"         # クリアしてテキスト入力
agent-browser type @e2 "text"         # クリアせずにテキスト入力
agent-browser select @e1 "option"     # ドロップダウンの選択肢を選択
agent-browser check @e1               # チェックボックスをオン
agent-browser press Enter             # キー押下
agent-browser scroll down 500         # ページスクロール

# 情報取得
agent-browser get text @e1            # 要素のテキストを取得
agent-browser get url                 # 現在の URL を取得
agent-browser get title               # ページタイトルを取得

# 待機
agent-browser wait @e1                # 要素の出現を待機
agent-browser wait --load networkidle # ネットワークアイドルを待機
agent-browser wait --url "**/page"    # URL パターンを待機
agent-browser wait 2000               # ミリ秒待機

# キャプチャ
agent-browser screenshot              # 一時ディレクトリにスクリーンショット
agent-browser screenshot --full       # フルページスクリーンショット
agent-browser pdf output.pdf          # PDF として保存
```

## よくあるパターン

### フォーム送信

```bash
agent-browser open https://example.com/signup
agent-browser snapshot -i
agent-browser fill @e1 "Jane Doe"
agent-browser fill @e2 "jane@example.com"
agent-browser select @e3 "California"
agent-browser check @e4
agent-browser click @e5
agent-browser wait --load networkidle
```

### 認証状態の保存と再利用

```bash
# 一度ログインして状態を保存
agent-browser open https://app.example.com/login
agent-browser snapshot -i
agent-browser fill @e1 "$USERNAME"
agent-browser fill @e2 "$PASSWORD"
agent-browser click @e3
agent-browser wait --url "**/dashboard"
agent-browser state save auth.json

# 以降のセッションで再利用
agent-browser state load auth.json
agent-browser open https://app.example.com/dashboard
```

### セッション永続化

```bash
# ブラウザ再起動時に Cookie と localStorage を自動保存・復元
agent-browser --session-name myapp open https://app.example.com/login
# ... ログインフロー ...
agent-browser close  # 状態が ~/.agent-browser/sessions/ に自動保存

# 次回、状態が自動読み込み
agent-browser --session-name myapp open https://app.example.com/dashboard

# 保存状態の暗号化
export AGENT_BROWSER_ENCRYPTION_KEY=$(openssl rand -hex 32)
agent-browser --session-name secure open https://app.example.com

# 保存状態の管理
agent-browser state list
agent-browser state show myapp-default.json
agent-browser state clear myapp
agent-browser state clean --older-than 7
```

### データ抽出

```bash
agent-browser open https://example.com/products
agent-browser snapshot -i
agent-browser get text @e5           # 特定要素のテキスト取得
agent-browser get text body > page.txt  # 全ページテキスト取得

# パース用 JSON 出力
agent-browser snapshot -i --json
agent-browser get text @e1 --json
```

### 並列セッション

```bash
agent-browser --session site1 open https://site-a.com
agent-browser --session site2 open https://site-b.com

agent-browser --session site1 snapshot -i
agent-browser --session site2 snapshot -i

agent-browser session list
```

### 既存の Chrome に接続

```bash
# リモートデバッグが有効な実行中の Chrome を自動検出
agent-browser --auto-connect open https://example.com
agent-browser --auto-connect snapshot

# または CDP ポートを明示指定
agent-browser --cdp 9222 snapshot
```

### ビジュアルブラウザ（デバッグ用）

```bash
agent-browser --headed open https://example.com
agent-browser highlight @e1          # 要素をハイライト
agent-browser record start demo.webm # セッションを録画
```

### ローカルファイル（PDF、HTML）

```bash
# file:// URL でローカルファイルを開く
agent-browser --allow-file-access open file:///path/to/document.pdf
agent-browser --allow-file-access open file:///path/to/page.html
agent-browser screenshot output.png
```

### iOS シミュレータ（Mobile Safari）

```bash
# 利用可能な iOS シミュレータを一覧
agent-browser device list

# 特定デバイスで Safari を起動
agent-browser -p ios --device "iPhone 16 Pro" open https://example.com

# デスクトップと同じワークフロー - スナップショット、操作、再スナップショット
agent-browser -p ios snapshot -i
agent-browser -p ios tap @e1          # タップ（click の別名）
agent-browser -p ios fill @e2 "text"
agent-browser -p ios swipe up         # モバイル固有のジェスチャー

# スクリーンショット取得
agent-browser -p ios screenshot mobile.png

# セッションを閉じる（シミュレータをシャットダウン）
agent-browser -p ios close
```

**要件:** macOS + Xcode、Appium（`npm install -g appium && appium driver install xcuitest`）

**実機:** 事前設定済みの物理 iOS デバイスでも動作。`--device "<UDID>"` を使用（UDID は `xcrun xctrace list devices` で取得）。

## 参照のライフサイクル（重要）

参照（`@e1`, `@e2` 等）はページ変更時に無効化される。以下の後は必ず再スナップショット:

- リンクやボタンのクリックによるページ遷移
- フォーム送信
- 動的コンテンツの読み込み（ドロップダウン、モーダル）

```bash
agent-browser click @e5              # 新しいページに遷移
agent-browser snapshot -i            # 必ず再スナップショット
agent-browser click @e1              # 新しい参照を使用
```

## セマンティックロケーター（参照の代替手段）

参照が利用不可または不安定な場合、セマンティックロケーターを使用:

```bash
agent-browser find text "Sign In" click
agent-browser find label "Email" fill "user@test.com"
agent-browser find role button click --name "Submit"
agent-browser find placeholder "Search" type "query"
agent-browser find testid "submit-btn" click
```

## JavaScript 実行（eval）

ブラウザコンテキストで JavaScript を実行するには `eval` を使用。**シェルのクォートが複雑な式を壊す可能性がある** ため、`--stdin` または `-b` の使用を推奨。

```bash
# シンプルな式は通常のクォートで OK
agent-browser eval 'document.title'
agent-browser eval 'document.querySelectorAll("img").length'

# 複雑な JS: --stdin + ヒアドキュメントを使用（推奨）
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify(
  Array.from(document.querySelectorAll("img"))
    .filter(i => !i.alt)
    .map(i => ({ src: i.src.split("/").pop(), width: i.width }))
)
EVALEOF

# 代替: base64 エンコード（シェルエスケープの問題を完全に回避）
agent-browser eval -b "$(echo -n 'Array.from(document.querySelectorAll("a")).map(a => a.href)' | base64)"
```

**重要な理由:** シェルがコマンドを処理する際、内部のダブルクォート、`!`（履歴展開）、バッククォート、`$()` が JavaScript を壊す可能性がある。`--stdin` と `-b` フラグはシェル解釈を完全にバイパスする。

**使い分けの目安:**
- 1 行、ネストしたクォートなし → 通常の `eval 'expression'`（シングルクォート）で OK
- ネストしたクォート、アロー関数、テンプレートリテラル、複数行 → `eval --stdin <<'EVALEOF'` を使用
- プログラム生成スクリプト → `eval -b` + base64 を使用

## 詳細ドキュメント

| リファレンス | 用途 |
|-----------|-------------|
| [references/commands.md](references/commands.md) | 全オプション付きコマンドリファレンス |
| [references/snapshot-refs.md](references/snapshot-refs.md) | 参照のライフサイクル、無効化ルール、トラブルシューティング |
| [references/session-management.md](references/session-management.md) | 並列セッション、状態永続化、同時スクレイピング |
| [references/authentication.md](references/authentication.md) | ログインフロー、OAuth、2FA 対応、状態の再利用 |
| [references/video-recording.md](references/video-recording.md) | デバッグ・ドキュメント用の録画ワークフロー |
| [references/proxy-support.md](references/proxy-support.md) | プロキシ設定、地域テスト、プロキシローテーション |

## すぐに使えるテンプレート

| テンプレート | 説明 |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | バリデーション付きフォーム入力 |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | 一度ログイン、状態を再利用 |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | スクリーンショット付きコンテンツ抽出 |

```bash
./templates/form-automation.sh https://example.com/form
./templates/authenticated-session.sh https://app.example.com/login
./templates/capture-workflow.sh https://example.com ./output
```
