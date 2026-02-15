import { useNavigate } from "react-router-dom";
import { usePostApiAdminSurveys } from "@/generated/api/admin-surveys/admin-surveys";
import type { Question } from "@/shared/schema/survey";
import { SurveyForm } from "./survey-form";

export function SurveyCreatePage() {
  const navigate = useNavigate();
  const { trigger, isMutating } = usePostApiAdminSurveys();

  const handleSubmit = async (data: {
    title: string;
    description: string | undefined;
    questions: Question[];
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
