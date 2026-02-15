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
    <div>
      <h1>アンケート作成</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">タイトル</label>
          <input
            id="title"
            onChange={(e) => setTitle(e.target.value)}
            required
            type="text"
            value={title}
          />
        </div>

        {questions.map((q, i) => (
          <fieldset key={q.id}>
            <div>
              <label htmlFor={`label-${q.id}`}>質問文</label>
              <input
                id={`label-${q.id}`}
                onChange={(e) => updateQuestion(i, "label", e.target.value)}
                required
                type="text"
                value={q.label}
              />
            </div>
            <div>
              <label htmlFor={`type-${q.id}`}>タイプ</label>
              <select
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
              <div>
                <label htmlFor={`options-${q.id}`}>
                  選択肢（カンマ区切り）
                </label>
                <input
                  id={`options-${q.id}`}
                  onChange={(e) => updateQuestion(i, "options", e.target.value)}
                  type="text"
                  value={q.options}
                />
              </div>
            )}
            <button onClick={() => removeQuestion(i)} type="button">
              削除
            </button>
          </fieldset>
        ))}

        <button onClick={addQuestion} type="button">
          質問を追加
        </button>
        <button disabled={isMutating} type="submit">
          {isMutating ? "作成中..." : "作成する"}
        </button>
      </form>
    </div>
  );
}
