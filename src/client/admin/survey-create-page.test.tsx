// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/admin-surveys/admin-surveys", () => ({
  usePostApiAdminSurveys: vi.fn(),
}));

const { usePostApiAdminSurveys } = await import(
  "@/generated/api/admin-surveys/admin-surveys"
);
const mockUseCreate = vi.mocked(usePostApiAdminSurveys);

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

const { SurveyCreatePage } = await import("./survey-create-page");

describe("SurveyCreatePage", () => {
  afterEach(() => {
    cleanup();
    navigateMock.mockClear();
  });

  test("タイトル入力欄と質問追加ボタンを表示する", () => {
    mockUseCreate.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyCreatePage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("タイトル")).toBeDefined();
    expect(screen.getByRole("button", { name: "質問を追加" })).toBeDefined();
  });

  test("質問を追加してタイプを選択できる", async () => {
    mockUseCreate.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyCreatePage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "質問を追加" }));

    expect(screen.getByLabelText("質問文")).toBeDefined();
    expect(screen.getByLabelText("タイプ")).toBeDefined();
  });

  test("送信時に trigger が呼ばれ、成功したらダッシュボードに遷移する", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { id: "new-1", title: "テスト", questions: [] },
      status: 201,
      headers: new Headers(),
    });
    mockUseCreate.mockReturnValue({
      trigger: triggerMock,
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyCreatePage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("タイトル"), "新規アンケート");
    await user.click(screen.getByRole("button", { name: "質問を追加" }));
    await user.type(screen.getByLabelText("質問文"), "お名前");
    await user.click(screen.getByRole("button", { name: "作成する" }));

    expect(triggerMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/admin");
  });
});
