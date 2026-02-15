import {
  array,
  boolean,
  type InferOutput,
  literal,
  minLength,
  object,
  pipe,
  record,
  string,
  union,
  variant,
} from "valibot";

// ── 質問スキーマ ──

export const TextQuestionSchema = object({
  type: literal("text"),
  id: string(),
  label: string(),
});

export const RadioQuestionSchema = object({
  type: literal("radio"),
  id: string(),
  label: string(),
  options: array(string()),
});

export const CheckboxQuestionSchema = object({
  type: literal("checkbox"),
  id: string(),
  label: string(),
  options: array(string()),
});

export const QuestionSchema = variant("type", [
  TextQuestionSchema,
  RadioQuestionSchema,
  CheckboxQuestionSchema,
]);

export const QuestionsSchema = array(QuestionSchema);

// ── 型導出 ──

export type Question = InferOutput<typeof QuestionSchema>;
export type TextQuestion = InferOutput<typeof TextQuestionSchema>;
export type RadioQuestion = InferOutput<typeof RadioQuestionSchema>;
export type CheckboxQuestion = InferOutput<typeof CheckboxQuestionSchema>;

// ── API リクエスト / レスポンス ──

/** POST /api/admin/surveys — アンケート作成リクエスト */
export const CreateSurveySchema = object({
  title: pipe(string(), minLength(1)),
  questions: QuestionsSchema,
});
export type CreateSurveyInput = InferOutput<typeof CreateSurveySchema>;

/** POST /api/survey/:id/submit — 回答送信リクエスト */
export const SubmitAnswersSchema = object({
  answers: record(string(), union([string(), array(string())])),
});
export type SubmitAnswersInput = InferOutput<typeof SubmitAnswersSchema>;

/** GET /api/survey/:id — アンケート取得レスポンス */
export const SurveyResponseSchema = object({
  id: string(),
  title: string(),
  questions: QuestionsSchema,
});
export type SurveyResponse = InferOutput<typeof SurveyResponseSchema>;

/** POST /api/survey/:id/submit — 回答送信成功レスポンス */
export const SubmitSuccessResponseSchema = object({
  success: boolean(),
  surveyId: string(),
});

/** GET /api/admin/surveys — アンケート一覧レスポンス */
export const SurveyListResponseSchema = object({
  surveys: array(
    object({
      id: string(),
      title: string(),
    })
  ),
});

/** GET /api/admin/surveys/:id — アンケート詳細レスポンス */
export const AdminSurveyResponseSchema = object({
  id: string(),
  title: string(),
  questions: QuestionsSchema,
});

/** GET /api/admin/surveys/:id/responses — 回答一覧レスポンス */
export const SurveyResponsesSchema = object({
  surveyId: string(),
  responses: array(
    object({
      id: string(),
      answers: record(string(), union([string(), array(string())])),
    })
  ),
});
