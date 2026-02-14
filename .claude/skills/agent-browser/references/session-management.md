# セッション管理

状態永続化と並行ブラウジングに対応した複数の分離ブラウザセッション。

**関連**: [authentication.md](authentication.md) でログインパターン、[SKILL.md](../SKILL.md) でクイックスタートを参照。

## 目次

- [名前付きセッション](#named-sessions)
- [セッションの分離プロパティ](#session-isolation-properties)
- [セッション状態の永続化](#session-state-persistence)
- [一般的なパターン](#common-patterns)
- [デフォルトセッション](#default-session)
- [セッションのクリーンアップ](#session-cleanup)
- [ベストプラクティス](#best-practices)

## 名前付きセッション

`--session` フラグを使用してブラウザコンテキストを分離する:

```bash
# セッション 1: 認証フロー
agent-browser --session auth open https://app.example.com/login

# セッション 2: パブリックブラウジング（別の Cookie、ストレージ）
agent-browser --session public open https://example.com

# コマンドはセッションごとに分離される
agent-browser --session auth fill @e1 "user@example.com"
agent-browser --session public get text body
```

## セッションの分離プロパティ

各セッションは以下を独立して保持する:
- Cookie
- LocalStorage / SessionStorage
- IndexedDB
- キャッシュ
- ブラウジング履歴
- 開いているタブ

## セッション状態の永続化

### セッション状態の保存

```bash
# Cookie、ストレージ、認証状態を保存
agent-browser state save /path/to/auth-state.json
```

### セッション状態の読み込み

```bash
# 保存済みの状態を復元
agent-browser state load /path/to/auth-state.json

# 認証済みセッションで操作を続行
agent-browser open https://app.example.com/dashboard
```

### 状態ファイルの内容

```json
{
  "cookies": [...],
  "localStorage": {...},
  "sessionStorage": {...},
  "origins": [...]
}
```

## 一般的なパターン

### 認証済みセッションの再利用

```bash
#!/bin/bash
# ログイン状態を一度保存し、何度も再利用

STATE_FILE="/tmp/auth-state.json"

# 保存済み状態があるか確認
if [[ -f "$STATE_FILE" ]]; then
    agent-browser state load "$STATE_FILE"
    agent-browser open https://app.example.com/dashboard
else
    # ログインを実行
    agent-browser open https://app.example.com/login
    agent-browser snapshot -i
    agent-browser fill @e1 "$USERNAME"
    agent-browser fill @e2 "$PASSWORD"
    agent-browser click @e3
    agent-browser wait --load networkidle

    # 今後の利用のために保存
    agent-browser state save "$STATE_FILE"
fi
```

### 並行スクレイピング

```bash
#!/bin/bash
# 複数のサイトを並行してスクレイピング

# 全セッションを開始
agent-browser --session site1 open https://site1.com &
agent-browser --session site2 open https://site2.com &
agent-browser --session site3 open https://site3.com &
wait

# 各セッションからデータを抽出
agent-browser --session site1 get text body > site1.txt
agent-browser --session site2 get text body > site2.txt
agent-browser --session site3 get text body > site3.txt

# クリーンアップ
agent-browser --session site1 close
agent-browser --session site2 close
agent-browser --session site3 close
```

### A/B テストセッション

```bash
# 異なるユーザー体験をテスト
agent-browser --session variant-a open "https://app.com?variant=a"
agent-browser --session variant-b open "https://app.com?variant=b"

# 比較
agent-browser --session variant-a screenshot /tmp/variant-a.png
agent-browser --session variant-b screenshot /tmp/variant-b.png
```

## デフォルトセッション

`--session` を省略すると、コマンドはデフォルトセッションを使用する:

```bash
# これらは同じデフォルトセッションを使用
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser close  # デフォルトセッションを閉じる
```

## セッションのクリーンアップ

```bash
# 特定のセッションを閉じる
agent-browser --session auth close

# アクティブなセッションを一覧表示
agent-browser session list
```

## ベストプラクティス

### 1. セッション名にはわかりやすい名前を付ける

```bash
# 良い例: 目的が明確
agent-browser --session github-auth open https://github.com
agent-browser --session docs-scrape open https://docs.example.com

# 避けるべき例: 汎用的な名前
agent-browser --session s1 open https://github.com
```

### 2. 必ずクリーンアップする

```bash
# 使用後はセッションを閉じる
agent-browser --session auth close
agent-browser --session scrape close
```

### 3. 状態ファイルを安全に扱う

```bash
# 状態ファイルをコミットしない（認証トークンが含まれている！）
echo "*.auth-state.json" >> .gitignore

# 使用後に削除
rm /tmp/auth-state.json
```

### 4. 長時間セッションにはタイムアウトを設定する

```bash
# 自動化スクリプトにタイムアウトを設定
timeout 60 agent-browser --session long-task get text body
```
