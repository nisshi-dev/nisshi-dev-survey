import { useState } from "react";

type Props = {
  survey: {
    id: string;
    title: string;
    questions: { id: string; type: string; label: string }[];
  };
  onComplete: () => void;
};

export function SurveyForm({ survey, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch(`/api/survey/${survey.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!res.ok) throw new Error("Submit failed");
      onComplete();
    } catch {
      alert("送信に失敗しました。もう一度お試しください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {survey.questions.map((q) => (
        <div key={q.id}>
          <label htmlFor={q.id}>{q.label}</label>
          <textarea
            id={q.id}
            value={answers[q.id] ?? ""}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
            }
            required
          />
        </div>
      ))}
      <button type="submit" disabled={submitting}>
        {submitting ? "送信中..." : "回答を送信する"}
      </button>
    </form>
  );
}
