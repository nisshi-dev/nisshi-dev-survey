import { useNavigate } from "react-router-dom";
import { usePostApiSurveyByIdSubmit } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";

interface Props {
  surveyId: string;
  questions: Question[];
}

export function SurveyForm({ surveyId, questions }: Props) {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostApiSurveyByIdSubmit(surveyId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string | string[]> = {};
    for (const q of questions) {
      if (q.type === "checkbox") {
        answers[q.id] = fd.getAll(q.id) as string[];
      } else {
        answers[q.id] = (fd.get(q.id) as string) ?? "";
      }
    }
    await trigger({ answers });
    navigate(`/survey/${surveyId}/complete`);
  };

  return (
    <form onSubmit={handleSubmit}>
      {questions.map((q) => (
        <fieldset key={q.id}>
          {q.type === "text" && (
            <div>
              <label htmlFor={q.id}>{q.label}</label>
              <input id={q.id} name={q.id} required type="text" />
            </div>
          )}
          {q.type === "radio" && (
            <div>
              <legend>{q.label}</legend>
              {q.options.map((opt) => (
                <label key={opt}>
                  <input name={q.id} required type="radio" value={opt} />
                  {opt}
                </label>
              ))}
            </div>
          )}
          {q.type === "checkbox" && (
            <div>
              <legend>{q.label}</legend>
              {q.options.map((opt) => (
                <label key={opt}>
                  <input name={q.id} type="checkbox" value={opt} />
                  {opt}
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ))}
      {error && <p>送信に失敗しました。もう一度お試しください。</p>}
      <button disabled={isMutating} type="submit">
        {isMutating ? "送信中..." : "回答を送信する"}
      </button>
    </form>
  );
}
