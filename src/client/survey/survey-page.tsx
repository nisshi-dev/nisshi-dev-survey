import { Card, Spinner } from "@heroui/react";
import { useParams } from "react-router-dom";
import { useGetApiSurveyById } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";
import { SurveyForm } from "./survey-form";

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetApiSurveyById(id ?? "");

  if (isLoading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner aria-label="読み込み中" size="lg" />
        <p className="ml-3 text-muted">読み込み中...</p>
      </div>
    );
  }
  if (data.status !== 200) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <Card.Content className="py-8 text-center">
            <p className="text-muted">アンケートが見つかりません。</p>
          </Card.Content>
        </Card>
      </div>
    );
  }

  const survey = data.data;
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 font-bold text-2xl">{survey.title}</h1>
      <SurveyForm
        questions={survey.questions as Question[]}
        surveyId={survey.id}
      />
    </div>
  );
}
