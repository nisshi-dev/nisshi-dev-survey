import { Button, Form, Input, Label, Modal, TextField } from "@heroui/react";
import { useState } from "react";
import type { SurveyParam } from "@/shared/schema/survey";

interface DataEntryFormModalProps {
  initialLabel?: string;
  initialValues?: Record<string, string>;
  isOpen: boolean;
  isSubmitting: boolean;
  mode: "create" | "edit";
  onOpenChange: (isOpen: boolean) => void;
  onSubmit: (data: {
    values: Record<string, string>;
    label: string | undefined;
  }) => Promise<void>;
  params: SurveyParam[];
}

export function DataEntryFormModal({
  isOpen,
  onOpenChange,
  params,
  initialValues = {},
  initialLabel = "",
  onSubmit,
  isSubmitting,
  mode,
}: DataEntryFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const p of params) {
      init[p.key] = initialValues[p.key] ?? "";
    }
    return init;
  });
  const [label, setLabel] = useState(initialLabel);

  const title = mode === "create" ? "データエントリ作成" : "データエントリ編集";
  const submitLabel = mode === "create" ? "作成" : "更新";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit({
      values,
      label: label.trim() || undefined,
    });
  }

  return (
    <Modal>
      <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
        <Modal.Container>
          <Modal.Dialog>
            <Modal.Header>
              <Modal.Heading>{title}</Modal.Heading>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
              <Modal.Body className="flex flex-col gap-4">
                {params.map((p) => (
                  <TextField key={p.key}>
                    <Label>{p.label}</Label>
                    <Input
                      onChange={(e) =>
                        setValues((prev) => ({
                          ...prev,
                          [p.key]: e.target.value,
                        }))
                      }
                      placeholder={p.key}
                      value={values[p.key] ?? ""}
                    />
                  </TextField>
                ))}
                <TextField>
                  <Label>ラベル</Label>
                  <Input
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="管理用ラベル..."
                    value={label}
                  />
                </TextField>
              </Modal.Body>
              <Modal.Footer>
                <Button slot="close" variant="secondary">
                  キャンセル
                </Button>
                <Button isPending={isSubmitting} type="submit">
                  {isSubmitting ? "保存中..." : submitLabel}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
