// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/admin-surveys/admin-surveys", () => ({
  useGetApiAdminSurveysById: vi.fn(),
  useGetApiAdminSurveysByIdResponses: vi.fn(),
}));

const { useGetApiAdminSurveysById, useGetApiAdminSurveysByIdResponses } =
  await import("@/generated/api/admin-surveys/admin-surveys");
const mockUseSurvey = vi.mocked(useGetApiAdminSurveysById);
const mockUseResponses = vi.mocked(useGetApiAdminSurveysByIdResponses);

const { SurveyDetailPage } = await import("./survey-detail-page");

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

  test("ローディング中は読み込み表示をする", () => {
    mockUseSurvey.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);
    mockUseResponses.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    renderWithRoute();

    expect(screen.getByText("読み込み中...")).toBeDefined();
  });

  test("アンケートのタイトルと質問を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "満足度調査",
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

    renderWithRoute();

    expect(screen.getByText("満足度調査")).toBeDefined();
    expect(screen.getByText("お名前（text）")).toBeDefined();
    expect(screen.getByText("評価（radio）")).toBeDefined();
  });

  test("回答一覧を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
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

    renderWithRoute();

    expect(screen.getByText("太郎")).toBeDefined();
    expect(screen.getByText("花子")).toBeDefined();
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

    renderWithRoute();

    expect(screen.getByText("アンケートが見つかりません。")).toBeDefined();
  });
});
