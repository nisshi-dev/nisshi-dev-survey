// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { LoginPage } = await import("./login");

const GOOGLE_LOGIN_RE = /Google でログイン/;

describe("LoginPage", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockResolvedValue({
      json: () =>
        Promise.resolve({
          url: "https://accounts.google.com/o/oauth2/auth?...",
          redirect: true,
        }),
    });
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("「Google でログイン」ボタンを表示する", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("button", { name: GOOGLE_LOGIN_RE })).toBeDefined();
  });

  test("ボタンクリックで Google OAuth エンドポイントに fetch される", async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: GOOGLE_LOGIN_RE }));

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/admin/auth/sign-in/social",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: expect.stringContaining(
          `"callbackURL":"${window.location.origin}/admin"`
        ),
      })
    );
  });
});
