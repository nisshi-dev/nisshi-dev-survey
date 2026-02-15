// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { MarkdownRenderer } from "./markdown-renderer";

describe("MarkdownRenderer", () => {
  afterEach(cleanup);

  test("plain text を <p> でレンダリングする", () => {
    render(<MarkdownRenderer content="こんにちは" />);
    expect(screen.getByText("こんにちは").tagName).toBe("P");
  });

  test("**bold** を <strong> でレンダリングする", () => {
    render(<MarkdownRenderer content="これは**太字**です" />);
    expect(screen.getByText("太字").tagName).toBe("STRONG");
  });

  test("null の場合は何も表示しない", () => {
    const { container } = render(<MarkdownRenderer content={null} />);
    expect(container.innerHTML).toBe("");
  });

  test("undefined の場合は何も表示しない", () => {
    const { container } = render(<MarkdownRenderer content={undefined} />);
    expect(container.innerHTML).toBe("");
  });

  test("空文字列の場合は何も表示しない", () => {
    const { container } = render(<MarkdownRenderer content="" />);
    expect(container.innerHTML).toBe("");
  });
});
