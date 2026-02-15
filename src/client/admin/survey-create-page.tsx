import { Button, Card, Form, Input, Label, TextField } from "@heroui/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApiAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";
import type { Question } from "@/shared/schema/survey";

interface QuestionDraft {
  id: string;
  type: "text" | "radio" | "checkbox";
  label: string;
  options: string;
}

let nextId = 1;

export function SurveyCreatePage() {
  const navigate = useNavigate();
  const { trigger, isMutating } = usePostApiAdminSurveys();
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const builtQuestions: Question[] = questions.map((q) => {
      if (q.type === "text") {
        return { type: "text", id: q.id, label: q.label };
      }
      const options = q.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      return { type: q.type, id: q.id, label: q.label, options };
    });
    await trigger({ title, questions: builtQuestions });
    navigate("/admin");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-bold text-2xl">アンケート作成</h1>
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
                        onChange={(e) =>
                          updateQuestion(i, "options", e.target.value)
                        }
                        placeholder="選択肢1, 選択肢2, ..."
                        value={q.options}
                      />
                    </TextField>
                  )}
                </Card.Content>
                <Card.Footer>
                  <Button
                    onPress={() => removeQuestion(i)}
                    size="sm"
                    variant="danger"
                  >
                    削除
                  </Button>
                </Card.Footer>
              </Card>
            ))}
          </Card.Content>
          <Card.Footer className="flex gap-3">
            <Button onPress={addQuestion} variant="secondary">
              質問を追加
            </Button>
            <Button isPending={isMutating} type="submit">
              {isMutating ? "作成中..." : "作成する"}
            </Button>
          </Card.Footer>
        </Card>
      </Form>
    </div>
  );
}
