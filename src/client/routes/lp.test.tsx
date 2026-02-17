// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test, vi } from "vitest";
import { LandingPage } from "./lp";

const WORKSHOP_LINK = /nisshi-dev工房/;
const PERSONAL_LINK = /nisshi\.dev/;
const COMING_SOON = /準備中/;
const SURVEY_DESC = /アンケート/;
const PERSONAL_USE = /カスタマイズ・運用中/;
const API_OK = /API.*ok/;
const API_ERROR = /API.*Error/;

describe("LandingPage", () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test("サービス名を表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText("nisshi-dev Survey")).toBeDefined();
  });

  test("準備中であることを表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(COMING_SOON)).toBeDefined();
  });

  test("サービスの説明を表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(SURVEY_DESC)).toBeDefined();
  });

  test("個人利用中であることを表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    expect(screen.getByText(PERSONAL_USE)).toBeDefined();
  });

  test("nisshi-dev工房へのリンクを表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: WORKSHOP_LINK });
    expect(link.getAttribute("href")).toBe("https://workshop.nisshi.dev/");
  });

  test("nisshi.dev へのリンクを表示する", () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    const link = screen.getByRole("link", { name: PERSONAL_LINK });
    expect(link.getAttribute("href")).toBe("https://nisshi.dev");
  });

  test("API ヘルスチェックが成功した場合、ステータスを表示する", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), { status: 200 })
    );

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(API_OK)).toBeDefined();
    });
  });

  test("API ヘルスチェックが失敗した場合、エラーを表示する", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(API_ERROR)).toBeDefined();
    });
  });
});
