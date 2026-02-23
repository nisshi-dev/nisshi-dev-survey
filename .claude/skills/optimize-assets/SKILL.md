---
name: optimize-assets
description: プロジェクトのアセット（画像・動画）を圧縮・最適化する。「画像を圧縮」「動画を WebM に変換」「アセットを最適化」「ファイルサイズを削減」など。
allowed-tools: Bash, Glob, Read
argument-hint: [対象パスまたはall] [--dry-run]
---

# アセット最適化スキル

**目的**: プロジェクト内の画像（PNG/JPG→AVIF）と動画（MP4→WebM/AV1）を最適化し、ファイルサイズを削減する。

## 引数

- `$1`: 対象パス（例: `docs/images`）または `all`（プロジェクト全体）
  - 省略時は `docs/images` をデフォルトとする
- `$2`: `--dry-run` を指定すると実際には変換せずプレビューのみ

**現在の引数**: `$1` `$2`

## 前提条件

- **ffmpeg**（SVT-AV1 エンコーダー対応版）: `brew install ffmpeg`
- **画像変換不要の場合**: ffmpeg のみで OK

## 最適化仕様

### 画像最適化（PNG/JPG → AVIF）

- **出力形式**: AVIF（品質 60）
- **最大幅**: 1920px（超過時はリサイズ）
- **元ファイル**: `.original.png` / `.original.jpg` として保持

```bash
# PNG → AVIF
ffmpeg -i input.png -c:v libaom-av1 -crf 30 -b:v 0 -vf "scale='min(1920,iw)':-2" output.avif

# JPG → AVIF
ffmpeg -i input.jpg -c:v libaom-av1 -crf 30 -b:v 0 -vf "scale='min(1920,iw)':-2" output.avif
```

### 動画最適化（MP4 → WebM/AV1）

- **出力形式**: WebM（AV1 映像 + Opus 音声）
- **最大高さ**: 1080px（超過時はリサイズ）
- **CRF**: 35（画質とサイズのバランス）
- **エンコーダー**: SVT-AV1（`libsvtav1`）
- **音声**: Opus 128k（音声トラックがある場合のみ）
- **元ファイル**: `.original.mp4` として保持

```bash
# 音声なし（スクリーンキャスト等）
ffmpeg -i input.mp4 -c:v libsvtav1 -crf 35 -preset 6 -vf "scale=-2:'min(1080,ih)'" -an output.webm

# 音声あり
ffmpeg -i input.mp4 -c:v libsvtav1 -crf 35 -preset 6 -vf "scale=-2:'min(1080,ih)'" -c:a libopus -b:a 128k output.webm
```

## 実行手順

### 1. 前提条件の確認

```bash
# ffmpeg がインストールされているか
ffmpeg -version 2>/dev/null | head -1

# SVT-AV1 エンコーダーが利用可能か
ffmpeg -encoders 2>/dev/null | grep svtav1
```

ffmpeg がない場合はユーザーに `brew install ffmpeg` を案内して停止する。

### 2. 対象ファイルの検索

**パスが指定された場合** (`$1` が `all` でない場合):
- 指定パス内の PNG/JPG/MP4 を検索

**`all` が指定された場合**:
- プロジェクト全体（`node_modules` を除く）から PNG/JPG/MP4 を検索

```bash
# Glob ツールで対象ファイルを一覧表示
# 例: docs/images/*.{png,jpg,mp4}
```

すでに `.original.*` が存在するファイルはスキップする（変換済み）。

### 3. dry-run モード

`--dry-run` が指定された場合:
- 対象ファイルの一覧とサイズを表示
- 変換は実行しない
- 推定削減率を表示（画像: 約60-80%、動画: 約50-70%）

### 4. 画像の最適化

対象の PNG/JPG ファイルごとに:

1. 元ファイルを `.original.{png,jpg}` にリネーム
2. ffmpeg で AVIF に変換
3. 変換前後のサイズを表示

```bash
mv input.png input.original.png
ffmpeg -i input.original.png -c:v libaom-av1 -crf 30 -b:v 0 -vf "scale='min(1920,iw)':-2" input.avif
```

### 5. 動画の最適化

対象の MP4 ファイルごとに:

1. 音声トラックの有無を確認
2. 元ファイルを `.original.mp4` にリネーム
3. ffmpeg で WebM に変換
4. 変換前後のサイズを表示

```bash
# 音声トラックの確認
ffmpeg -i input.mp4 2>&1 | grep "Audio:"

# 変換
mv input.mp4 input.original.mp4
ffmpeg -i input.original.mp4 -c:v libsvtav1 -crf 35 -preset 6 -vf "scale=-2:'min(1080,ih)'" -an input.webm
```

### 6. 参照の更新

変換後、プロジェクト内で変換前のファイルを参照しているコードを検索し、拡張子を更新する:

- `.png` → `.avif`
- `.jpg` → `.avif`
- `.mp4` → `.webm`

```bash
# Grep ツールで参照箇所を検索
# 例: "admin-dashboard.mp4" → "admin-dashboard.webm"
```

**対象ファイル**:
- `README.md`
- `src/**/*.tsx`
- `docs/**/*.md`
- `index.html`

### 7. 結果サマリーの表示

| ファイル | 変換前 | 変換後 | 削減率 |
|---|---|---|---|
| (ファイル名) | (サイズ) | (サイズ) | (%) |
| **合計** | | | |

## 注意事項

- AV1 エンコードは時間がかかる（動画の長さに依存、数分〜十数分）
- 元ファイルは `.original.*` として保持されるため、問題があれば復元可能
- WebM は Safari 17+ / Chrome / Firefox で再生可能（古い Safari では非対応）
- README の `<video>` タグには `<source>` で MP4 フォールバックを入れることを推奨
- `node_modules/`, `dist/`, `.original.*` は常にスキップする

## 実行開始

引数に基づいて最適化を開始してください。
