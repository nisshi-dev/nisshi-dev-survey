// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/admin-surveys/admin-surveys", () => ({
  useGetApiAdminSurveysById: vi.fn(),
  useGetApiAdminSurveysByIdResponses: vi.fn(),
  usePatchApiAdminSurveysById: vi.fn(),
  useDeleteApiAdminSurveysById: vi.fn(),
  usePostApiAdminSurveysByIdDataEntries: vi.fn(),
  usePutApiAdminSurveysByIdDataEntriesByEntryId: vi.fn(),
  useDeleteApiAdminSurveysByIdDataEntriesByEntryId: vi.fn(),
}));

const {
  useGetApiAdminSurveysById,
  useGetApiAdminSurveysByIdResponses,
  usePatchApiAdminSurveysById,
  useDeleteApiAdminSurveysById,
  usePostApiAdminSurveysByIdDataEntries,
  usePutApiAdminSurveysByIdDataEntriesByEntryId,
  useDeleteApiAdminSurveysByIdDataEntriesByEntryId,
} = await import("@/generated/api/admin-surveys/admin-surveys");
const mockUseSurvey = vi.mocked(useGetApiAdminSurveysById);
const mockUseResponses = vi.mocked(useGetApiAdminSurveysByIdResponses);
const mockUsePatch = vi.mocked(usePatchApiAdminSurveysById);
const mockUseDelete = vi.mocked(useDeleteApiAdminSurveysById);
const mockUseCreateEntry = vi.mocked(usePostApiAdminSurveysByIdDataEntries);
const mockUseUpdateEntry = vi.mocked(
  usePutApiAdminSurveysByIdDataEntriesByEntryId
);
const mockUseDeleteEntry = vi.mocked(
  useDeleteApiAdminSurveysByIdDataEntriesByEntryId
);

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
    mockUseCreateEntry.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);
    mockUseUpdateEntry.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);
    mockUseDeleteEntry.mockReturnValue({
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

  test("パラメータ定義がある場合、データ管理セクションにデータエントリテーブルを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "お名前" }],
          params: [
            { key: "version", label: "バージョン", visible: true },
            { key: "event_date", label: "イベント日", visible: false },
          ],
          dataEntries: [
            {
              id: "e1",
              surveyId: "s1",
              values: { version: "v2", event_date: "2026-03-15" },
              label: "テストイベント",
              responseCount: 3,
              createdAt: "2026-02-15T00:00:00.000Z",
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

    expect(screen.getByText("データ管理")).toBeDefined();
    expect(screen.getAllByText("v2").length).toBeGreaterThan(0);
    expect(screen.getAllByText("テストイベント").length).toBeGreaterThan(0);
  });

  test("パラメータ定義がない場合、共有URLセクションを表示する", () => {
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

    expect(screen.getByText("共有 URL")).toBeDefined();
    expect(screen.getByTestId("share-url")).toBeDefined();
  });

  test("パラメータ単位のフィルタを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "感想" }],
          params: [
            { key: "event", label: "イベント", visible: true },
            { key: "version", label: "バージョン", visible: true },
          ],
          dataEntries: [
            {
              id: "e1",
              surveyId: "s1",
              values: { event: "GENkaigi", version: "v1.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-15T00:00:00.000Z",
            },
            {
              id: "e2",
              surveyId: "s1",
              values: { event: "GENkaigi", version: "v2.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-16T00:00:00.000Z",
            },
            {
              id: "e3",
              surveyId: "s1",
              values: { event: "RubyKaigi", version: "v1.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-17T00:00:00.000Z",
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
            {
              id: "r1",
              answers: { q1: "感想1" },
              params: { event: "GENkaigi", version: "v1.0" },
              dataEntryId: "e1",
            },
            {
              id: "r2",
              answers: { q1: "感想2" },
              params: { event: "GENkaigi", version: "v2.0" },
              dataEntryId: "e2",
            },
            {
              id: "r3",
              answers: { q1: "感想3" },
              params: { event: "RubyKaigi", version: "v1.0" },
              dataEntryId: "e3",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    // パラメータごとにフィルタラベルが表示される
    expect(screen.getByText("イベント:")).toBeDefined();
    expect(screen.getByText("バージョン:")).toBeDefined();

    // 各パラメータのユニーク値がボタンとして表示される
    expect(screen.getByRole("button", { name: "GENkaigi" })).toBeDefined();
    expect(screen.getByRole("button", { name: "RubyKaigi" })).toBeDefined();
    expect(screen.getByRole("button", { name: "v1.0" })).toBeDefined();
    expect(screen.getByRole("button", { name: "v2.0" })).toBeDefined();

    // フィルタなしでは全件表示
    expect(screen.getByText("回答一覧（3件）")).toBeDefined();
  });

  test("パラメータフィルタで回答を絞り込める", async () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "感想" }],
          params: [
            { key: "event", label: "イベント", visible: true },
            { key: "version", label: "バージョン", visible: true },
          ],
          dataEntries: [
            {
              id: "e1",
              surveyId: "s1",
              values: { event: "GENkaigi", version: "v1.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-15T00:00:00.000Z",
            },
            {
              id: "e2",
              surveyId: "s1",
              values: { event: "GENkaigi", version: "v2.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-16T00:00:00.000Z",
            },
            {
              id: "e3",
              surveyId: "s1",
              values: { event: "RubyKaigi", version: "v1.0" },
              label: null,
              responseCount: 1,
              createdAt: "2026-02-17T00:00:00.000Z",
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
            {
              id: "r1",
              answers: { q1: "感想1" },
              params: { event: "GENkaigi", version: "v1.0" },
              dataEntryId: "e1",
            },
            {
              id: "r2",
              answers: { q1: "感想2" },
              params: { event: "GENkaigi", version: "v2.0" },
              dataEntryId: "e2",
            },
            {
              id: "r3",
              answers: { q1: "感想3" },
              params: { event: "RubyKaigi", version: "v1.0" },
              dataEntryId: "e3",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    const user = userEvent.setup();

    // イベント=GENkaigi でフィルタ → v1.0 と v2.0 の 2 件が表示される
    await user.click(screen.getByRole("button", { name: "GENkaigi" }));
    expect(screen.getByText("回答一覧（2件）")).toBeDefined();

    // 「すべて」をクリックしてフィルタ解除
    const allButtons = screen.getAllByRole("button", { name: "すべて" });
    const firstAllButton = allButtons[0];
    expect(firstAllButton).toBeDefined();
    // イベントの「すべて」ボタンをクリック（最初のもの）
    await user.click(firstAllButton as HTMLElement);
    expect(screen.getByText("回答一覧（3件）")).toBeDefined();
  });

  test("生データテーブルにパラメータ列を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          status: "active",
          createdAt: "2026-02-15T00:00:00.000Z",
          questions: [{ type: "text", id: "q1", label: "お名前" }],
          params: [{ key: "version", label: "バージョン", visible: true }],
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
            {
              id: "r1",
              answers: { q1: "太郎" },
              params: { version: "v2" },
            },
            {
              id: "r2",
              answers: { q1: "花子" },
              params: { version: "v3" },
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupMocks();

    renderWithRoute();

    const table = screen.getByRole("table");
    expect(table).toBeDefined();
    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent);
    expect(headerTexts).toContain("バージョン");
    expect(screen.getAllByText("v2").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("v3").length).toBeGreaterThanOrEqual(1);
  });
});
