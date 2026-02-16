import { safeParse } from "valibot";
import { describe, expect, test } from "vitest";
import {
  AdminSurveyResponseSchema,
  CreateSurveySchema,
  SURVEY_STATUS_LABELS,
  SURVEY_STATUSES,
  SurveyListResponseSchema,
  SurveyResponseSchema,
  SurveyStatusSchema,
  UpdateSurveyStatusSchema,
} from "./survey";

describe("CreateSurveySchema", () => {
  const validQuestions = [{ type: "text" as const, id: "q1", label: "質問" }];

  test("description なしでバリデーション通過", () => {
    const result = safeParse(CreateSurveySchema, {
      title: "テスト",
      questions: validQuestions,
    });
    expect(result.success).toBe(true);
  });

  test("description ありでバリデーション通過", () => {
    const result = safeParse(CreateSurveySchema, {
      title: "テスト",
      description: "## 説明\nこれはテストです",
      questions: validQuestions,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.description).toBe("## 説明\nこれはテストです");
    }
  });

  test("description が 10000 文字を超えると失敗", () => {
    const result = safeParse(CreateSurveySchema, {
      title: "テスト",
      description: "a".repeat(10_001),
      questions: validQuestions,
    });
    expect(result.success).toBe(false);
  });
});

describe("SurveyStatusSchema", () => {
  test("有効なステータスでバリデーション通過", () => {
    for (const status of SURVEY_STATUSES) {
      const result = safeParse(SurveyStatusSchema, status);
      expect(result.success).toBe(true);
    }
  });

  test("無効なステータスでバリデーション失敗", () => {
    const result = safeParse(SurveyStatusSchema, "invalid");
    expect(result.success).toBe(false);
  });

  test("全ステータスに日本語ラベルがある", () => {
    for (const status of SURVEY_STATUSES) {
      expect(SURVEY_STATUS_LABELS[status]).toBeDefined();
    }
  });
});

describe("UpdateSurveyStatusSchema", () => {
  test("有効なステータスでバリデーション通過", () => {
    const result = safeParse(UpdateSurveyStatusSchema, { status: "active" });
    expect(result.success).toBe(true);
  });

  test("無効なステータスでバリデーション失敗", () => {
    const result = safeParse(UpdateSurveyStatusSchema, { status: "invalid" });
    expect(result.success).toBe(false);
  });
});

describe("SurveyResponseSchema", () => {
  test("status を含むレスポンスでバリデーション通過", () => {
    const result = safeParse(SurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      description: null,
      status: "active",
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
  });

  test("description なし（undefined）でもバリデーション通過", () => {
    const result = safeParse(SurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      status: "active",
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("SurveyListResponseSchema", () => {
  test("status と createdAt を含む一覧でバリデーション通過", () => {
    const result = safeParse(SurveyListResponseSchema, {
      surveys: [
        {
          id: "s1",
          title: "テスト",
          status: "draft",
          createdAt: "2026-02-15T00:00:00.000Z",
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});

describe("AdminSurveyResponseSchema", () => {
  test("status と createdAt を含むレスポンスでバリデーション通過", () => {
    const result = safeParse(AdminSurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      description: "管理者向け説明",
      status: "draft",
      createdAt: "2026-02-15T00:00:00.000Z",
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.description).toBe("管理者向け説明");
      expect(result.output.status).toBe("draft");
    }
  });
});
