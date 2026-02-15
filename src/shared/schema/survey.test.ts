import { safeParse } from "valibot";
import { describe, expect, test } from "vitest";
import {
  AdminSurveyResponseSchema,
  CreateSurveySchema,
  SurveyResponseSchema,
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

describe("SurveyResponseSchema", () => {
  test("description が null でもバリデーション通過", () => {
    const result = safeParse(SurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      description: null,
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
  });

  test("description なし（undefined）でもバリデーション通過", () => {
    const result = safeParse(SurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("AdminSurveyResponseSchema", () => {
  test("description を含むレスポンスでバリデーション通過", () => {
    const result = safeParse(AdminSurveyResponseSchema, {
      id: "s1",
      title: "テスト",
      description: "管理者向け説明",
      questions: [{ type: "text", id: "q1", label: "質問" }],
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.output.description).toBe("管理者向け説明");
    }
  });
});
