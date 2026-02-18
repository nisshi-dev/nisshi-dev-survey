// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";
import { DataEntryFormModal } from "./data-entry-form-modal";

describe("DataEntryFormModal", () => {
  afterEach(() => {
    cleanup();
  });

  const defaultParams = [
    { key: "event", label: "イベント名", visible: true },
    { key: "date", label: "開催日", visible: false },
  ];

  test("作成モードではタイトルが「データエントリ作成」になる", () => {
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={false}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.getByText("データエントリ作成")).toBeDefined();
  });

  test("編集モードではタイトルが「データエントリ編集」になる", () => {
    render(
      <DataEntryFormModal
        initialLabel="GENkaigi"
        initialValues={{ event: "GENkaigi 2026", date: "2026-03-15" }}
        isOpen={true}
        isSubmitting={false}
        mode="edit"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.getByText("データエントリ編集")).toBeDefined();
  });

  test("params 定義の各 key に対応する入力フィールドを表示する", () => {
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={false}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.getByLabelText("イベント名")).toBeDefined();
    expect(screen.getByLabelText("開催日")).toBeDefined();
    expect(screen.getByLabelText("ラベル")).toBeDefined();
  });

  test("編集モードで初期値が入力フィールドに設定される", () => {
    render(
      <DataEntryFormModal
        initialLabel="GENkaigi"
        initialValues={{ event: "GENkaigi 2026", date: "2026-03-15" }}
        isOpen={true}
        isSubmitting={false}
        mode="edit"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(
      (screen.getByLabelText("イベント名") as HTMLInputElement).value
    ).toBe("GENkaigi 2026");
    expect((screen.getByLabelText("開催日") as HTMLInputElement).value).toBe(
      "2026-03-15"
    );
    expect((screen.getByLabelText("ラベル") as HTMLInputElement).value).toBe(
      "GENkaigi"
    );
  });

  test("送信ボタンをクリックすると onSubmit が値付きで呼ばれる", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={false}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        params={defaultParams}
      />
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("イベント名"), "TechConf");
    await user.type(screen.getByLabelText("開催日"), "2026-04-01");
    await user.type(screen.getByLabelText("ラベル"), "テックカンファ");
    await user.click(screen.getByRole("button", { name: "作成" }));

    expect(onSubmit).toHaveBeenCalledWith({
      values: { event: "TechConf", date: "2026-04-01" },
      label: "テックカンファ",
    });
  });

  test("ラベル未入力の場合は label が undefined で送信される", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={false}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
        params={defaultParams}
      />
    );

    const user = userEvent.setup();
    await user.type(screen.getByLabelText("イベント名"), "Test");
    await user.click(screen.getByRole("button", { name: "作成" }));

    expect(onSubmit).toHaveBeenCalledWith({
      values: { event: "Test", date: "" },
      label: undefined,
    });
  });

  test("編集モードでは送信ボタンのラベルが「更新」になる", () => {
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={false}
        mode="edit"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.getByRole("button", { name: "更新" })).toBeDefined();
  });

  test("送信中はボタンが無効化される", () => {
    render(
      <DataEntryFormModal
        isOpen={true}
        isSubmitting={true}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.getByText("保存中...")).toBeDefined();
  });

  test("isOpen が false の場合はモーダルが表示されない", () => {
    render(
      <DataEntryFormModal
        isOpen={false}
        isSubmitting={false}
        mode="create"
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
        params={defaultParams}
      />
    );

    expect(screen.queryByText("データエントリ作成")).toBeNull();
  });
});
