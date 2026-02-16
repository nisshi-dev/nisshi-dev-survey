import { Button, Card, Form, Input, Label, TextField } from "@heroui/react";
import { useMemo, useState } from "react";
import type { Question } from "@/shared/schema/survey";
import { SurveyPreview } from "./survey-preview";

export interface QuestionDraft {
  id: string;
  type: "text" | "radio" | "checkbox";
  label: string;
  options: string;
}

interface SurveyFormProps {
  initialTitle?: string;
  initialDescription?: string;
  initialQuestions?: QuestionDraft[];
  onSubmit: (data: {
    title: string;
    description: string | undefined;
    questions: Question[];
  }) => Promise<void>;
  submitLabel: string;
  isSubmitting: boolean;
  questionsDisabled?: boolean;
}

let nextId = 1;

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

export function SurveyForm({
  initialTitle = "",
  initialDescription = "",
  initialQuestions = [],
  onSubmit,
  submitLabel,
  isSubmitting,
  questionsDisabled = false,
}: SurveyFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [questions, setQuestions] = useState<QuestionDraft[]>(initialQuestions);

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
    });
  };

  return (
    <div className="flex h-full gap-6">
      <div className="min-w-0 flex-1 overflow-y-auto">
        <Form onSubmit={handleSubmit}>
          <Card className="w-full">
            <Card.Content className="flex flex-col gap-6">
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
                <textarea
                  className="input min-h-24 resize-y"
                  id="description"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="アンケートの説明を Markdown で入力..."
                  value={description}
                />
              </div>

              {questions.map((q, i) => (
                <Card
                  className="flex flex-col gap-4"
                  key={q.id}
                  variant="secondary"
                >
                  <Card.Content className="flex flex-col gap-3">
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
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`type-${q.id}`}>タイプ</Label>
                      <select
                        className="input"
                        disabled={questionsDisabled}
                        id={`type-${q.id}`}
                        onChange={(e) =>
                          updateQuestion(
                            i,
                            "type",
                            e.target.value as QuestionDraft["type"]
                          )
                        }
                        value={q.type}
                      >
                        <option value="text">テキスト</option>
                        <option value="radio">ラジオ</option>
                        <option value="checkbox">チェックボックス</option>
                      </select>
                    </div>
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
              ))}
            </Card.Content>
            <Card.Footer className="flex gap-3">
              {!questionsDisabled && (
                <Button onPress={addQuestion} variant="secondary">
                  質問を追加
                </Button>
              )}
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
