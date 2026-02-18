---
name: nisshi-dev-survey
description: nisshi-dev-survey のデータ投入 API を使ってアンケートを作成・更新し、回答データを投入する。アンケート設計からデータ投入まで一気通貫で支援する。
---

# nisshi-dev-survey データ投入スキル

外部から nisshi-dev-survey のアンケートデータを作成・更新・投入するための API リファレンスとワークフロー。

## ワークフロー

### 全体の流れ

1. **アンケート設計** — `/designing-surveys` スキルを使って効果的なアンケートを設計する
2. **アンケート作成** — `POST /data/surveys` でアンケートを作成
3. **アンケート更新**（任意） — `PUT /data/surveys/:id` で質問・説明文・パラメータを調整
4. **データエントリ作成**（任意） — `POST /data/surveys/:id/data-entries` で配布単位を作成
5. **データエントリ更新**（任意） — `PUT /data/surveys/:id/data-entries/:entryId` で値を修正
6. **回答投入** — `POST /data/surveys/:id/responses` でデータを一括送信
7. **確認** — 管理画面（`/admin/surveys/:id`）で回答を確認

### Step 1: アンケート設計

まず `/designing-surveys` スキルを呼び出してアンケートを設計する。以下を決定する:

- **目的**: 何を測定・収集するか
- **質問設計**: 各質問が1つのことだけを聞くようにする（ダブルバレル質問を避ける）
- **回答タイプの選択**: text / radio / checkbox を適切に使い分ける
- **パラメータ設計**: バージョン別・イベント別・ロール別等の比較分析が必要か

### Step 2〜7: API でデータ投入

設計が固まったら、以下の API リファレンスに従ってデータを投入する。
アンケート作成後も質問の追加・変更・並び替え、パラメータの追加、データエントリの更新が可能。

## 前提条件

- `NISSHI_DEV_SURVEY_API_KEY` が API サーバーに設定されていること
  - ローカル: API リポの `.dev.vars` に設定
  - 本番: `wrangler secret put NISSHI_DEV_SURVEY_API_KEY` で設定
- フロントリポの `.env` にもキーを設定すると、`source .env` で読み込んで利用できる

### API Base URL

| 環境 | URL | 備考 |
|---|---|---|
| ローカル（プロキシ経由） | `http://localhost:5173/api` | フロント + API 両方起動が必要 |
| ローカル（API 直接） | `http://localhost:8787` | API リポで `npm run dev` |
| 本番 | `https://nisshi-dev-survey-api.nisshi.workers.dev` | Cloudflare Workers |

## 認証

すべてのリクエストに `X-API-Key` ヘッダーが必要:

```
X-API-Key: <NISSHI_DEV_SURVEY_API_KEY の値>
```

## データスキーマ

### 質問タイプ（3種）

```jsonc
// テキスト入力
{ "type": "text", "id": "q1", "label": "ご意見をお聞かせください", "required": false }

// 単一選択（ラジオボタン）
{ "type": "radio", "id": "q2", "label": "満足度は？", "options": ["満足", "普通", "不満"], "required": true }

// 複数選択（チェックボックス）
{ "type": "checkbox", "id": "q3", "label": "利用機能", "options": ["機能A", "機能B", "機能C"], "required": false }

// 「その他（自由入力）」付き
{ "type": "radio", "id": "q4", "label": "好きなエディタ", "options": ["VS Code", "Vim"], "allowOther": true }
```

- `required`: 必須かどうか（省略時は `false`）。`true` の場合、回答フォームで未回答だと送信できない
- `allowOther`: 「その他（自由入力）」オプションを追加するか（省略時は `false`）。radio / checkbox でのみ有効。回答者が「その他」を選ぶと自由記述テキストがそのまま回答値として保存される

### パラメータ（params）

アンケートにメタデータキーを定義し、データエントリや回答時に値を付与できる:

```jsonc
// アンケート作成時の params 定義
"params": [
  { "key": "event", "label": "イベント", "visible": true },
  { "key": "role", "label": "役割", "visible": false },
  { "key": "product-version", "label": "プロダクトバージョン", "visible": false }
]
```

- `key`: 英数字・ハイフン・アンダースコアのみ (`/^[a-zA-Z0-9_-]+$/`)
- `label`: 表示名
- `visible`: 回答者に表示するかどうか。`true` のパラメータは回答フォームに表示される。`false` は裏側の分析用メタデータ（ロール、バージョン等）に使う

### データエントリ（SurveyDataEntry）

パラメータ定義に基づく具体的な値のセット。1つのデータエントリ = 1つの配布 URL。
ロール別・イベント別に URL を分けることで、回答者に余計な質問をせずにメタデータを自動付与できる。

```jsonc
// データエントリ作成時
{ "values": { "event": "GENkaigi 2026 in Shibuya", "role": "スタッフ", "product-version": "発泡ウレタン版（v2.3）" }, "label": "GENkaigi 2026 in Shibuya スタッフ" }
```

回答を投入する際に `dataEntryId` を指定すると、そのエントリに紐付けられる。

## API エンドポイント

### 1. アンケート作成

```
POST /data/surveys
```

リクエストボディ:

```json
{
  "title": "開発者体験アンケート 2026Q1",
  "description": "## 目的\n四半期ごとの開発者体験を調査します。",
  "questions": [
    { "type": "radio", "id": "satisfaction", "label": "総合満足度は？", "options": ["とても満足", "満足", "普通", "不満", "とても不満"] },
    { "type": "checkbox", "id": "tools", "label": "よく使うツールは？", "options": ["VS Code", "JetBrains", "Vim/Neovim", "その他"] },
    { "type": "text", "id": "feedback", "label": "自由記述" }
  ],
  "params": [
    { "key": "team", "label": "チーム", "visible": false }
  ],
  "status": "active"
}
```

- `status`: `"draft"`（デフォルト）または `"active"` を指定可能
- `description`: Markdown 形式対応（最大 10,000 文字）

レスポンス (201): `{ id, title, description, status, createdAt, questions, params }`

### 2. アンケート更新

```
PUT /data/surveys/:id
```

リクエストボディ:

```json
{
  "title": "更新後のタイトル",
  "description": "更新後の説明文",
  "questions": [ ... ],
  "params": [ ... ]
}
```

- `title`: 必須
- `description`: 省略可（最大 10,000 文字）
- `questions`: 必須。質問配列を丸ごと差し替え（既存の質問を取得してから変更箇所だけ修正して送信する）
- `params`: 省略可。パラメータ定義を丸ごと差し替え
- `status` は変更されない（ステータス変更は管理画面で行う）

レスポンス (200): `{ id, title, description, status, createdAt, questions, params }`

### 3. アンケート一覧取得

```
GET /data/surveys
```

レスポンス (200): `{ surveys: [{ id, title, status, createdAt }] }`

### 4. アンケート詳細取得

```
GET /data/surveys/:id
```

レスポンス (200): アンケート情報 + `dataEntries` 配列（各エントリの `id`, `surveyId`, `values`, `label`, `responseCount`, `createdAt`）

### 5. データエントリ作成

```
POST /data/surveys/:id/data-entries
```

リクエストボディ:

```json
{
  "values": { "team": "backend" },
  "label": "Backend チーム"
}
```

- `values` のキーはアンケートのパラメータ定義（`params[].key`）と一致する必要がある
- `label` は任意（最大 200 文字）

レスポンス (201): `{ id, surveyId, values, label, responseCount, createdAt }`

### 6. データエントリ更新

```
PUT /data/surveys/:id/data-entries/:entryId
```

リクエストボディ:

```json
{
  "values": { "event": "GENkaigi 2026 in Shibuya", "role": "スタッフ", "product-version": "発泡ウレタン版（v2.3）" },
  "label": "GENkaigi 2026 in Shibuya スタッフ"
}
```

レスポンス (200): `{ id, surveyId, values, label, responseCount, createdAt }`

### 7. データエントリ削除

```
DELETE /data/surveys/:id/data-entries/:entryId
```

- 回答が紐づいているエントリは削除不可（400 エラー）

レスポンス (200): `{ success: true }`

### 8. データエントリ一覧取得

```
GET /data/surveys/:id/data-entries
```

レスポンス (200): `{ dataEntries: [{ id, surveyId, values, label, responseCount, createdAt }] }`

### 9. 回答一括送信

```
POST /data/surveys/:id/responses
```

注意: アンケートが `status: "active"` の場合のみ回答可能。

リクエストボディ:

```json
{
  "responses": [
    {
      "answers": {
        "satisfaction": "満足",
        "tools": ["VS Code", "Vim/Neovim"],
        "feedback": "開発環境が改善されました"
      },
      "dataEntryId": "entry-1"
    },
    {
      "answers": {
        "satisfaction": "普通",
        "tools": ["JetBrains"],
        "feedback": ""
      },
      "params": { "team": "frontend" }
    }
  ]
}
```

- `responses` 配列: 1件以上必須
- `answers`: キーは質問の `id`、値はテキスト回答(string)または複数選択(string[])
- `dataEntryId`: 省略可。データエントリに紐付ける場合に指定
- `params`: 省略可。dataEntryId を使わずに直接パラメータ値を指定する場合

レスポンス (201): `{ count: <投入件数> }`

## curl 例

```bash
# ── Base URL を環境に合わせて設定 ──
# ローカル（プロキシ経由）:
API_BASE="http://localhost:5173/api"
# ローカル（API 直接）:
# API_BASE="http://localhost:8787"
# 本番:
# API_BASE="https://nisshi-dev-survey-api.nisshi.workers.dev"

# 1. アンケート作成
curl -X POST "$API_BASE/data/surveys" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テストアンケート",
    "questions": [{"type": "text", "id": "q1", "label": "感想"}],
    "params": [{"key": "event", "label": "イベント", "visible": true}],
    "status": "active"
  }'

# 2. アンケート更新（質問追加・説明文変更など）
curl -X PUT "$API_BASE/data/surveys/SURVEY_ID" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "テストアンケート",
    "description": "更新後の説明文",
    "questions": [
      {"type": "text", "id": "q1", "label": "感想"},
      {"type": "radio", "id": "q2", "label": "満足度", "options": ["満足", "普通", "不満"], "required": true}
    ],
    "params": [{"key": "event", "label": "イベント", "visible": true}]
  }'

# 3. データエントリ作成
curl -X POST "$API_BASE/data/surveys/SURVEY_ID/data-entries" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"values": {"event": "GENkaigi 2026"}, "label": "GENkaigi 2026"}'

# 4. データエントリ更新（パラメータ値の追加・変更）
curl -X PUT "$API_BASE/data/surveys/SURVEY_ID/data-entries/ENTRY_ID" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"values": {"event": "GENkaigi 2026", "role": "スタッフ"}, "label": "GENkaigi 2026 スタッフ"}'

# 5. データエントリ削除（回答が紐づいていない場合のみ）
curl -X DELETE "$API_BASE/data/surveys/SURVEY_ID/data-entries/ENTRY_ID" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY"

# 6. 回答一括送信（dataEntryId 付き）
curl -X POST "$API_BASE/data/surveys/SURVEY_ID/responses" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "responses": [
      {"answers": {"q1": "とても良かった"}, "dataEntryId": "ENTRY_ID"},
      {"answers": {"q1": "改善の余地あり"}, "dataEntryId": "ENTRY_ID"}
    ]
  }'

# 7. アンケート詳細確認（データエントリ・回答数含む）
curl "$API_BASE/data/surveys/SURVEY_ID" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY"
```

## アンケート更新の運用パターン

アンケート更新時は、必ず最新の状態を GET で取得してから変更箇所だけ修正して PUT する。

```bash
# 1. 最新の状態を取得
curl -s "$API_BASE/data/surveys/SURVEY_ID" -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" > survey.json

# 2. JSON を加工（質問追加・選択肢変更・required 変更など）

# 3. PUT で更新
curl -X PUT "$API_BASE/data/surveys/SURVEY_ID" \
  -H "X-API-Key: $NISSHI_DEV_SURVEY_API_KEY" \
  -H "Content-Type: application/json" \
  -d @survey_update.json
```

よくある更新操作:
- **質問の追加**: 既存の questions 配列の任意の位置に insert
- **選択肢の変更**: 対象質問の options を差し替え
- **必須/任意の切り替え**: 対象質問の `required` を変更
- **allowOther の切り替え**: 対象質問の `allowOther` を変更
- **説明文の更新**: `description` を変更
- **パラメータの追加**: `params` 配列に追加し、データエントリの `values` も合わせて更新

## 質問設計のベストプラクティス

- **質問 ID**: 意味のある短い英語名を使う（`satisfaction`, `tools`, `feedback`）
- **ラジオ**: 相互排他的な選択肢。5〜6個以下が望ましい
- **チェックボックス**: 複数選択が自然な場合に使用。選択肢が近い意味にならないよう注意
- **テキスト**: 自由記述には必ず1つは入れる。必須にしない
- **1質問1テーマ**: ダブルバレル質問（「速度と安定性」を1つの質問で聞く等）を避ける
- **選択肢の数**: モバイルでスクロールせずに見える範囲に収める
- **allowOther の活用**: 想定外の回答を拾いたい質問には `allowOther: true` を設定する
- **必須/任意の使い分け**: 条件付き質問（「不快感を感じた方のみ」等）は任意にする。全員が回答できる質問は必須にする
- **所要時間の目安**: 必須質問の数 × 30秒程度で見積もる

詳しくは `/designing-surveys` スキルを参照。
