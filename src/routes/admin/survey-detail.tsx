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
import { QuestionItemCard } from "@/components/survey/question-item-card";
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
  QUESTION_TYPE_COLORS,
  QUESTION_TYPE_LABELS,
  type Question,
  SURVEY_STATUS_ACTION_LABELS,
  SURVEY_STATUS_COLOR_MAP,
  SURVEY_STATUS_LABELS,
  SURVEY_STATUSES,
  type SurveyParam,
  type SurveyStatus,
} from "@/types/survey";

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

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 flex items-center gap-2 font-bold text-lg tracking-tight">
      <span className="h-4 w-0.5 rounded-full bg-accent" />
      {children}
    </h2>
  );
}

function QuestionList({ questions }: { questions: Question[] }) {
  return (
    <div className="flex flex-col gap-2">
      {questions.map((q, i) => (
        <QuestionItemCard key={q.id}>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 rounded bg-surface-secondary px-1.5 py-0.5 font-mono text-muted text-xs">
              {i + 1}
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{q.label}</span>
                <Chip
                  color={QUESTION_TYPE_COLORS[q.type]}
                  size="sm"
                  variant="soft"
                >
                  {QUESTION_TYPE_LABELS[q.type]}
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
        </QuestionItemCard>
      ))}
    </div>
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
        <tr className="border-border border-b bg-surface-secondary/50">
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
          <tr
            className="border-border/50 border-b transition-colors even:bg-surface-secondary/30 hover:bg-surface-secondary/50"
            key={r.id}
          >
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
      <div className="flex flex-col items-center justify-center py-16">
        <Spinner aria-label="読み込み中" />
        <p className="mt-3 text-muted text-sm">読み込み中...</p>
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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-bold text-2xl tracking-tight">{survey.title}</h1>
          <Chip
            color={SURVEY_STATUS_COLOR_MAP[currentStatus]}
            size="sm"
            variant="soft"
          >
            {SURVEY_STATUS_LABELS[currentStatus]}
          </Chip>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
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
            {SURVEY_STATUS_ACTION_LABELS[s]}
          </Button>
        ))}
        {currentStatus !== "completed" && (
          <Button
            className="ml-auto"
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
          <SectionHeader>データ管理</SectionHeader>
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
            <p className="font-medium text-muted text-sm">共有 URL</p>
            <code
              className="mt-1 block break-all rounded-lg border border-border/50 bg-surface-secondary px-3 py-2 text-sm"
              data-testid="share-url"
            >
              {baseUrl}
            </code>
          </Card.Content>
        </Card>
      )}

      <div>
        <SectionHeader>質問一覧</SectionHeader>
        <QuestionList questions={questions} />
      </div>

      <div>
        <SectionHeader>回答一覧（{responses.length}件）</SectionHeader>
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
                  <span className="w-20 shrink-0 border-border/50 border-r pr-2 font-medium text-muted text-sm">
                    {param.label}
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
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner size="sm" />
            <p className="mt-2 text-muted text-sm">回答を読み込み中...</p>
          </div>
        )}
        {!responsesLoading && responses.length === 0 && (
          <Card>
            <Card.Content className="py-12 text-center">
              <svg
                aria-label="回答なしアイコン"
                className="mx-auto mb-3 h-10 w-10 text-muted/40"
                fill="none"
                role="img"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M20.25 7.5l-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="font-medium text-muted">まだ回答がありません</p>
              <p className="mt-1 text-muted/60 text-sm">
                回答が届くとここに表示されます。
              </p>
            </Card.Content>
          </Card>
        )}
      </div>

      {!responsesLoading && questions.length > 0 && (
        <div>
          <SectionHeader>質問別分析</SectionHeader>
          <ResponseAnalysis questions={questions} responses={responses} />
        </div>
      )}

      {!responsesLoading && responses.length > 0 && (
        <div>
          <SectionHeader>生データ</SectionHeader>
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
