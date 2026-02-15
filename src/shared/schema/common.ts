import { object, pipe, string, uuid } from "valibot";

/**
 * 共通パスパラメータ: UUID 形式の :id
 */
export const IdParamSchema = object({
  id: pipe(string(), uuid()),
});

/**
 * エラーレスポンス
 */
export const ErrorResponseSchema = object({
  error: string(),
});

/**
 * 成功レスポンス（メッセージのみ）
 */
export const MessageResponseSchema = object({
  message: string(),
});
