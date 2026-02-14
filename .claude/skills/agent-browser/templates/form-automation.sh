#!/bin/bash
# テンプレート: フォーム自動化ワークフロー
# 目的: ウェブフォームの入力と送信をバリデーション付きで実行
# 使用方法: ./form-automation.sh <form-url>
#
# このテンプレートはスナップショット→インタラクション→検証パターンを示します:
# 1. フォームに遷移
# 2. スナップショットで要素の Ref を取得
# 3. Ref を使用してフィールドに入力
# 4. 送信して結果を検証
#
# カスタマイズ: フォームのスナップショット出力に基づいて Ref（@e1, @e2 等）を更新してください

set -euo pipefail

FORM_URL="${1:?使用方法: $0 <form-url>}"

echo "フォーム自動化: $FORM_URL"

# ステップ 1: フォームに遷移
agent-browser open "$FORM_URL"
agent-browser wait --load networkidle

# ステップ 2: スナップショットでフォーム要素を探索
echo ""
echo "フォーム構造:"
agent-browser snapshot -i

# ステップ 3: フォームフィールドに入力（スナップショット出力に基づいて Ref をカスタマイズ）
#
# 一般的なフィールドタイプ:
#   agent-browser fill @e1 "John Doe"           # テキスト入力
#   agent-browser fill @e2 "user@example.com"   # メール入力
#   agent-browser fill @e3 "SecureP@ss123"      # パスワード入力
#   agent-browser select @e4 "Option Value"     # ドロップダウン
#   agent-browser check @e5                     # チェックボックス
#   agent-browser click @e6                     # ラジオボタン
#   agent-browser fill @e7 "Multi-line text"   # テキストエリア
#   agent-browser upload @e8 /path/to/file.pdf # ファイルアップロード
#
# コメント解除して変更:
# agent-browser fill @e1 "Test User"
# agent-browser fill @e2 "test@example.com"
# agent-browser click @e3  # 送信ボタン

# ステップ 4: 送信を待機
# agent-browser wait --load networkidle
# agent-browser wait --url "**/success"  # またはリダイレクトを待機

# ステップ 5: 結果を検証
echo ""
echo "結果:"
agent-browser get url
agent-browser snapshot -i

# オプション: エビデンスをキャプチャ
agent-browser screenshot /tmp/form-result.png
echo "スクリーンショット保存済み: /tmp/form-result.png"

# クリーンアップ
agent-browser close
echo "完了"
