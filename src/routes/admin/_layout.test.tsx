// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

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

const { AdminLayout } = await import("./_layout");

describe("AdminLayout", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    navigateMock.mockClear();
    vi.restoreAllMocks();
  });

  test("ナビゲーションにダッシュボードリンクを表示する", () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminLayout />} path="/admin">
            <Route element={<div>子コンテンツ</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("ダッシュボード")).toBeDefined();
    expect(screen.getByText("子コンテンツ")).toBeDefined();
  });

  test("ログアウトボタンをクリックすると sign-out に POST され /admin/login に遷移する", async () => {
    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route element={<AdminLayout />} path="/admin">
            <Route element={<div>子コンテンツ</div>} index />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const user = userEvent.setup();
    const logoutButtons = screen.getAllByRole("button", {
      name: "ログアウト",
    });
    await user.click(logoutButtons[0] as HTMLElement);

    expect(fetchMock).toHaveBeenCalledWith("/api/admin/auth/sign-out", {
      method: "POST",
      credentials: "include",
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin/login");
  });
});
