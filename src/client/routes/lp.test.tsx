// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, test } from "vitest";
import { LandingPage } from "./lp";

const WORKSHOP_LINK = /nisshi-dev工房/;
const PERSONAL_LINK = /nisshi\.dev/;
const COMING_SOON = /準備中/;
const SURVEY_DESC = /アンケート/;
const PERSONAL_USE = /カスタマイズ・運用中/;

describe("LandingPage", () => {
  afterEach(() => {
    cleanup();
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
});
