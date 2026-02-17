import {
  Button,
  Card,
  Form,
  Input,
  Label,
  ListBox,
  Select,
  Switch,
  TextArea,
  TextField,
} from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import type { Question, SurveyParam } from "@/shared/schema/survey";
import { SurveyPreview } from "./survey-preview";

export interface QuestionDraft {
  id: string;
  type: "text" | "radio" | "checkbox";
  label: string;
  options: string;
}

export interface ParamDraft {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  keyManuallyEdited: boolean;
}

interface SurveyFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: QuestionDraft[];
  initialParams?: ParamDraft[];
  onSubmit: (data: {
    title: string;
    description: string | undefined;
    questions: Question[];
    params: SurveyParam[];
  }) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  questionsDisabled?: boolean;
}

const questionTypeItems = [
  { id: "text", label: "テキスト" },
  { id: "radio", label: "単一選択" },
  { id: "checkbox", label: "複数選択" },
] as const;

const NON_ASCII_RE = /[^\x20-\x7E]/;

let nextId = 1;
let nextParamId = 1;

function buildQuestions(drafts: QuestionDraft[]): Question[] {
  return drafts.map((q) => {
    if (q.type === "text") {
      return { type: "text", id: q.id, label: q.label };
    }
    const options = q.options
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);
    return { type: q.type, id: q.id, label: q.label, options };
  });
}

function generateKeyFromLabel(label: string): string {
  const trimmed = label.trim();
  if (!trimmed || NON_ASCII_RE.test(trimmed)) {
    return "";
  }
  return trimmed
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "");
}

function buildParams(drafts: ParamDraft[]): SurveyParam[] {
  return drafts
    .filter((p) => p.key.trim() && p.label.trim())
    .map((p) => ({
      key: p.key.trim(),
      label: p.label.trim(),
      visible: p.visible,
    }));
}

export function SurveyForm({
  initialTitle = "",
  initialDescription = "",
  initialQuestions = [],
  initialParams = [],
  onSubmit,
  submitLabel,
  isSubmitting,
  questionsDisabled = false,
}: SurveyFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<QuestionDraft[]>(initialQuestions);
  const [params, setParams] = useState<ParamDraft[]>(initialParams);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: `q${nextId++}`, type: "text", label: "", options: "" },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: keyof QuestionDraft,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addParam = () => {
    setParams((prev) => [
      ...prev,
      {
        id: `p${nextParamId++}`,
        key: "",
        label: "",
        visible: true,
        keyManuallyEdited: false,
      },
    ]);
  };

  const updateParam = (
    index: number,
    field: keyof ParamDraft,
    value: string | boolean
  ) => {
    setParams((prev) =>
      prev.map((p, i) => {
        if (i !== index) {
          return p;
        }
        if (field === "key") {
          return { ...p, key: value as string, keyManuallyEdited: true };
        }
        if (field === "label" && !p.keyManuallyEdited) {
          const autoKey = generateKeyFromLabel(value as string);
          return { ...p, label: value as string, key: autoKey };
        }
        return { ...p, [field]: value };
      })
    );
  };

  const removeParam = (index: number) => {
    setParams((prev) => prev.filter((_, i) => i !== index));
  };

  const previewQuestions = useMemo<Question[]>(
    () =>
      questions.map((q) => {
        if (q.type === "text") {
          return { type: "text", id: q.id, label: q.label || "質問未入力" };
        }
        const options = q.options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean);
        return {
          type: q.type,
          id: q.id,
          label: q.label || "質問未入力",
          options: options.length > 0 ? options : ["選択肢なし"],
        };
      }),
    [questions]
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await onSubmit({
      title,
      description: description || undefined,
      questions: buildQuestions(questions),
      params: buildParams(params),
    });
  };

  return (
    <div className="flex h-full gap-6">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <Form onSubmit={handleSubmit}>
          <Card className="w-full">
            <Card.Content className="flex flex-col gap-6">
              <fieldset className="flex flex-col gap-4">
                <legend className="font-semibold text-base">基本情報</legend>

                <TextField isRequired name="title">
                  <Label>タイトル</Label>
                  <Input
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="アンケートのタイトル..."
                    value={title}
                  />
                </TextField>

                <div className="flex flex-col gap-1">
                  <Label htmlFor="description">説明（Markdown）</Label>
                  <TextArea
                    className="min-h-24 resize-y"
                    id="description"
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="アンケートの説明を Markdown で入力..."
                    value={description}
                  />
                </div>
              </fieldset>

              <fieldset className="flex flex-col gap-4">
                <legend className="font-semibold text-base">質問</legend>

                <AnimatePresence initial={false}>
                  {questions.map((q, i) => (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, height: 0 }}
                      key={q.id}
                      style={{ overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="flex flex-col gap-4" variant="secondary">
                        <Card.Content className="flex flex-col gap-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-muted text-xs">
                              {i + 1}
                            </span>
                          </div>
                          <TextField isRequired>
                            <Label>質問文</Label>
                            <Input
                              disabled={questionsDisabled}
                              onChange={(e) =>
                                updateQuestion(i, "label", e.target.value)
                              }
                              placeholder="質問を入力..."
                              value={q.label}
                            />
                          </TextField>
                          <Select
                            aria-label="タイプ"
                            isDisabled={questionsDisabled}
                            onChange={(value) => {
                              if (value) {
                                updateQuestion(
                                  i,
                                  "type",
                                  value as QuestionDraft["type"]
                                );
                              }
                            }}
                            value={q.type}
                          >
                            <Label>タイプ</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {questionTypeItems.map((item) => (
                                  <ListBox.Item
                                    id={item.id}
                                    key={item.id}
                                    textValue={item.label}
                                  >
                                    {item.label}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                          {q.type !== "text" && (
                            <TextField>
                              <Label>選択肢（カンマ区切り）</Label>
                              <Input
                                disabled={questionsDisabled}
                                onChange={(e) =>
                                  updateQuestion(i, "options", e.target.value)
                                }
                                placeholder="選択肢1, 選択肢2, ..."
                                value={q.options}
                              />
                            </TextField>
                          )}
                        </Card.Content>
                        {!questionsDisabled && (
                          <Card.Footer>
                            <Button
                              onPress={() => removeQuestion(i)}
                              size="sm"
                              variant="danger"
                            >
                              削除
                            </Button>
                          </Card.Footer>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {questions.length === 0 && (
                  <p className="py-4 text-center text-muted text-sm">
                    質問がありません。「質問を追加」ボタンで追加してください。
                  </p>
                )}
              </fieldset>

              <fieldset className="flex flex-col gap-4">
                <legend className="font-semibold text-base">パラメータ</legend>

                <AnimatePresence initial={false}>
                  {params.map((p, i) => (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, height: 0 }}
                      key={p.id}
                      style={{ overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className="flex flex-col gap-4" variant="secondary">
                        <Card.Content className="flex flex-col gap-3">
                          <TextField isRequired>
                            <Label>項目名</Label>
                            <Input
                              onChange={(e) =>
                                updateParam(i, "label", e.target.value)
                              }
                              placeholder="イベント名、バージョンなど..."
                              value={p.label}
                            />
                          </TextField>
                          <TextField isRequired>
                            <Label>ID（半角英数字）</Label>
                            <Input
                              onChange={(e) =>
                                updateParam(i, "key", e.target.value)
                              }
                              placeholder="version, event_name など..."
                              value={p.key}
                            />
                            <p className="text-muted text-xs">
                              URLパラメータに使用される識別子
                            </p>
                          </TextField>
                          <Switch
                            isSelected={p.visible}
                            onChange={(checked) =>
                              updateParam(i, "visible", checked)
                            }
                          >
                            回答者に表示
                          </Switch>
                        </Card.Content>
                        <Card.Footer>
                          <Button
                            onPress={() => removeParam(i)}
                            size="sm"
                            variant="danger"
                          >
                            削除
                          </Button>
                        </Card.Footer>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {params.length === 0 && (
                  <p className="py-4 text-center text-muted text-sm">
                    パラメータがありません。データエントリの項目（イベント名、バージョンなど）を定義できます。
                  </p>
                )}
              </fieldset>
            </Card.Content>
            <Card.Footer className="flex gap-3">
              {!questionsDisabled && (
                <Button onPress={addQuestion} variant="secondary">
                  質問を追加
                </Button>
              )}
              <Button onPress={addParam} variant="secondary">
                パラメータを追加
              </Button>
              <Button isPending={isSubmitting} type="submit">
                {isSubmitting ? "保存中..." : submitLabel}
              </Button>
            </Card.Footer>
          </Card>
        </Form>
      </div>

      <div className="hidden min-w-0 flex-1 overflow-y-auto rounded-xl border border-border lg:block">
        <SurveyPreview
          description={description}
          questions={previewQuestions}
          title={title}
        />
      </div>
    </div>
  );
}
