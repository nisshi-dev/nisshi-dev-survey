// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
  };
});

vi.mock("@/generated/api/admin-surveys/admin-surveys", () => ({
  useGetApiAdminSurveysById: vi.fn(),
  useGetApiAdminSurveysByIdResponses: vi.fn(),
  usePatchApiAdminSurveysById: vi.fn(),
  useDeleteApiAdminSurveysById: vi.fn(),
}));

const {
  useGetApiAdminSurveysById,
  useGetApiAdminSurveysByIdResponses,
  usePatchApiAdminSurveysById,
  useDeleteApiAdminSurveysById,
} = await import("@/generated/api/admin-surveys/admin-surveys");
const mockUseSurvey = vi.mocked(useGetApiAdminSurveysById);
const mockUseResponses = vi.mocked(useGetApiAdminSurveysByIdResponses);
const mockUsePatch = vi.mocked(usePatchApiAdminSurveysById);
const mockUseDelete = vi.mocked(useDeleteApiAdminSurveysById);

const { SurveyDetailPage } = await import("./survey-detail");

function renderWithRoute() {
  return render(
    <MemoryRouter initialEntries={["/admin/surveys/s1"]}>
      <Routes>
        <Route element={<SurveyDetailPage />} path="/admin/surveys/:id" />
      </Routes>
    </MemoryRouter>
  );
}

describe("SurveyDetailPage", () => {
  afterEach(() => {
    cleanup();
  });

  function setupMocks() {
    mockUsePatch.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);
    mockUseDelete.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);
  }

  test("ローディング中は読み込み表示をする", () => {
    mockUseSurvey.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    mockUseResponses.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("読み込み中...")).toBeDefined();
  });

  test("アンケートのタイトルと質問を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "満足度調査",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [
            { type: "text", id: "q1", label: "お名前" },
            {
              type: "radio",
              id: "q2",
              label: "評価",
              options: ["良い", "普通"],
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: { surveyId: "s1", responses: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("満足度調査")).toBeDefined();
    expect(screen.getAllByText("お名前").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("テキスト")).toBeDefined();
    expect(screen.getAllByText("評価").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("単一選択")).toBeDefined();
    expect(screen.getAllByText("良い").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("普通").length).toBeGreaterThanOrEqual(1);
  });

  test("回答一覧を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "お名前" }],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: {
          surveyId: "s1",
          responses: [
            { id: "r1", answers: { q1: "太郎" } },
            { id: "r2", answers: { q1: "花子" } },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getAllByText("太郎").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("花子").length).toBeGreaterThanOrEqual(1);
  });

  test("404 の場合はエラーメッセージを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: { error: "Not Found" },
        status: 404,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: undefined,
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("アンケートが見つかりません。")).toBeDefined();
  });

  test("ステータスチップを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: { surveyId: "s1", responses: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("受付中")).toBeDefined();
  });

  test("ステータス変更ボタンを表示する（現在のステータス以外）", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "draft",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: { surveyId: "s1", responses: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByRole("button", { name: "受付中にする" })).toBeDefined();
    expect(screen.getByRole("button", { name: "完了にする" })).toBeDefined();
    expect(screen.queryByRole("button", { name: "下書きに戻す" })).toBeNull();
  });

  test("draft/active のアンケートには削除ボタンを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "draft",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: { surveyId: "s1", responses: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByRole("button", { name: "削除" })).toBeDefined();
  });

  test("radio 質問で質問別分析セクションにグラフが表示される", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [
            {
              type: "radio",
              id: "q1",
              label: "評価",
              options: ["良い", "普通", "悪い"],
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: {
          surveyId: "s1",
          responses: [
            { id: "r1", answers: { q1: "良い" } },
            { id: "r2", answers: { q1: "普通" } },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("質問別分析")).toBeDefined();
    expect(screen.getByText("良い: 1件")).toBeDefined();
    expect(screen.getByText("普通: 1件")).toBeDefined();
  });

  test("text 質問で質問別分析セクションにテキスト回答リストが表示される", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "ご意見" }],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: {
          surveyId: "s1",
          responses: [
            { id: "r1", answers: { q1: "良いサービス" } },
            { id: "r2", answers: { q1: "改善希望" } },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.getByText("質問別分析")).toBeDefined();
    expect(screen.getAllByText("良いサービス").length).toBeGreaterThanOrEqual(
      1
    );
    expect(screen.getAllByText("改善希望").length).toBeGreaterThanOrEqual(1);
  });

  test("completed のアンケートには削除ボタンを表示しない", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "completed",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseResponses.mockReturnValue({
      data: {
        data: { surveyId: "s1", responses: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    expect(screen.queryByRole("button", { name: "削除" })).toBeNull();
  });
});
