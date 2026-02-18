// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";
import { CompletePage } from "./complete";

const WORKSHOP_LINK_NAME = /nisshi-dev工房公式サイト/;
const PERSONAL_LINK_NAME = /nisshi-dev個人サイト/;

function renderWithState(state?: Record<string, unknown>) {
  return render(
    <MemoryRouter
      initialEntries={[{ pathname: "/survey/test/complete", state }]}
    >
      <CompletePage />
    </MemoryRouter>
  );
}

describe("CompletePage", () => {
  afterEach(() => {
    cleanup();
  });

  test("送信済み state がある場合、回答完了メッセージを表示する", () => {
    renderWithState({ submitted: true });

    expect(screen.getByText("回答完了")).toBeDefined();
    expect(screen.getByText("ご回答ありがとうございました。")).toBeDefined();
  });

  test("送信済み state がない場合、回答完了メッセージを表示しない", () => {
    renderWithState();

    expect(screen.queryByText("回答完了")).toBeNull();
  });

  test("nisshi-dev工房公式サイトへのリンクを表示する", () => {
    renderWithState({ submitted: true });

    const link = screen.getByRole("link", {
      name: WORKSHOP_LINK_NAME,
    });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://workshop.nisshi.dev/");
  });

  test("nisshi-dev 個人サイトへのリンクを表示する", () => {
    renderWithState({ submitted: true });

    const link = screen.getByRole("link", { name: PERSONAL_LINK_NAME });
    expect(link).toBeDefined();
    expect(link.getAttribute("href")).toBe("https://nisshi.dev");
  });
});
