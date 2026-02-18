// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { TextResponseList } from "./text-response-list";

describe("TextResponseList", () => {
  afterEach(() => {
    cleanup();
  });

  test("テキスト回答を一覧表示する", () => {
    render(
      <TextResponseList
        question={{ type: "text", id: "q1", label: "ご意見" }}
        responses={[
          { answers: { q1: "とても良い" } },
          { answers: { q1: "改善希望" } },
        ]}
      />
    );

    expect(screen.getByText("ご意見")).toBeDefined();
    expect(screen.getByText("とても良い")).toBeDefined();
    expect(screen.getByText("改善希望")).toBeDefined();
  });

  test("回答 0 件で「回答なし」を表示する", () => {
    render(
      <TextResponseList
        question={{ type: "text", id: "q1", label: "ご意見" }}
        responses={[]}
      />
    );

    expect(screen.getByText("ご意見")).toBeDefined();
    expect(screen.getByText("回答なし")).toBeDefined();
  });

  test("該当質問に回答がない場合は空回答をスキップする", () => {
    render(
      <TextResponseList
        question={{ type: "text", id: "q1", label: "ご意見" }}
        responses={[
          { answers: { q2: "別の質問の回答" } },
          { answers: { q1: "実際の回答" } },
        ]}
      />
    );

    expect(screen.getByText("実際の回答")).toBeDefined();
    expect(screen.queryByText("別の質問の回答")).toBeNull();
  });
});
