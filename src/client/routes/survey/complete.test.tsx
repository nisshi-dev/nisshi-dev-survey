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

  test("トップページへのリンクを表示する", () => {
    render(
      <MemoryRouter>
        <CompletePage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: "トップに戻る" });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("/");
  });
});
