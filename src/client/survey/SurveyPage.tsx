import { useParams } from "react-router-dom";
import useSWR from "swr";
import { SurveyForm } from "./SurveyForm";

interface Survey {
  id: string;
  title: string;
  questions: { id: string; type: string; label: string }[];
}

const fetcher = (url: string) =>
  fetch(url).then((res) => {
    if (!res.ok) {
      throw new Error("Not found");
    }
    return res.json() as Promise<Survey>;
  });

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const {
    data: survey,
    error,
    isLoading,
  } = useSWR(id ? `/api/survey/${id}` : null, fetcher);

  if (isLoading) {
    return <p>読み込み中...</p>;
  }
  if (error || !survey) {
    return <p>アンケートが見つかりません。</p>;
  }

  return (
    <div>
      <h1>{survey.title}</h1>
      <SurveyForm survey={survey} />
    </div>
  );
}
