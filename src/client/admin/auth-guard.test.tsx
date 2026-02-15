// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/auth/auth", () => ({
  useGetApiAdminAuthMe: vi.fn(),
}));

const { useGetApiAdminAuthMe } = await import("@/generated/api/auth/auth");
const mockUseMe = vi.mocked(useGetApiAdminAuthMe);

const navigateMock = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom"
    );
  return {
    ...actual,
    Navigate: (props: { to: string }) => {
      navigateMock(props.to);
      return <div data-testid="navigate">{props.to}</div>;
    },
  };
});

const { AuthGuard } = await import("./auth-guard");

describe("AuthGuard", () => {
  afterEach(() => {
    cleanup();
    navigateMock.mockClear();
  });

  test("認証済みの場合、子コンポーネントを表示する", () => {
    mockUseMe.mockReturnValue({
      data: {
        data: { id: "user-1", email: "a@b.com" },
        status: 200,
        headers: new Headers(),
      },
      isLoading: false,
      error: undefined,
    } as never);

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>ダッシュボード</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.getByText("ダッシュボード")).toBeDefined();
  });

  test("未認証の場合、/admin/login にリダイレクトする", () => {
    mockUseMe.mockReturnValue({
      data: {
        data: { error: "Unauthorized" },
        status: 401,
        headers: new Headers(),
      },
      isLoading: false,
      error: undefined,
    } as never);

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>ダッシュボード</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(navigateMock).toHaveBeenCalledWith("/admin/login");
  });

  test("ローディング中は読み込み表示をする", () => {
    mockUseMe.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: undefined,
    } as never);

    render(
      <MemoryRouter>
        <AuthGuard>
          <div>ダッシュボード</div>
        </AuthGuard>
      </MemoryRouter>
    );

    expect(screen.queryByText("ダッシュボード")).toBeNull();
    expect(screen.getByText("読み込み中...")).toBeDefined();
  });
});
