// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

const signOutMock = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: signOutMock,
  },
}));

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
  afterEach(() => {
    cleanup();
    navigateMock.mockClear();
    signOutMock.mockClear();
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

  test("ログアウトボタンをクリックすると signOut が呼ばれ /admin/login に遷移する", async () => {
    signOutMock.mockResolvedValue({});

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

    expect(signOutMock).toHaveBeenCalledWith({
      fetchOptions: {
        onSuccess: expect.any(Function),
      },
    });
  });
});
