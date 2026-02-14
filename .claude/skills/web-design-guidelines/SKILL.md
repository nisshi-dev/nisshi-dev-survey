---
name: web-design-guidelines
description: UI コードを Web Interface Guidelines に準拠しているかレビューする。「UI をレビューして」「アクセシビリティをチェック」「デザインを監査」「UX を確認」「ベストプラクティスに沿っているか確認」と言われた時に使用。
metadata:
  author: vercel
  version: "1.0.0"
  argument-hint: <ファイルまたはパターン>
---

# Web Interface Guidelines

ファイルを Web Interface Guidelines に準拠しているかレビューする。

## 仕組み

1. 下記のソース URL から最新のガイドラインを取得する
2. 指定されたファイルを読み込む（またはユーザーにファイル/パターンを確認する）
3. 取得したガイドラインの全ルールと照合する
4. 簡潔な `file:line` 形式で結果を出力する

## ガイドラインのソース

レビューごとに最新のガイドラインを取得すること:

```
https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
```

WebFetch を使用して最新のルールを取得する。取得した内容には全ルールと出力形式の指示が含まれている。

## 使い方

ユーザーがファイルまたはパターン引数を指定した場合:
1. 上記のソース URL からガイドラインを取得する
2. 指定されたファイルを読み込む
3. 取得したガイドラインの全ルールを適用する
4. ガイドラインで指定された形式で結果を出力する

ファイルが指定されていない場合は、レビュー対象のファイルをユーザーに確認する。
