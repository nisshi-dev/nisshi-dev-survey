import { Spinner } from "@heroui/react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { QuestionDraft } from "@/client/components/admin/survey-form";
import { SurveyForm } from "@/client/components/admin/survey-form";
import {
  useGetApiAdminSurveysById,
  usePutApiAdminSurveysById,
} from "@/generated/api/admin-surveys/admin-surveys";
import type { Question } from "@/shared/schema/survey";

function questionsToDrafts(questions: Question[]): QuestionDraft[] {
  return questions.map((q) => {
    if (q.type === "text") {
      return { id: q.id, type: "text" as const, label: q.label, options: "" };
    }
    return {
      id: q.id,
      type: q.type,
      label: q.label,
      options: q.options.join(", "),
    };
  });
}

export function SurveyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surveyData, isLoading } = useGetApiAdminSurveysById(id ?? "");
  const { trigger, isMutating } = usePutApiAdminSurveysById(id ?? "");

  const survey =
    surveyData && surveyData.status === 200 ? surveyData.data : null;
  const questions = (survey?.questions ?? []) as Question[];
  const isDraft = survey?.status === "draft";

  const initialDrafts = useMemo(
    () => questionsToDrafts(questions),
    [questions]
  );

  if (isLoading || !surveyData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner aria-label="読み込み中" />
        <p className="ml-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  if (!survey) {
    return <p className="text-muted">アンケートが見つかりません。</p>;
  }

  const handleSubmit = async (data: {
    title: string;
    description: string | undefined;
    questions: Question[];
  }) => {
    await trigger(data);
    navigate(`/admin/surveys/${id}`);
  };

  return (
    <>
      <h1 className="mb-6 font-bold text-2xl">アンケート編集</h1>
      <SurveyForm
        initialDescription={survey.description ?? ""}
        initialQuestions={initialDrafts}
        initialTitle={survey.title}
        isSubmitting={isMutating}
        onSubmit={handleSubmit}
        questionsDisabled={!isDraft}
        submitLabel="保存する"
      />
    </>
  );
}
