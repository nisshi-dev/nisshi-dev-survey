// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/survey/survey", () => ({
  useGetSurveyById: vi.fn(),
  usePostSurveyByIdSubmit: vi.fn(),
}));

const { useGetSurveyById, usePostSurveyByIdSubmit } = await import(
  "@/generated/api/survey/survey"
);
const mockUseSurvey = vi.mocked(useGetSurveyById);
const mockUseSubmit = vi.mocked(usePostSurveyByIdSubmit);

const { SurveyPage } = await import("./respond");

const VERSION_V2_PATTERN = /バージョン.*v2/;
const SECRET_PATTERN = /シークレット/;
const HIDDEN_PATTERN = /hidden/;
const EVENT_NAME_PATTERN = /イベント名.*GENkaigi 2026/;
const DATE_PATTERN = /開催日/;

function renderWithRoute(path = "/survey/s1") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route element={<SurveyPage />} path="/survey/:id" />
      </Routes>
    </MemoryRouter>
  );
}

function setupSubmitMock() {
  mockUseSubmit.mockReturnValue({
    trigger: vi.fn(),
    isMutating: false,
  } as never);
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
          dataEntries: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

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
          dataEntries: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

    renderWithRoute("/survey/s1");

    expect(screen.queryByTestId("survey-params")).toBeNull();
  });
});

describe("SurveyPage データエントリ", () => {
  afterEach(() => {
    cleanup();
  });

  const baseSurvey = {
    id: "s1",
    title: "テスト",
    description: null,
    questions: [{ type: "text", id: "q1", label: "お名前" }],
    params: [
      { key: "event", label: "イベント名", visible: true },
      { key: "date", label: "開催日", visible: false },
    ],
  };

  test("?entry={id} でデータエントリの visible パラメータを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          ...baseSurvey,
          dataEntries: [
            {
              id: "e1",
              values: { event: "GENkaigi 2026", date: "2026-03-15" },
              label: "GENkaigi",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

    renderWithRoute("/survey/s1?entry=e1");

    expect(screen.getByText(EVENT_NAME_PATTERN)).toBeDefined();
    expect(screen.queryByText(DATE_PATTERN)).toBeNull();
  });

  test("データエントリ定義済みかつ ?entry なしで専用リンク必要メッセージを表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          ...baseSurvey,
          dataEntries: [
            {
              id: "e1",
              values: { event: "GENkaigi 2026", date: "2026-03-15" },
              label: "GENkaigi",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

    renderWithRoute("/survey/s1");

    expect(screen.getByText("専用リンクが必要です")).toBeDefined();
  });

  test("?entry=invalid で NotFound を表示する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          ...baseSurvey,
          dataEntries: [
            {
              id: "e1",
              values: { event: "GENkaigi 2026", date: "2026-03-15" },
              label: "GENkaigi",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

    renderWithRoute("/survey/s1?entry=invalid");

    expect(screen.getByText("アンケートが見つかりません")).toBeDefined();
  });

  test("データエントリ未定義では ?entry なしで従来通り動作する", () => {
    mockUseSurvey.mockReturnValue({
      data: {
        data: {
          ...baseSurvey,
          dataEntries: [],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);
    setupSubmitMock();

    renderWithRoute("/survey/s1");

    expect(screen.getByLabelText("お名前")).toBeDefined();
    expect(screen.queryByText("専用リンクが必要です")).toBeNull();
  });
});
