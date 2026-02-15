// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("@/generated/api/auth/auth", () => ({
  usePostApiAdminAuthLogin: vi.fn(),
}));

const { usePostApiAdminAuthLogin } = await import("@/generated/api/auth/auth");
const mockUseLogin = vi.mocked(usePostApiAdminAuthLogin);

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

const { LoginPage } = await import("./login-page");

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    navigateMock.mockClear();
  });

  test("メールアドレスとパスワードの入力欄を表示する", () => {
    mockUseLogin.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByLabelText("メールアドレス")).toBeDefined();
    expect(screen.getByLabelText("パスワード")).toBeDefined();
    expect(screen.getByRole("button", { name: "ログイン" })).toBeDefined();
  });

  test("送信時に trigger が呼ばれ、成功したら /admin に遷移する", async () => {
    const triggerMock = vi.fn().mockResolvedValue({
      data: { message: "ok" },
      status: 200,
      headers: new Headers(),
    });
    mockUseLogin.mockReturnValue({
      trigger: triggerMock,
      isMutating: false,
    } as never);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("メールアドレス"), "a@b.com");
    await user.type(screen.getByLabelText("パスワード"), "pass123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(triggerMock).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "pass123",
    });
    expect(navigateMock).toHaveBeenCalledWith("/admin");
  });

  test("エラー時にエラーメッセージを表示する", () => {
    mockUseLogin.mockReturnValue({
      trigger: vi.fn(),
      isMutating: false,
      error: new Error("Login failed"),
    } as never);

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByText("ログインに失敗しました。")).toBeDefined();
  });
});
