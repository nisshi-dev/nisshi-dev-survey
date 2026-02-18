import { Card, Chip, Skeleton } from "@heroui/react";
import { motion } from "motion/react";
import { useParams, useSearchParams } from "react-router-dom";
import { MarkdownRenderer } from "@/client/components/markdown-renderer";
import { SurveyForm } from "@/client/components/survey/survey-form";
import { useGetSurveyById } from "@/generated/api/survey/survey";
import type { Question, SurveyParam } from "@/shared/schema/survey";

interface DataEntry {
  id: string;
  label: string | null;
  values: Record<string, string>;
}

function SkeletonCard() {
  return (
    <Card className="w-full">
      <Card.Content className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-full" />
          <Skeleton className="h-4 w-40 rounded-lg" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
        </div>
      </Card.Content>
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b bg-surface">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 px-4 py-5">
          <Skeleton className="h-7 w-48 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-lg" />
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <div className="flex flex-col gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </main>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <Card.Content className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/10">
              <svg
                aria-label="警告アイコン"
                className="h-8 w-8 text-muted"
                fill="none"
                role="img"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-semibold text-lg">アンケートが見つかりません</p>
            <p className="mt-1 text-muted text-sm">
              URLが正しいか確認してください。
            </p>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
}

function EntryRequiredState() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
      >
        <Card>
          <Card.Content className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/10">
              <svg
                aria-label="リンクアイコン"
                className="h-8 w-8 text-muted"
                fill="none"
                role="img"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.364-3.06a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.25 9.69"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="font-semibold text-lg">専用リンクが必要です</p>
            <p className="mt-1 text-muted text-sm">
              このアンケートに回答するには、配布された専用リンクからアクセスしてください。
            </p>
          </Card.Content>
        </Card>
      </motion.div>
    </div>
  );
}

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const { data, isLoading } = useGetSurveyById(id ?? "");

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }
  if (data.status !== 200) {
    return <NotFoundState />;
  }

  const survey = data.data;
  const questions = survey.questions as Question[];
  const surveyParams = (survey.params ?? []) as SurveyParam[];
  const dataEntries = ((survey as Record<string, unknown>).dataEntries ??
    []) as DataEntry[];
  const hasDataEntries = dataEntries.length > 0;

  const entryId = searchParams.get("entry");

  // データエントリが定義されている場合のエントリベースアクセス
  if (hasDataEntries) {
    if (!entryId) {
      return <EntryRequiredState />;
    }
    const entry = dataEntries.find((e) => e.id === entryId);
    if (!entry) {
      return <NotFoundState />;
    }

    const visibleParams = surveyParams.filter((p) => p.visible);
    const paramValues = entry.values;

    return (
      <div className="flex min-h-screen flex-col">
        <header className="border-border border-b bg-surface">
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 px-4 py-5">
            <h1 className="font-bold text-xl">{survey.title}</h1>
            <p className="text-muted text-sm">
              {questions.length}問のアンケート
            </p>
          </div>
        </header>
        {visibleParams.length > 0 && (
          <div
            className="mx-auto flex w-full max-w-2xl flex-wrap gap-2 border-border border-b px-4 py-3"
            data-testid="survey-params"
          >
            {visibleParams.map((p) => (
              <Chip key={p.key} size="sm" variant="soft">
                {p.label}: {paramValues[p.key]}
              </Chip>
            ))}
          </div>
        )}
        {survey.description && (
          <div className="mx-auto w-full max-w-2xl border-border border-b px-4 py-4">
            <MarkdownRenderer content={survey.description} />
          </div>
        )}
        <main className="mx-auto w-full max-w-2xl px-4 py-6">
          <SurveyForm
            dataEntryId={entry.id}
            params={paramValues}
            questions={questions}
            surveyId={survey.id}
          />
        </main>
      </div>
    );
  }

  // データエントリ未定義: 従来のURLパラメータベースアクセス
  const paramValues: Record<string, string> = {};
  for (const p of surveyParams) {
    const v = searchParams.get(p.key);
    if (v) {
      paramValues[p.key] = v;
    }
  }
  const hasParamValues = Object.keys(paramValues).length > 0;
  const visibleParams = surveyParams.filter(
    (p) => p.visible && paramValues[p.key]
  );

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b bg-surface">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 px-4 py-5">
          <h1 className="font-bold text-xl">{survey.title}</h1>
          <p className="text-muted text-sm">{questions.length}問のアンケート</p>
        </div>
      </header>
      {visibleParams.length > 0 && (
        <div
          className="mx-auto flex w-full max-w-2xl flex-wrap gap-2 border-border border-b px-4 py-3"
          data-testid="survey-params"
        >
          {visibleParams.map((p) => (
            <Chip key={p.key} size="sm" variant="soft">
              {p.label}: {paramValues[p.key]}
            </Chip>
          ))}
        </div>
      )}
      {survey.description && (
        <div className="mx-auto w-full max-w-2xl border-border border-b px-4 py-4">
          <MarkdownRenderer content={survey.description} />
        </div>
      )}
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <SurveyForm
          params={hasParamValues ? paramValues : undefined}
          questions={questions}
          surveyId={survey.id}
        />
      </main>
    </div>
  );
}
