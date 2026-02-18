import { Button, Card, Chip, Spinner } from "@heroui/react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { DataEntryFormModal } from "@/components/admin/data-entry-form-modal";
import {
  type DataEntry,
  DataEntryTable,
} from "@/components/admin/data-entry-table";
import { ResponsePieChart } from "@/components/admin/response-pie-chart";
import { TextResponseList } from "@/components/admin/text-response-list";
import {
  useDeleteAdminSurveysById,
  useDeleteAdminSurveysByIdDataEntriesByEntryId,
  useGetAdminSurveysById,
  useGetAdminSurveysByIdResponses,
  usePatchAdminSurveysById,
  usePostAdminSurveysByIdDataEntries,
  usePutAdminSurveysByIdDataEntriesByEntryId,
} from "@/generated/api/admin-surveys/admin-surveys";
import {
  type Question,
  SURVEY_STATUS_LABELS,
  SURVEY_STATUSES,
  type SurveyParam,
  type SurveyStatus,
} from "@/types/survey";

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

const questionTypeLabels: Record<Question["type"], string> = {
  text: "テキスト",
  radio: "単一選択",
  checkbox: "複数選択",
};

const questionTypeColors: Record<
  Question["type"],
  "default" | "accent" | "warning"
> = {
  text: "default",
  radio: "accent",
  checkbox: "warning",
};

function ResponseAnalysis({
  questions,
  responses,
}: {
  questions: Question[];
  responses: { id: string; answers: Record<string, unknown> }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {questions.map((q) =>
        q.type === "radio" || q.type === "checkbox" ? (
          <ResponsePieChart key={q.id} question={q} responses={responses} />
        ) : (
          <TextResponseList key={q.id} question={q} responses={responses} />
        )
      )}
    </div>
  );
}

function QuestionList({ questions }: { questions: Question[] }) {
  return (
    <Card>
      <Card.Content className="flex flex-col gap-0 p-0">
        {questions.map((q, i) => (
          <div
            className="flex items-start gap-3 border-border/50 px-4 py-3 [&:not(:last-child)]:border-b"
            key={q.id}
          >
            <span className="mt-0.5 font-mono text-muted text-xs">{i + 1}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{q.label}</span>
                <Chip
                  color={questionTypeColors[q.type]}
                  size="sm"
                  variant="soft"
                >
                  {questionTypeLabels[q.type]}
                </Chip>
              </div>
              {(q.type === "radio" || q.type === "checkbox") && (
                <div className="flex flex-wrap gap-1.5">
                  {q.options.map((opt) => (
                    <span
                      className="rounded-md bg-surface-secondary px-2 py-0.5 text-muted text-xs"
                      key={opt}
                    >
                      {opt}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </Card.Content>
    </Card>
  );
}

function RawDataTable({
  surveyParams,
  questions,
  responses,
}: {
  surveyParams: SurveyParam[];
  questions: Question[];
  responses: {
    id: string;
    answers: Record<string, unknown>;
    params?: unknown;
  }[];
}) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="border-border border-b">
          {surveyParams.map((p) => (
            <th
              className="px-3 py-2 font-medium text-muted text-xs tracking-wider"
              key={`param-${p.key}`}
            >
              {p.label}
            </th>
          ))}
          {questions.map((q) => (
            <th
              className="px-3 py-2 font-medium text-muted text-xs tracking-wider"
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
            {surveyParams.map((p) => {
              const params = (r.params ?? {}) as Record<string, string>;
              return (
                <td className="px-3 py-2" key={`param-${p.key}`}>
                  {params[p.key] ?? ""}
                </td>
              );
            })}
            {questions.map((q) => {
              const answer = r.answers[q.id];
              return (
                <td className="px-3 py-2" key={q.id}>
                  {Array.isArray(answer) ? answer.join(", ") : (answer ?? "")}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: 詳細ページは条件分岐が多いが、コンポーネント分割済み
export function SurveyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    data: surveyData,
    isLoading: surveyLoading,
    mutate,
  } = useGetAdminSurveysById(id ?? "");
  const { data: responsesData, isLoading: responsesLoading } =
    useGetAdminSurveysByIdResponses(id ?? "");
  const { trigger, isMutating } = usePatchAdminSurveysById(id ?? "");
  const { trigger: deleteTrigger, isMutating: isDeleting } =
    useDeleteAdminSurveysById(id ?? "");

  const { trigger: createEntryTrigger, isMutating: isCreatingEntry } =
    usePostAdminSurveysByIdDataEntries(id ?? "");
  const { trigger: updateEntryTrigger, isMutating: isUpdatingEntry } =
    usePutAdminSurveysByIdDataEntriesByEntryId(id ?? "", "");
  const { trigger: deleteEntryTrigger } =
    useDeleteAdminSurveysByIdDataEntriesByEntryId(id ?? "", "");

  const [entryModalOpen, setEntryModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DataEntry | null>(null);
  const [paramFilters, setParamFilters] = useState<Record<string, string>>({});

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
  const surveyParams = (survey.params ?? []) as SurveyParam[];
  const hasParams = surveyParams.length > 0;
  const dataEntries = ((survey as Record<string, unknown>).dataEntries ??
    []) as DataEntry[];

  const rawResponses =
    responsesData && responsesData.status === 200
      ? responsesData.data.responses
      : [];

  const allResponses = rawResponses.map((r) => {
    const raw = (r as Record<string, unknown>).params as
      | Record<string, string>
      | undefined;
    const hasResponseParams = raw && Object.keys(raw).length > 0;
    const resolvedParams = hasResponseParams
      ? raw
      : (dataEntries.find(
          (e) => e.id === (r as Record<string, unknown>).dataEntryId
        )?.values ?? {});
    return { ...r, params: resolvedParams };
  });

  const hasActiveFilters = Object.values(paramFilters).some(Boolean);
  const responses = hasActiveFilters
    ? allResponses.filter((r) =>
        Object.entries(paramFilters).every(
          ([key, value]) => !value || r.params[key] === value
        )
      )
    : allResponses;

  const baseUrl = `${window.location.origin}/survey/${survey.id}`;

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

  async function handleCreateEntry(data: {
    values: Record<string, string>;
    label: string | undefined;
  }) {
    await createEntryTrigger({ values: data.values, label: data.label });
    mutate();
    setEntryModalOpen(false);
  }

  async function handleUpdateEntry(data: {
    values: Record<string, string>;
    label: string | undefined;
  }) {
    if (!editingEntry) {
      return;
    }
    await updateEntryTrigger({ values: data.values, label: data.label });
    mutate();
    setEditingEntry(null);
  }

  async function handleDeleteEntry(_entryId: string) {
    await deleteEntryTrigger();
    mutate();
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link
          className="mb-2 inline-flex items-center gap-1 text-muted text-xs hover:text-foreground"
          to="/admin"
        >
          <span aria-hidden>←</span> ダッシュボード
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-bold text-2xl tracking-tight">{survey.title}</h1>
          <Chip color={statusColorMap[currentStatus]} size="sm" variant="soft">
            {SURVEY_STATUS_LABELS[currentStatus]}
          </Chip>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onPress={() => navigate(`/admin/surveys/${id}/edit`)} size="sm">
          編集
        </Button>
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

      {hasParams ? (
        <div>
          <h2 className="mb-3 font-bold text-lg tracking-tight">データ管理</h2>
          <Card>
            <Card.Content>
              <DataEntryTable
                entries={dataEntries}
                onAdd={() => setEntryModalOpen(true)}
                onDelete={handleDeleteEntry}
                onEdit={(entry) => setEditingEntry(entry)}
                params={surveyParams}
                surveyId={survey.id}
              />
            </Card.Content>
          </Card>
          <DataEntryFormModal
            isOpen={entryModalOpen}
            isSubmitting={isCreatingEntry}
            mode="create"
            onOpenChange={setEntryModalOpen}
            onSubmit={handleCreateEntry}
            params={surveyParams}
          />
          {editingEntry && (
            <DataEntryFormModal
              initialLabel={editingEntry.label ?? ""}
              initialValues={editingEntry.values}
              isOpen={true}
              isSubmitting={isUpdatingEntry}
              mode="edit"
              onOpenChange={(open) => {
                if (!open) {
                  setEditingEntry(null);
                }
              }}
              onSubmit={handleUpdateEntry}
              params={surveyParams}
            />
          )}
        </div>
      ) : (
        <Card>
          <Card.Content>
            <p className="text-muted text-sm">共有 URL</p>
            <code
              className="mt-1 block rounded-lg bg-surface-secondary px-3 py-2 text-sm"
              data-testid="share-url"
            >
              {baseUrl}
            </code>
          </Card.Content>
        </Card>
      )}

      <div>
        <h2 className="mb-3 font-bold text-lg tracking-tight">質問一覧</h2>
        <QuestionList questions={questions} />
      </div>

      <div>
        <h2 className="mb-3 font-bold text-lg tracking-tight">
          回答一覧（{responses.length}件）
        </h2>
        {hasParams && dataEntries.length > 0 && (
          <div className="mb-3 flex flex-col gap-2">
            {surveyParams.map((param) => {
              const uniqueValues = [
                ...new Set(
                  dataEntries
                    .map((e) => e.values[param.key])
                    .filter((v): v is string => Boolean(v))
                ),
              ];
              if (uniqueValues.length === 0) {
                return null;
              }
              return (
                <div className="flex items-center gap-2" key={param.key}>
                  <span className="shrink-0 text-muted text-sm">
                    {param.label}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <Chip
                      color={paramFilters[param.key] ? "default" : "accent"}
                      variant={paramFilters[param.key] ? "soft" : "secondary"}
                    >
                      <button
                        onClick={() =>
                          setParamFilters((prev) => ({
                            ...prev,
                            [param.key]: "",
                          }))
                        }
                        type="button"
                      >
                        すべて
                      </button>
                    </Chip>
                    {uniqueValues.map((value) => (
                      <Chip
                        color={
                          paramFilters[param.key] === value
                            ? "accent"
                            : "default"
                        }
                        key={value}
                        variant={
                          paramFilters[param.key] === value
                            ? "secondary"
                            : "soft"
                        }
                      >
                        <button
                          onClick={() =>
                            setParamFilters((prev) => ({
                              ...prev,
                              [param.key]: value,
                            }))
                          }
                          type="button"
                        >
                          {value}
                        </button>
                      </Chip>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
      </div>

      {!responsesLoading && questions.length > 0 && (
        <div>
          <h2 className="mb-3 font-bold text-lg tracking-tight">質問別分析</h2>
          <ResponseAnalysis questions={questions} responses={responses} />
        </div>
      )}

      {!responsesLoading && responses.length > 0 && (
        <div>
          <h2 className="mb-3 font-bold text-lg tracking-tight">生データ</h2>
          <Card>
            <Card.Content className="overflow-x-auto">
              <RawDataTable
                questions={questions}
                responses={responses}
                surveyParams={surveyParams}
              />
            </Card.Content>
          </Card>
        </div>
      )}
    </div>
  );
}
