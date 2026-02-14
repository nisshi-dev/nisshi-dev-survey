# Hitokoto — プロジェクト概要

## 何をするアプリか

Hitokoto は **Google Forms の軽量版** のようなアンケート収集アプリ。
管理者がアンケートを作成し、固定 URL を共有して回答を集める。

「一言お聞かせください」——名前の通り、手軽にフィードバックを集めることを目的とする。

## 想定ユーザー

| ロール | 説明 |
|---|---|
| 管理者 | アンケートの作成・回答の閲覧を行う。初期は自分1人だが、将来的に複数人管理を想定 |
| 回答者 | 共有された URL からアンケートに回答する。アカウント登録不要。誰でも何度でも回答可能 |

## ユーザーフロー

### 管理者

1. メール + パスワードでログイン
2. ダッシュボードでアンケートを作成
3. 生成された URL（`/survey/:id`）を回答者に共有
4. 集まった回答をダッシュボードで閲覧

### 回答者

1. 共有された URL にアクセス
2. アンケートに回答して送信
3. 完了

## 技術スタック

| レイヤー | 技術 | 役割 |
|---|---|---|
| フロントエンド | React + Vite | SPA。回答画面と管理画面を提供 |
| バックエンド | Hono | REST API サーバー |
| DB | PostgreSQL + Prisma | データ永続化 |
| デプロイ | Vercel | ホスティング + Serverless Functions |

## データモデル

```
Survey 1 ──→ * Response
  アンケート      回答

AdminUser 1 ──→ * Session
  管理者           ログインセッション
```

| モデル | 説明 |
|---|---|
| Survey | アンケート。タイトルと質問定義（JSON）を持つ |
| Response | 回答。どのアンケートに対する回答かを surveyId で紐付け |
| AdminUser | 管理者アカウント。メールアドレスとパスワードハッシュ |
| Session | ログインセッション。有効期限付き |

## 認証方式

| 対象 | 方式 |
|---|---|
| 回答者 | 認証なし。URL を知っていれば誰でも回答可能 |
| 管理者 | メール + パスワード → セッション Cookie |

## URL 設計

### 回答者向け（フロントエンド）

| パス | 画面 |
|---|---|
| `/survey/:id` | アンケート回答ページ |
| `/survey/:id/complete` | 回答完了ページ |

### 管理者向け（フロントエンド）

| パス | 画面 |
|---|---|
| `/admin/login` | ログインページ |
| `/admin` | ダッシュボード |

### API

| メソッド | パス | 説明 |
|---|---|---|
| GET | `/api/health` | ヘルスチェック |
| GET | `/api/survey/:id` | アンケート取得 |
| POST | `/api/survey/:id/submit` | 回答送信 |
| POST | `/api/admin/auth/login` | ログイン |
| POST | `/api/admin/auth/logout` | ログアウト |
| GET | `/api/admin/auth/me` | セッション確認 |
| GET | `/api/admin/surveys` | アンケート一覧 |
| POST | `/api/admin/surveys` | アンケート作成 |
| GET | `/api/admin/surveys/:id` | アンケート詳細 |
| GET | `/api/admin/surveys/:id/responses` | 回答一覧 |
