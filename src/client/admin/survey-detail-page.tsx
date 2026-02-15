import { Button, Card, Chip, Spinner } from "@heroui/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useDeleteApiAdminSurveysById,
  useGetApiAdminSurveysById,
  useGetApiAdminSurveysByIdResponses,
  usePatchApiAdminSurveysById,
} from "@/generated/api/admin-surveys/admin-surveys";
import {
  type Question,
  SURVEY_STATUS_LABELS,
  SURVEY_STATUSES,
  type SurveyStatus,
} from "@/shared/schema/survey";

const statusColorMap: Record<SurveyStatus, "default" | "success" | "warning"> =
  {
    draft: "default",
    active: "success",
    completed: "warning",
  };

const statusActionLabels: Record<SurveyStatus, string> = {
  draft: "下書きに戻す",
  active: "受付中にする",
  completed: "完了にする",
};

export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: surveyData,
    isLoading: surveyLoading,
    mutate,
  } = useGetApiAdminSurveysById(id ?? "");
  const { data: responsesData, isLoading: responsesLoading } =
    useGetApiAdminSurveysByIdResponses(id ?? "");
  const { trigger, isMutating } = usePatchApiAdminSurveysById(id ?? "");
  const { trigger: deleteTrigger, isMutating: isDeleting } =
    useDeleteApiAdminSurveysById(id ?? "");

  if (surveyLoading || !surveyData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner aria-label="読み込み中" />
        <p className="ml-2 text-muted">読み込み中...</p>
      </div>
    );
  }

  if (surveyData.status !== 200) {
    return (
      <Card>
        <Card.Content className="py-8 text-center">
          <p className="text-muted">アンケートが見つかりません。</p>
        </Card.Content>
      </Card>
    );
  }

  const survey = surveyData.data;
  const currentStatus = (survey.status as SurveyStatus) ?? "draft";
  const questions = survey.questions as Question[];
  const responses =
    responsesData && responsesData.status === 200
      ? responsesData.data.responses
      : [];

  const surveyUrl = `${window.location.origin}/survey/${survey.id}`;

  async function handleStatusChange(newStatus: SurveyStatus) {
    await trigger({ status: newStatus });
    mutate();
  }

  async function handleDelete() {
    // biome-ignore lint/suspicious/noAlert: 削除確認ダイアログとして使用
    if (!window.confirm("本当にこのアンケートを削除しますか？")) {
      return;
    }
    try {
      await deleteTrigger();
      navigate("/admin");
    } catch {
      // SWR がエラーをスローした場合はページに留まる
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <h1 className="font-bold text-2xl">{survey.title}</h1>
        <Chip color={statusColorMap[currentStatus]} size="sm" variant="soft">
          {SURVEY_STATUS_LABELS[currentStatus]}
        </Chip>
      </div>

      <div className="flex gap-2">
        {SURVEY_STATUSES.filter((s) => s !== currentStatus).map((s) => (
          <Button
            isDisabled={isMutating}
            key={s}
            onPress={() => handleStatusChange(s)}
            size="sm"
            variant="secondary"
          >
            {statusActionLabels[s]}
          </Button>
        ))}
        {currentStatus !== "completed" && (
          <Button
            isDisabled={isDeleting}
            onPress={handleDelete}
            size="sm"
            variant="danger"
          >
            削除
          </Button>
        )}
      </div>

      <Card>
        <Card.Content>
          <p className="text-muted text-sm">共有 URL</p>
          <code className="mt-1 block rounded-lg bg-surface-secondary px-3 py-2 text-sm">
            {surveyUrl}
          </code>
        </Card.Content>
      </Card>

      <div>
        <h2 className="mb-3 font-semibold text-lg">質問一覧</h2>
        <div className="flex flex-col gap-2">
          {questions.map((q) => (
            <Card
              className="flex-row items-center gap-3"
              key={q.id}
              variant="transparent"
            >
              <Chip>{q.type}</Chip>
              <span>
                {q.label}（{q.type}）
              </span>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 font-semibold text-lg">
          回答一覧（{responses.length}件）
        </h2>
        {responsesLoading && (
          <div className="flex items-center gap-2 py-4">
            <Spinner size="sm" />
            <p className="text-muted">回答を読み込み中...</p>
          </div>
        )}
        {!responsesLoading && responses.length === 0 && (
          <Card>
            <Card.Content className="py-8 text-center">
              <p className="text-muted">まだ回答がありません。</p>
            </Card.Content>
          </Card>
        )}
        {!responsesLoading && responses.length > 0 && (
          <Card>
            <Card.Content className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-border border-b">
                    {questions.map((q) => (
                      <th
                        className="px-3 py-2 font-medium text-muted"
                        key={q.id}
                      >
                        {q.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {responses.map((r) => (
                    <tr className="border-border/50 border-b" key={r.id}>
                      {questions.map((q) => {
                        const answer = r.answers[q.id];
                        return (
                          <td className="px-3 py-2" key={q.id}>
                            {Array.isArray(answer)
                              ? answer.join(", ")
                              : (answer ?? "")}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card.Content>
          </Card>
        )}
      </div>
    </div>
  );
}
