#!/bin/bash
# テンプレート: コンテンツキャプチャワークフロー
# 目的: ウェブページからコンテンツを抽出（テキスト、スクリーンショット、PDF）
# 使用方法: ./capture-workflow.sh <url> [output-dir]
#
# 出力:
#   - page-full.png: ページ全体のスクリーンショット
#   - page-structure.txt: Ref 付きのページ要素構造
#   - page-text.txt: 全テキストコンテンツ
#   - page.pdf: PDF 版
#
# オプション: 保護されたページ用に認証状態を読み込み

set -euo pipefail

TARGET_URL="${1:?使用方法: $0 <url> [output-dir]}"
OUTPUT_DIR="${2:-.}"

echo "キャプチャ中: $TARGET_URL"
mkdir -p "$OUTPUT_DIR"

# オプション: 認証状態を読み込み
# if [[ -f "./auth-state.json" ]]; then
#     echo "認証状態を読み込み中..."
#     agent-browser state load "./auth-state.json"
# fi

# ターゲットに遷移
agent-browser open "$TARGET_URL"
agent-browser wait --load networkidle

# メタデータを取得
TITLE=$(agent-browser get title)
URL=$(agent-browser get url)
echo "タイトル: $TITLE"
echo "URL: $URL"

# ページ全体のスクリーンショットをキャプチャ
agent-browser screenshot --full "$OUTPUT_DIR/page-full.png"
echo "保存済み: $OUTPUT_DIR/page-full.png"

# Ref 付きのページ構造を取得
agent-browser snapshot -i > "$OUTPUT_DIR/page-structure.txt"
echo "保存済み: $OUTPUT_DIR/page-structure.txt"

# 全テキストコンテンツを抽出
agent-browser get text body > "$OUTPUT_DIR/page-text.txt"
echo "保存済み: $OUTPUT_DIR/page-text.txt"

# PDF として保存
agent-browser pdf "$OUTPUT_DIR/page.pdf"
echo "保存済み: $OUTPUT_DIR/page.pdf"

# オプション: 構造の Ref を使用して特定の要素を抽出
# agent-browser get text @e5 > "$OUTPUT_DIR/main-content.txt"

# オプション: 無限スクロールページの処理
# for i in {1..5}; do
#     agent-browser scroll down 1000
#     agent-browser wait 1000
# done
# agent-browser screenshot --full "$OUTPUT_DIR/page-scrolled.png"

# クリーンアップ
agent-browser close

echo ""
echo "キャプチャ完了:"
ls -la "$OUTPUT_DIR"
