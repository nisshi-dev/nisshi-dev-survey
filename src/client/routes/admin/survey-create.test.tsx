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

const { SurveyCreatePage } = await import("./survey-create");

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

  test("説明欄（description）を表示し入力できる", async () => {
    mockUseCreate.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <SurveyCreatePage />
      </MemoryRouter>
    );

    const textarea = screen.getByLabelText("説明（Markdown）");
    expect(textarea).toBeDefined();

    const user = userEvent.setup();
    await user.type(textarea, "# テスト説明");
    expect(textarea).toHaveProperty("value", "# テスト説明");
  });

  test("description を含めて送信する", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: {
        id: "new-1",
        title: "テスト",
        description: "説明テスト",
        questions: [],
      },
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
    await user.type(screen.getByLabelText("タイトル"), "テスト");
    await user.type(screen.getByLabelText("説明（Markdown）"), "説明テスト");
    await user.click(screen.getByRole("button", { name: "質問を追加" }));
    await user.type(screen.getByLabelText("質問文"), "お名前");
    await user.click(screen.getByRole("button", { name: "作成する" }));

    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({ description: "説明テスト" })
    );
  });

  test("パラメータを追加して送信できる", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: {
        id: "new-1",
        title: "テスト",
        questions: [],
        params: [{ key: "version", label: "バージョン", visible: true }],
      },
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
    await user.type(screen.getByLabelText("タイトル"), "テスト");
    await user.click(screen.getByRole("button", { name: "質問を追加" }));
    await user.type(screen.getByLabelText("質問文"), "お名前");

    await user.click(screen.getByRole("button", { name: "パラメータを追加" }));
    await user.type(screen.getByLabelText("ID（半角英数字）"), "version");
    await user.type(screen.getByLabelText("項目名"), "バージョン");

    await user.click(screen.getByRole("button", { name: "作成する" }));

    expect(triggerMock).toHaveBeenCalledWith(
      expect.objectContaining({
        params: expect.arrayContaining([
          expect.objectContaining({
            key: "version",
            label: "バージョン",
          }),
        ]),
      })
    );
  });

  test("項目名を入力すると ASCII の場合 ID が自動生成される", async () => {
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
    await user.click(screen.getByRole("button", { name: "パラメータを追加" }));
    await user.type(screen.getByLabelText("項目名"), "Event Name");

    expect(screen.getByLabelText("ID（半角英数字）")).toHaveProperty(
      "value",
      "event_name"
    );
  });

  test("ID を手動編集した後は自動生成されない", async () => {
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
    await user.click(screen.getByRole("button", { name: "パラメータを追加" }));

    const idInput = screen.getByLabelText("ID（半角英数字）");
    await user.type(idInput, "custom_id");
    await user.clear(idInput);

    await user.type(screen.getByLabelText("項目名"), "Event Name");

    expect(screen.getByLabelText("ID（半角英数字）")).toHaveProperty(
      "value",
      ""
    );
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
