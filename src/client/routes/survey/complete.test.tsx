// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";
import { CompletePage } from "./complete";

describe("CompletePage", () => {
  afterEach(() => {
    cleanup();
  });

  test("回答完了メッセージを表示する", () => {
    render(
      <MemoryRouter>
        <CompletePage />
      </MemoryRouter>
    );

    expect(screen.getByText("回答完了")).toBeDefined();
    expect(screen.getByText("ご回答ありがとうございました。")).toBeDefined();
  });

  test("nisshi-dev工房公式サイトへのリンクを表示する", () => {
    render(
      <MemoryRouter>
        <CompletePage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", {
      name: /nisshi-dev工房公式サイト/,
    });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://workshop.nisshi.dev/");
  });

  test("nisshi-dev 個人サイトへのリンクを表示する", () => {
    render(
      <MemoryRouter>
        <CompletePage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: /nisshi-dev個人サイト/ });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://nisshi.dev");
  });
});
