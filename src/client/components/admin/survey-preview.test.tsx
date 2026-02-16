// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import type { Question } from "@/shared/schema/survey";
import { SurveyPreview } from "./survey-preview";

describe("SurveyPreview", () => {
  afterEach(cleanup);

  test("タイトルと質問数を表示する", () => {
    const questions: Question[] = [
      { type: "text", id: "q1", label: "お名前" },
      { type: "text", id: "q2", label: "ご意見" },
    ];
    render(
      <SurveyPreview description="" questions={questions} title="テスト" />
    );

    expect(screen.getByText("テスト")).toBeDefined();
    expect(screen.getByText("2問のアンケート")).toBeDefined();
  });

  test("description を Markdown レンダリングして表示する", () => {
    render(
      <SurveyPreview
        description="**太字テスト**"
        questions={[]}
        title="テスト"
      />
    );

    expect(screen.getByText("太字テスト").tagName).toBe("STRONG");
  });

  test("質問カードを表示する", () => {
    const questions: Question[] = [
      { type: "text", id: "q1", label: "お名前" },
      { type: "radio", id: "q2", label: "性別", options: ["男性", "女性"] },
    ];
    render(
      <SurveyPreview description="" questions={questions} title="テスト" />
    );

    expect(screen.getByText("お名前")).toBeDefined();
    expect(screen.getByText("性別")).toBeDefined();
    expect(screen.getByText("男性")).toBeDefined();
    expect(screen.getByText("女性")).toBeDefined();
  });

  test("送信ボタン（disabled）を表示する", () => {
    render(<SurveyPreview description="" questions={[]} title="テスト" />);

    const button = screen.getByRole("button", { name: "回答を送信する" });
    expect(button).toBeDefined();
    expect(button.getAttribute("disabled")).not.toBeNull();
  });

  test("タイトルが空の場合はプレースホルダーを表示する", () => {
    render(<SurveyPreview description="" questions={[]} title="" />);

    expect(screen.getByText("タイトル未入力")).toBeDefined();
  });
});
