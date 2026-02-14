import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { SurveyForm } from "./SurveyForm";

type Survey = {
  id: string;
  title: string;
  questions: { id: string; type: string; label: string }[];
};

type PageState = "loading" | "form" | "done" | "error";

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const [state, setState] = useState<PageState>("loading");
  const [survey, setSurvey] = useState<Survey | null>(null);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/survey/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: Survey) => {
        setSurvey(data);
        setState("form");
      })
      .catch(() => {
        setState("error");
      });
  }, [id]);

  if (state === "loading") return <p>読み込み中...</p>;
  if (state === "error") return <p>アンケートが見つかりません。</p>;
  if (state === "done") return <p>ご回答ありがとうございました！</p>;

  return (
    <div>
      <h1>{survey?.title}</h1>
      {survey && (
        <SurveyForm
          survey={survey}
          onComplete={() => setState("done")}
        />
      )}
    </div>
  );
}
