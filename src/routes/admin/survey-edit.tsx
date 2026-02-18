import { Spinner } from "@heroui/react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { ParamDraft, QuestionDraft } from "@/components/admin/survey-form";
import { SurveyForm } from "@/components/admin/survey-form";
import {
  useGetAdminSurveysById,
  usePutAdminSurveysById,
} from "@/generated/api/admin-surveys/admin-surveys";
import type { Question, SurveyParam } from "@/types/survey";

function questionsToDrafts(questions: Question[]): QuestionDraft[] {
  return questions.map((q) => {
    if (q.type === "text") {
      return {
        id: q.id,
        type: "text" as const,
        label: q.label,
        options: "",
        required: q.required ?? false,
        allowOther: false,
      };
    }
    return {
      id: q.id,
      type: q.type,
      label: q.label,
      options: q.options.join(", "),
      required: q.required ?? false,
      allowOther: q.allowOther ?? false,
    };
  });
}

function paramsToDrafts(params: SurveyParam[]): ParamDraft[] {
  return params.map((p, i) => ({
    id: `p-existing-${i}`,
    key: p.key,
    label: p.label,
    visible: p.visible,
    keyManuallyEdited: true,
  }));
}

export function SurveyEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: surveyData, isLoading } = useGetAdminSurveysById(id ?? "");
  const { trigger, isMutating } = usePutAdminSurveysById(id ?? "");

  const survey =
    surveyData && surveyData.status === 200 ? surveyData.data : null;
  const questions = (survey?.questions ?? []) as Question[];
  const surveyParams = (survey?.params ?? []) as SurveyParam[];
  const isDraft = survey?.status === "draft";

  const initialDrafts = useMemo(
    () => questionsToDrafts(questions),
    [questions]
  );

  const initialParamDrafts = useMemo(
    () => paramsToDrafts(surveyParams),
    [surveyParams]
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
    params: SurveyParam[];
  }) => {
    await trigger(data);
    navigate(`/admin/surveys/${id}`);
  };

  return (
    <>
      <h1 className="mb-6 font-bold text-2xl">アンケート編集</h1>
      <SurveyForm
        initialDescription={survey.description ?? ""}
        initialParams={initialParamDrafts}
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
