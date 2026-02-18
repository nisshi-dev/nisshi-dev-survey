// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/auth/auth", () => ({
  usePostAdminAuthLogout: vi.fn(),
}));

const { usePostAdminAuthLogout } = await import("@/generated/api/auth/auth");
const mockUseLogout = vi.mocked(usePostAdminAuthLogout);

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
  });

  test("ナビゲーションにダッシュボードリンクを表示する", () => {
    mockUseLogout.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

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

  test("ログアウトボタンをクリックすると trigger が呼ばれ /admin/login に遷移する", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { message: "ok" },
      status: 200,
    });
    mockUseLogout.mockReturnValue({
      trigger: triggerMock,
      isMutating: false,
    } as never);

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

    expect(triggerMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/admin/login");
  });
});
