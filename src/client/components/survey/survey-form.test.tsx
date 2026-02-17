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

  test("複数の radio 質問で選択が独立して保持される", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { success: true, surveyId: "s1" },
      status: 200,
    });
    const questions: Question[] = [
      { type: "radio", id: "q1", label: "好きな色", options: ["赤", "青"] },
      {
        type: "radio",
        id: "q2",
        label: "好きな季節",
        options: ["春", "夏"],
      },
    ];
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
    await user.click(screen.getByLabelText("赤"));
    await user.click(screen.getByLabelText("春"));

    // 2問目を選んでも1問目の選択が保持される
    const red = screen.getByLabelText("赤") as HTMLInputElement;
    const spring = screen.getByLabelText("春") as HTMLInputElement;
    expect(red.checked).toBe(true);
    expect(spring.checked).toBe(true);

    // 送信時に両方の回答が含まれる
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));
    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: { q1: "赤", q2: "春" },
      })
    );
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

  test("params が渡された場合、送信時に trigger に params が含まれる", async () => {
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
        <SurveyForm
          params={{ version: "v2", event_date: "2026-02-15" }}
          questions={questions}
          surveyId="s1"
        />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("ご意見"), "テスト");
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: { version: "v2", event_date: "2026-02-15" },
      })
    );
  });

  test("dataEntryId が渡された場合、trigger に dataEntryId が含まれる", async () => {
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
        <SurveyForm dataEntryId="e1" questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("ご意見"), "テスト");
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        dataEntryId: "e1",
      })
    );
  });

  test("dataEntryId が渡されない場合、trigger に dataEntryId を含めない", async () => {
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
    await user.type(screen.getByLabelText("ご意見"), "テスト");
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    const callArgs = triggerMock.mock.calls[0][0];
    expect(callArgs.dataEntryId).toBeUndefined();
  });

  test("params が空オブジェクトの場合は trigger に params を含めない", async () => {
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
        <SurveyForm params={{}} questions={questions} surveyId="s1" />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("ご意見"), "テスト");
    await user.click(screen.getByRole("button", { name: "回答を送信する" }));

    const callArgs = triggerMock.mock.calls[0][0];
    expect(callArgs.params).toBeUndefined();
  });
});
