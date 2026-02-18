// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";

const signInSocialMock = vi.fn();

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      social: signInSocialMock,
    },
  },
}));

const { LoginPage } = await import("./login");

const GOOGLE_LOGIN_RE = /Google でログイン/;

describe("LoginPage", () => {
  afterEach(() => {
    cleanup();
    signInSocialMock.mockClear();
  });

  test("「Google でログイン」ボタンを表示する", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: GOOGLE_LOGIN_RE })).toBeDefined();
  });

  test("メールアドレス・パスワード入力欄が表示されない", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.queryByLabelText("メールアドレス")).toBeNull();
    expect(screen.queryByLabelText("パスワード")).toBeNull();
  });

  test("ボタンクリックで signIn.social が呼ばれる", async () => {
    signInSocialMock.mockResolvedValue({});

    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: GOOGLE_LOGIN_RE }));

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: `${window.location.origin}/admin`,
    });
  });
});
