// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import type { Question } from "@/shared/schema/survey";

vi.mock("@/generated/api/survey/survey", () => ({
  usePostApiSurveyByIdSubmit: vi.fn(),
}));

const { usePostApiSurveyByIdSubmit } = await import(
  "@/generated/api/survey/survey"
);
const mockUseSubmit = vi.mocked(usePostApiSurveyByIdSubmit);

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const { SurveyForm } = await import("./survey-form");

describe("SurveyForm", () => {
  afterEach(() => {
    cleanup();
  });

  test("text タイプの質問で input を表示する", () => {
    const questions: Question[] = [{ type: "text", id: "q1", label: "お名前" }];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const input = screen.getByLabelText("お名前");
    expect(input.tagName).toBe("INPUT");
  });

  test("radio タイプの質問で radio ボタンを表示する", () => {
    const questions: Question[] = [
      { type: "radio", id: "q1", label: "好きな色", options: ["赤", "青"] },
    ];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("赤")).toBeDefined();
    expect(screen.getByLabelText("青")).toBeDefined();
  });

  test("checkbox タイプの質問で checkbox を表示する", () => {
    const questions: Question[] = [
      {
        type: "checkbox",
        id: "q1",
        label: "好きな果物",
        options: ["りんご", "みかん"],
      },
    ];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("りんご")).toBeDefined();
    expect(screen.getByLabelText("みかん")).toBeDefined();
  });

  test("送信ボタンをクリックすると trigger が呼ばれる", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { success: true, surveyId: "s1" },
      status: 200,
    });
    const questions: Question[] = [{ type: "text", id: "q1", label: "ご意見" }];
    mockUseSubmit.mockReturnValue({
      trigger: triggerMock,
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("ご意見"), "素晴らしい");
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    expect(triggerMock).toHaveBeenCalled();
  });

  test("回答コピーのチェックボックスが表示される", () => {
    const questions: Question[] = [{ type: "text", id: "q1", label: "ご意見" }];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    expect(
      screen.getByLabelText("回答のコピーをメールで受け取る")
    ).toBeDefined();
  });

  test("チェックボックス OFF のときメール入力欄が非表示", () => {
    const questions: Question[] = [{ type: "text", id: "q1", label: "ご意見" }];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    expect(screen.queryByLabelText("メールアドレス")).toBeNull();
  });

  test("チェックボックス ON のときメール入力欄が表示される", async () => {
    const questions: Question[] = [{ type: "text", id: "q1", label: "ご意見" }];
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByLabelText("回答のコピーをメールで受け取る"));

    expect(screen.getByLabelText("メールアドレス")).toBeDefined();
  });

  test("チェックボックス ON + メール入力で trigger に sendCopy と respondentEmail が含まれる", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { success: true, surveyId: "s1" },
      status: 200,
    });
    const questions: Question[] = [{ type: "text", id: "q1", label: "ご意見" }];
    mockUseSubmit.mockReturnValue({
      trigger: triggerMock,
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyForm questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("ご意見"), "良いです");
    await user.click(screen.getByLabelText("回答のコピーをメールで受け取る"));
    await user.type(
      screen.getByLabelText("メールアドレス"),
      "test@example.com"
    );
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        sendCopy: true,
        respondentEmail: "test@example.com",
      })
    );
  });
});
