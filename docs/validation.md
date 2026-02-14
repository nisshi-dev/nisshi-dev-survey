# バリデーション・型ガード方針

## 方針: 型ガードは手書きしない

TypeScript のユーザー定義型ガード（`v is T`）を手書きすることは **禁止** とする。

### 理由

型述語（`v is T`）は実行時チェックと型の絞り込みが分離しているため、実装ミスをコンパイラが検出できない。
型定義を変更してもガード関数の本体を更新し忘れると、「静的には通るがランタイムで壊れる」状態になる。

> 参考: [TypeScript の型ガードを手書きしないほうがいい理由](https://zenn.dev/yumemi_inc/articles/ts-avoid-hand-writing-type-guards)

### このプロジェクトでの対策

**Valibot のスキーマから型と検証関数の両方を導出する（SSoT: Single Source of Truth）。**

## Valibot

[Valibot](https://valibot.dev/) はツリーシェイク可能な軽量スキーマバリデーションライブラリ。
Zod と同等の機能を持ちながら、バンドルサイズが大幅に小さい。

### 技術スタック上の位置づけ

| 用途 | 説明 |
|---|---|
| API リクエストボディの検証 | Hono ルートで `v.safeParse()` を使用 |
| API レスポンスの型定義 | レスポンス型もスキーマから導出し、クライアントと共有 |
| Json カラムの型安全な読み出し | Prisma の `Json` 型（`questions`, `answers`）をスキーマで検証 |
| フォーム入力の検証 | クライアント側でもスキーマを共有して検証 |
| 型の導出 | `v.InferOutput<typeof Schema>` で型を生成。型定義を別途書かない |

## フロントエンド・バックエンド型共通化

### 原則

**型定義は `src/shared/` に一元管理し、サーバー（`src/server/`）とクライアント（`src/client/`）の両方から import する。**

```
src/
├── shared/              # サーバー・クライアント共通コード
│   └── schema/          # Valibot スキーマ + 導出型
│       ├── question.ts  # 質問スキーマ・型
│       ├── survey.ts    # アンケートスキーマ・型
│       └── auth.ts      # 認証スキーマ・型
├── server/              # スキーマを import して検証に使う
└── client/              # スキーマを import して型・検証に使う
```

### 共有するもの・しないもの

| 共有する（`src/shared/`） | 共有しない |
|---|---|
| Valibot スキーマ定義 | Prisma クライアント・DB 操作 |
| スキーマから導出した型 | サーバー固有のミドルウェア |
| API のリクエスト / レスポンス型 | React コンポーネント・フック |
| エラーコード定数 | 環境変数・設定 |

### スキーマファイルの構成例

```ts
// src/shared/schema/question.ts
import * as v from "valibot";

// --- スキーマ定義（SSoT） ---

export const TextQuestionSchema = v.object({
  type: v.literal("text"),
  id: v.string(),
  label: v.string(),
});

export const RadioQuestionSchema = v.object({
  type: v.literal("radio"),
  id: v.string(),
  label: v.string(),
  options: v.array(v.string()),
});

export const CheckboxQuestionSchema = v.object({
  type: v.literal("checkbox"),
  id: v.string(),
  label: v.string(),
  options: v.array(v.string()),
});

export const QuestionSchema = v.variant("type", [
  TextQuestionSchema,
  RadioQuestionSchema,
  CheckboxQuestionSchema,
]);

export const QuestionsSchema = v.array(QuestionSchema);

// --- 型導出 ---

export type Question = v.InferOutput<typeof QuestionSchema>;
export type TextQuestion = v.InferOutput<typeof TextQuestionSchema>;
export type RadioQuestion = v.InferOutput<typeof RadioQuestionSchema>;
export type CheckboxQuestion = v.InferOutput<typeof CheckboxQuestionSchema>;
```

```ts
// src/shared/schema/survey.ts
import * as v from "valibot";
import { QuestionsSchema } from "./question";

// --- API リクエスト / レスポンス スキーマ ---

// POST /api/admin/surveys — アンケート作成リクエスト
export const CreateSurveySchema = v.object({
  title: v.pipe(v.string(), v.minLength(1)),
  questions: QuestionsSchema,
});
export type CreateSurveyInput = v.InferOutput<typeof CreateSurveySchema>;

// POST /api/survey/:id/submit — 回答送信リクエスト
export const SubmitAnswersSchema = v.object({
  answers: v.record(v.string(), v.union([v.string(), v.array(v.string())])),
});
export type SubmitAnswersInput = v.InferOutput<typeof SubmitAnswersSchema>;

// GET /api/survey/:id — アンケート取得レスポンス
export const SurveyResponseSchema = v.object({
  id: v.string(),
  title: v.string(),
  questions: QuestionsSchema,
});
export type SurveyResponse = v.InferOutput<typeof SurveyResponseSchema>;
```

### サーバーでの使用

```ts
// src/server/routes/survey.ts
import { SubmitAnswersSchema } from "@/shared/schema/survey";

app.post("/:id/submit", async (c) => {
  const body = await c.req.json();
  const result = v.safeParse(SubmitAnswersSchema, body);

  if (!result.success) {
    return c.json({ error: "Invalid request body" }, 400);
  }

  const { answers } = result.output; // SubmitAnswersInput 型
  // ...
});
```

### クライアントでの使用

```ts
// src/client/survey/survey-page.tsx
import type { SurveyResponse } from "@/shared/schema/survey";
import type { Question } from "@/shared/schema/question";

// SWR で取得したデータに型が付く
const { data } = useSWR<SurveyResponse>(`/api/survey/${id}`);

// フォーム送信前のバリデーション
import { SubmitAnswersSchema } from "@/shared/schema/survey";

const result = v.safeParse(SubmitAnswersSchema, formData);
if (!result.success) {
  // エラー表示
}
```

## Prisma Json カラムの検証

Prisma の `Json` 型は TypeScript 上 `JsonValue`（≒ `unknown`）になる。
DB から取得した値はスキーマで検証してから使う。

```ts
import { QuestionsSchema } from "@/shared/schema/question";

const survey = await prisma.survey.findUnique({ where: { id } });
if (!survey) { /* 404 */ }

const result = v.safeParse(QuestionsSchema, survey.questions);
if (!result.success) {
  // データ不整合 → エラーハンドリング
}
const questions = result.output; // Question[] 型
```

## ルール

1. **`v is T` 形式のユーザー定義型ガードを手書きしない** — Valibot スキーマを使う
2. **型は `v.InferOutput` で導出する** — `interface` / `type` を別途定義しない
3. **スキーマは `src/shared/schema/` に配置する** — サーバー・クライアント間で共有する
4. **API のリクエスト / レスポンス型もスキーマから導出する** — フロント・バックエンドで同じ型を使う
5. **`v.safeParse()` を使う** — `v.parse()` は例外を投げるため、API ルートでは `safeParse` を優先
6. **単純な型チェック（`null` 除外等）は TypeScript の型推論に任せる** — スキーマが不要なケースまで使わない
7. **`src/shared/` にはランタイム依存のないコードのみ置く** — Prisma クライアントや React は含めない
