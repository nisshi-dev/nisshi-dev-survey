// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/survey/survey", () => ({
  useGetApiSurveyById: vi.fn(),
  usePostApiSurveyByIdSubmit: vi.fn(),
}));

const { useGetApiSurveyById, usePostApiSurveyByIdSubmit } = await import(
  "@/generated/api/survey/survey"
);
const mockUseSurvey = vi.mocked(useGetApiSurveyById);
const mockUseSubmit = vi.mocked(usePostApiSurveyByIdSubmit);

const { SurveyPage } = await import("./respond");

const VERSION_V2_PATTERN = /バージョン.*v2/;
const SECRET_PATTERN = /シークレット/;
const HIDDEN_PATTERN = /hidden/;

function renderWithRoute(path = "/survey/s1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SurveyPage />} path="/survey/:id" />
      </Routes>
    </MemoryRouter>
  );
}

describe("SurveyPage params", () => {
  afterEach(() => {
    cleanup();
  });

  test("visible=true のパラメータをヘッダー付近に読み取り専用で表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          description: null,
          questions: [{ type: "text", id: "q1", label: "お名前" }],
          params: [
            { key: "version", label: "バージョン", visible: true },
            { key: "secret", label: "シークレット", visible: false },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    renderWithRoute("/survey/s1?version=v2&secret=hidden");

    expect(screen.getByText(VERSION_V2_PATTERN)).toBeDefined();
    expect(screen.queryByText(SECRET_PATTERN)).toBeNull();
    expect(screen.queryByText(HIDDEN_PATTERN)).toBeNull();
  });

  test("パラメータ定義がない場合はパラメータ表示セクションがない", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          id: "s1",
          title: "テスト",
          description: null,
          questions: [{ type: "text", id: "q1", label: "お名前" }],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    mockUseSubmit.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    renderWithRoute("/survey/s1");

    expect(screen.queryByTestId("survey-params")).toBeNull();
  });
});
