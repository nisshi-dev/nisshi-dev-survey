# 動画録画

デバッグ、ドキュメント作成、検証のためにブラウザ自動化を動画としてキャプチャします。

**関連**: [commands.md](commands.md) で完全なコマンドリファレンス、[SKILL.md](../SKILL.md) でクイックスタートを参照。

## 目次

- [基本的な録画](#basic-recording)
- [録画コマンド](#recording-commands)
- [ユースケース](#use-cases)
- [ベストプラクティス](#best-practices)
- [出力フォーマット](#output-format)
- [制限事項](#limitations)

## 基本的な録画

```bash
# 録画を開始
agent-browser record start ./demo.webm

# アクションを実行
agent-browser open https://example.com
agent-browser snapshot -i
agent-browser click @e1
agent-browser fill @e2 "test input"

# 停止して保存
agent-browser record stop
```

## 録画コマンド

```bash
# ファイルに録画を開始
agent-browser record start ./output.webm

# 現在の録画を停止
agent-browser record stop

# 新しいファイルで再開始（現在の録画を停止して新規開始）
agent-browser record restart ./take2.webm
```

## ユースケース

### 失敗した自動化のデバッグ

```bash
#!/bin/bash
# デバッグ用に自動化を録画

agent-browser record start ./debug-$(date +%Y%m%d-%H%M%S).webm

# 自動化を実行
agent-browser open https://app.example.com
agent-browser snapshot -i
agent-browser click @e1 || {
    echo "クリック失敗 - 録画を確認してください"
    agent-browser record stop
    exit 1
}

agent-browser record stop
```

### ドキュメント生成

```bash
#!/bin/bash
# ドキュメント用にワークフローを録画

agent-browser record start ./docs/how-to-login.webm

agent-browser open https://app.example.com/login
agent-browser wait 1000  # 見やすいように一時停止

agent-browser snapshot -i
agent-browser fill @e1 "demo@example.com"
agent-browser wait 500

agent-browser fill @e2 "password"
agent-browser wait 500

agent-browser click @e3
agent-browser wait --load networkidle
agent-browser wait 1000  # 結果を表示

agent-browser record stop
```

### CI/CD テストエビデンス

```bash
#!/bin/bash
# CI アーティファクト用に E2E テストの実行を録画

TEST_NAME="${1:-e2e-test}"
RECORDING_DIR="./test-recordings"
mkdir -p "$RECORDING_DIR"

agent-browser record start "$RECORDING_DIR/$TEST_NAME-$(date +%s).webm"

# テストを実行
if run_e2e_test; then
    echo "テスト成功"
else
    echo "テスト失敗 - 録画を保存しました"
fi

agent-browser record stop
```

## ベストプラクティス

### 1. 見やすくするために一時停止を追加する

```bash
# 人が見やすいようにゆっくりにする
agent-browser click @e1
agent-browser wait 500  # 閲覧者が結果を確認できるように
```

### 2. わかりやすいファイル名を使用する

```bash
# ファイル名にコンテキストを含める
agent-browser record start ./recordings/login-flow-2024-01-15.webm
agent-browser record start ./recordings/checkout-test-run-42.webm
```

### 3. エラー時の録画を適切に処理する

```bash
#!/bin/bash
set -e

cleanup() {
    agent-browser record stop 2>/dev/null || true
    agent-browser close 2>/dev/null || true
}
trap cleanup EXIT

agent-browser record start ./automation.webm
# ... 自動化のステップ ...
```

### 4. スクリーンショットと組み合わせる

```bash
# 動画を録画しつつキーフレームもキャプチャ
agent-browser record start ./flow.webm

agent-browser open https://example.com
agent-browser screenshot ./screenshots/step1-homepage.png

agent-browser click @e1
agent-browser screenshot ./screenshots/step2-after-click.png

agent-browser record stop
```

## 出力フォーマット

- デフォルトフォーマット: WebM（VP8/VP9 コーデック）
- すべてのモダンブラウザと動画プレーヤーに対応
- 圧縮されているが高品質

## 制限事項

- 録画は自動化にわずかなオーバーヘッドを追加する
- 大きな録画はディスク容量を大幅に消費する可能性がある
- 一部のヘッドレス環境ではコーデックに制限がある場合がある
