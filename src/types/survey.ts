// フロントエンド用の型定義・定数
// SSoT は API リポジトリの Valibot スキーマ
// API 側で型が変更された場合はこのファイルも同期すること

/** 「その他」選択時の内部値 */
export const OTHER_VALUE = "__other__";

// ── 質問型 ──

export interface TextQuestion {
  id: string;
  label: string;
  required?: boolean;
  type: "text";
}

export interface RadioQuestion {
  allowOther?: boolean;
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  type: "radio";
}

export interface CheckboxQuestion {
  allowOther?: boolean;
  id: string;
  label: string;
  options: string[];
  required?: boolean;
  type: "checkbox";
}

export type Question = TextQuestion | RadioQuestion | CheckboxQuestion;

// ── パラメータ ──

export interface SurveyParam {
  key: string;
  label: string;
  visible: boolean;
}

// ── ステータス ──

export const SURVEY_STATUSES = ["draft", "active", "completed"] as const;
export type SurveyStatus = (typeof SURVEY_STATUSES)[number];

export const SURVEY_STATUS_LABELS: Record<SurveyStatus, string> = {
  draft: "下書き",
  active: "受付中",
  completed: "完了",
} as const;
