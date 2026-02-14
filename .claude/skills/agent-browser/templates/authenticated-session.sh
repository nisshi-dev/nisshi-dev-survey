#!/bin/bash
# テンプレート: 認証済みセッションワークフロー
# 目的: 一度ログインして状態を保存し、以降の実行で再利用する
# 使用方法: ./authenticated-session.sh <login-url> [state-file]
#
# 環境変数:
#   APP_USERNAME - ログイン用ユーザー名/メールアドレス
#   APP_PASSWORD - ログイン用パスワード
#
# 2 つのモード:
#   1. 探索モード（デフォルト）: Ref を特定できるようにフォーム構造を表示
#   2. ログインモード: Ref を更新した後に実際のログインを実行
#
# セットアップ手順:
#   1. 一度実行してフォーム構造を確認（探索モード）
#   2. 下記のログインフローセクションの Ref を更新
#   3. APP_USERNAME と APP_PASSWORD を設定
#   4. 探索モードセクションを削除

set -euo pipefail

LOGIN_URL="${1:?使用方法: $0 <login-url> [state-file]}"
STATE_FILE="${2:-./auth-state.json}"

echo "認証ワークフロー: $LOGIN_URL"

# ================================================================
# 保存済み状態: 有効な保存済み状態があればログインをスキップ
# ================================================================
if [[ -f "$STATE_FILE" ]]; then
    echo "$STATE_FILE から保存済み状態を読み込み中..."
    if agent-browser --state "$STATE_FILE" open "$LOGIN_URL" 2>/dev/null; then
        agent-browser wait --load networkidle

        CURRENT_URL=$(agent-browser get url)
        if [[ "$CURRENT_URL" != *"login"* ]] && [[ "$CURRENT_URL" != *"signin"* ]]; then
            echo "セッションの復元に成功しました"
            agent-browser snapshot -i
            exit 0
        fi
        echo "セッションが期限切れです。新規ログインを実行中..."
        agent-browser close 2>/dev/null || true
    else
        echo "状態の読み込みに失敗しました。再認証中..."
    fi
    rm -f "$STATE_FILE"
fi

# ================================================================
# 探索モード: フォーム構造を表示（セットアップ後に削除）
# ================================================================
echo "ログインページを開いています..."
agent-browser open "$LOGIN_URL"
agent-browser wait --load networkidle

echo ""
echo "ログインフォーム構造:"
echo "---"
agent-browser snapshot -i
echo "---"
echo ""
echo "次のステップ:"
echo "  1. Ref を確認: ユーザー名=@e?, パスワード=@e?, 送信=@e?"
echo "  2. 下記のログインフローセクションを自分の Ref で更新"
echo "  3. 設定: export APP_USERNAME='...' APP_PASSWORD='...'"
echo "  4. この探索モードセクションを削除"
echo ""
agent-browser close
exit 0

# ================================================================
# ログインフロー: 探索後にコメント解除してカスタマイズ
# ================================================================
# : "${APP_USERNAME:?APP_USERNAME 環境変数を設定してください}"
# : "${APP_PASSWORD:?APP_PASSWORD 環境変数を設定してください}"
#
# agent-browser open "$LOGIN_URL"
# agent-browser wait --load networkidle
# agent-browser snapshot -i
#
# # 認証情報を入力（フォームに合わせて Ref を更新）
# agent-browser fill @e1 "$APP_USERNAME"
# agent-browser fill @e2 "$APP_PASSWORD"
# agent-browser click @e3
# agent-browser wait --load networkidle
#
# # ログイン成功を確認
# FINAL_URL=$(agent-browser get url)
# if [[ "$FINAL_URL" == *"login"* ]] || [[ "$FINAL_URL" == *"signin"* ]]; then
#     echo "ログイン失敗 - まだログインページにいます"
#     agent-browser screenshot /tmp/login-failed.png
#     agent-browser close
#     exit 1
# fi
#
# # 今後の実行のために状態を保存
# echo "状態を $STATE_FILE に保存中"
# agent-browser state save "$STATE_FILE"
# echo "ログイン成功"
# agent-browser snapshot -i
