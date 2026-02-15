import { Card, Skeleton } from "@heroui/react";
import { motion } from "motion/react";
import { useParams } from "react-router-dom";
import { MarkdownRenderer } from "@/client/components/markdown-renderer";
import { useGetApiSurveyById } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";
import { SurveyForm } from "./survey-form";

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

export function SurveyPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetApiSurveyById(id ?? "");

  if (isLoading || !data) {
    return <LoadingSkeleton />;
  }
  if (data.status !== 200) {
    return <NotFoundState />;
  }

  const survey = data.data;
  const questions = survey.questions as Question[];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-border border-b bg-surface">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-1 px-4 py-5">
          <h1 className="font-bold text-xl">{survey.title}</h1>
          <p className="text-muted text-sm">{questions.length}問のアンケート</p>
        </div>
      </header>
      {survey.description && (
        <div className="mx-auto w-full max-w-2xl border-border border-b px-4 py-4">
          <MarkdownRenderer content={survey.description} />
        </div>
      )}
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <SurveyForm questions={questions} surveyId={survey.id} />
      </main>
    </div>
  );
}
