// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/admin-surveys/admin-surveys", () => ({
  useGetApiAdminSurveys: vi.fn(),
}));

const { useGetApiAdminSurveys } = await import(
  "@/generated/api/admin-surveys/admin-surveys"
);
const mockUseSurveys = vi.mocked(useGetApiAdminSurveys);

const { DashboardPage } = await import("./dashboard-page");

describe("DashboardPage", () => {
  afterEach(() => {
    cleanup();
  });

  test("ローディング中は読み込み表示をする", () => {
    mockUseSurveys.mockReturnValue({
      data: undefined,
      isLoading: true,
    } as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText("読み込み中...")).toBeDefined();
  });

  test("アンケート一覧を表示する", () => {
    mockUseSurveys.mockReturnValue({
      data: {
        data: {
          surveys: [
            {
              id: "s1",
              title: "満足度アンケート",
              status: "active",
              createdAt: "2026-02-15T00:00:00.000Z",
            },
            {
              id: "s2",
              title: "フィードバック",
              status: "draft",
              createdAt: "2026-02-14T00:00:00.000Z",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText("満足度アンケート")).toBeDefined();
    expect(screen.getByText("フィードバック")).toBeDefined();
  });

  test("アンケート作成リンクを表示する", () => {
    mockUseSurveys.mockReturnValue({
      data: {
        data: { surveys: [] },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: "新規作成" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/admin/surveys/new");
  });

  test("各アンケートに詳細リンクがある", () => {
    mockUseSurveys.mockReturnValue({
      data: {
        data: {
          surveys: [
            {
              id: "s1",
              title: "テストアンケート",
              status: "draft",
              createdAt: "2026-02-15T00:00:00.000Z",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: "テストアンケート" });
    expect(link.getAttribute("href")).toBe("/admin/surveys/s1");
  });

  test("ステータスチップを表示する", () => {
    mockUseSurveys.mockReturnValue({
      data: {
        data: {
          surveys: [
            {
              id: "s1",
              title: "アンケート1",
              status: "active",
              createdAt: "2026-02-15T00:00:00.000Z",
            },
            {
              id: "s2",
              title: "アンケート2",
              status: "draft",
              createdAt: "2026-02-14T00:00:00.000Z",
            },
            {
              id: "s3",
              title: "アンケート3",
              status: "completed",
              createdAt: "2026-02-13T00:00:00.000Z",
            },
          ],
        },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
    } as never);

    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByText("受付中")).toBeDefined();
    expect(screen.getByText("下書き")).toBeDefined();
    expect(screen.getByText("完了")).toBeDefined();
  });
});
