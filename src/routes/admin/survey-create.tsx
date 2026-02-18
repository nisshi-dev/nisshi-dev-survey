import { useNavigate } from "react-router-dom";
import { SurveyForm } from "@/components/admin/survey-form";
import { usePostAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";
import type { Question, SurveyParam } from "@/types/survey";

export function SurveyCreatePage() {
  const navigate = useNavigate();
  const { trigger, isMutating } = usePostAdminSurveys();

  const handleSubmit = async (data: {
    title: string;
    description: string | undefined;
    questions: Question[];
    params: SurveyParam[];
  }) => {
    await trigger(data);
    navigate("/admin");
  };

  return (
    <>
      <h1 className="mb-6 font-bold text-2xl">アンケート作成</h1>
      <SurveyForm
        isSubmitting={isMutating}
        onSubmit={handleSubmit}
        submitLabel="作成する"
      />
    </>
  );
}
