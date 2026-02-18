import { Link, useNavigate } from "react-router-dom";
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
    <div className="flex flex-col gap-8">
      <div>
        <Link
          className="mb-2 inline-flex items-center gap-1 text-muted text-xs hover:text-foreground"
          to="/admin"
        >
          <span aria-hidden>←</span> ダッシュボード
        </Link>
        <h1 className="font-bold text-2xl tracking-tight">アンケート作成</h1>
        <p className="mt-1 text-muted text-sm">
          質問・パラメータを設定してアンケートを作成します
        </p>
      </div>
      <SurveyForm
        isSubmitting={isMutating}
        onSubmit={handleSubmit}
        submitLabel="作成する"
      />
    </div>
  );
}
