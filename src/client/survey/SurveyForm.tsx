import { useNavigate } from "react-router-dom";
import useSWRMutation from "swr/mutation";

interface Props {
  survey: {
    id: string;
    title: string;
    questions: { id: string; type: string; label: string }[];
  };
}

async function submitSurvey(
  url: string,
  { arg }: { arg: Record<string, string> }
) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers: arg }),
  });
  if (!res.ok) {
    throw new Error("Submit failed");
  }
}

export function SurveyForm({ survey }: Props) {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = useSWRMutation(
    `/api/survey/${survey.id}/submit`,
    submitSurvey
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string> = {};
    for (const [key, value] of fd.entries()) {
      answers[key] = value as string;
    }
    await trigger(answers);
    navigate(`/survey/${survey.id}/complete`);
  };

  return (
    <form onSubmit={handleSubmit}>
      {survey.questions.map((q) => (
        <div key={q.id}>
          <label htmlFor={q.id}>{q.label}</label>
          <textarea id={q.id} name={q.id} required />
        </div>
      ))}
      {error && <p>送信に失敗しました。もう一度お試しください。</p>}
      <button disabled={isMutating} type="submit">
        {isMutating ? "送信中..." : "回答を送信する"}
      </button>
    </form>
  );
}
