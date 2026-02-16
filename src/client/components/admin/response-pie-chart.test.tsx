// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-container">{children}</div>
    ),
  };
});

const { ResponsePieChart } = await import("./response-pie-chart");

describe("ResponsePieChart", () => {
  afterEach(() => {
    cleanup();
  });

  test("radio 質問で各オプションの集計ラベルを表示する", () => {
    render(
      <ResponsePieChart
        question={{
          type: "radio",
          id: "q1",
          label: "評価",
          options: ["良い", "普通", "悪い"],
        }}
        responses={[
          { answers: { q1: "良い" } },
          { answers: { q1: "良い" } },
          { answers: { q1: "普通" } },
        ]}
      />
    );

    expect(screen.getByText("評価")).toBeDefined();
    expect(screen.getByText("良い: 2件")).toBeDefined();
    expect(screen.getByText("普通: 1件")).toBeDefined();
    expect(screen.getByText("悪い: 0件")).toBeDefined();
  });

  test("checkbox 質問で各オプションの集計ラベルを表示する", () => {
    render(
      <ResponsePieChart
        question={{
          type: "checkbox",
          id: "q2",
          label: "興味のある分野",
          options: ["フロント", "バック", "インフラ"],
        }}
        responses={[
          { answers: { q2: ["フロント", "バック"] } },
          { answers: { q2: ["フロント"] } },
          { answers: { q2: ["インフラ"] } },
        ]}
      />
    );

    expect(screen.getByText("興味のある分野")).toBeDefined();
    expect(screen.getByText("フロント: 2件")).toBeDefined();
    expect(screen.getByText("バック: 1件")).toBeDefined();
    expect(screen.getByText("インフラ: 1件")).toBeDefined();
  });

  test("回答 0 件で「回答なし」を表示する", () => {
    render(
      <ResponsePieChart
        question={{
          type: "radio",
          id: "q1",
          label: "評価",
          options: ["良い", "普通"],
        }}
        responses={[]}
      />
    );

    expect(screen.getByText("評価")).toBeDefined();
    expect(screen.getByText("回答なし")).toBeDefined();
  });
});
