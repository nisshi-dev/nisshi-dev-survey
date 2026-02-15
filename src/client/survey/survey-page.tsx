import { useParams } from "react-router-dom";
import { useGetApiSurveyById } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";
import { SurveyForm } from "./survey-form";

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetApiSurveyById(id ?? "");

  if (isLoading || !data) {
    return <p>読み込み中...</p>;
  }
  if (data.status !== 200) {
    return <p>アンケートが見つかりません。</p>;
  }

  const survey = data.data;
  return (
    <div>
      <h1>{survey.title}</h1>
      <SurveyForm
        questions={survey.questions as Question[]}
        surveyId={survey.id}
      />
    </div>
  );
}
