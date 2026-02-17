// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataEntryTable } from "./data-entry-table";

describe("DataEntryTable", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultParams = [
    { key: "event", label: "イベント名", visible: true },
    { key: "date", label: "開催日", visible: false },
  ];

  const defaultEntries = [
    {
      id: "e1",
      surveyId: "s1",
      values: { event: "GENkaigi 2026", date: "2026-03-15" },
      label: "GENkaigi",
      responseCount: 5,
      createdAt: "2026-02-15T00:00:00.000Z",
    },
    {
      id: "e2",
      surveyId: "s1",
      values: { event: "TechConf", date: "2026-04-01" },
      label: null,
      responseCount: 0,
      createdAt: "2026-02-16T00:00:00.000Z",
    },
  ];

  test("パラメータ定義に基づくカラムヘッダーを表示する", () => {
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const headers = screen.getAllByRole("columnheader");
    const headerTexts = headers.map((h) => h.textContent);
    expect(headerTexts).toContain("イベント名");
    expect(headerTexts).toContain("開催日");
    expect(headerTexts).toContain("ラベル");
    expect(headerTexts).toContain("回答数");
  });

  test("各エントリのデータを行として表示する", () => {
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    expect(screen.getByText("GENkaigi 2026")).toBeDefined();
    expect(screen.getByText("2026-03-15")).toBeDefined();
    expect(screen.getByText("GENkaigi")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();

    expect(screen.getByText("TechConf")).toBeDefined();
    expect(screen.getByText("2026-04-01")).toBeDefined();
    expect(screen.getByText("0")).toBeDefined();
  });

  test("エントリがない場合は空状態メッセージを表示する", () => {
    render(
      <DataEntryTable
        entries={[]}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    expect(screen.getByText("データエントリがありません。")).toBeDefined();
  });

  test("追加ボタンをクリックすると onAdd が呼ばれる", async () => {
    const onAdd = vi.fn();
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={onAdd}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "追加" }));

    expect(onAdd).toHaveBeenCalledOnce();
  });

  test("回答がないエントリの削除ボタンをクリックすると onDelete が呼ばれる", async () => {
    const onDelete = vi.fn();
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={onDelete}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const user = userEvent.setup();
    const rows = screen.getAllByRole("row");
    // rows[0] = header, rows[1] = e1 (5回答), rows[2] = e2 (0回答)
    const deleteButtons = within(rows[2]).getAllByRole("button");
    const deleteButton = deleteButtons.find(
      (b) => b.textContent === "削除" || b.getAttribute("aria-label") === "削除"
    );
    expect(deleteButton).toBeDefined();
    await user.click(deleteButton!);

    expect(onDelete).toHaveBeenCalledWith("e2");
  });

  test("回答があるエントリの削除ボタンは無効化される", () => {
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const rows = screen.getAllByRole("row");
    // rows[1] = e1 (5回答あり)
    const deleteButtons = within(rows[1]).getAllByRole("button");
    const deleteButton = deleteButtons.find(
      (b) => b.textContent === "削除" || b.getAttribute("aria-label") === "削除"
    );
    expect(deleteButton).toBeDefined();
    expect(deleteButton!.hasAttribute("disabled")).toBe(true);
  });

  test("編集ボタンをクリックすると onEdit がエントリ付きで呼ばれる", async () => {
    const onEdit = vi.fn();
    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={onEdit}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const user = userEvent.setup();
    const rows = screen.getAllByRole("row");
    const editButton = within(rows[1]).getByRole("button", { name: "編集" });
    await user.click(editButton);

    expect(onEdit).toHaveBeenCalledWith(defaultEntries[0]);
  });

  test("URLコピーボタンがクリップボードにURLをコピーする", async () => {
    const spy = vi
      .spyOn(navigator.clipboard, "writeText")
      .mockResolvedValue(undefined);

    render(
      <DataEntryTable
        entries={defaultEntries}
        onAdd={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
        params={defaultParams}
        surveyId="s1"
      />
    );

    const user = userEvent.setup();
    const rows = screen.getAllByRole("row");
    const copyButton = within(rows[1]).getByRole("button", {
      name: "URLコピー",
    });
    await user.click(copyButton);

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("/survey/s1?entry=e1")
    );

    spy.mockRestore();
  });
});
