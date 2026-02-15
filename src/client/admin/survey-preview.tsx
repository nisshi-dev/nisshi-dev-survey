import { Button, Card } from "@heroui/react";
import { MarkdownRenderer } from "@/client/components/markdown-renderer";
import type { Question } from "@/shared/schema/survey";

interface Props {
  title: string;
  description: string;
  questions: Question[];
}

function QuestionBadge({ index }: { index: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-xs">
      {index}
    </span>
  );
}

function PreviewQuestionCard({
  question,
  index,
}: {
  question: Question;
  index: number;
}) {
  return (
    <Card className="w-full">
      <Card.Content>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <QuestionBadge index={index} />
            <span className="font-medium text-sm">{question.label}</span>
          </div>
          {question.type === "text" && (
            <div className="rounded-xl border border-border bg-muted/5 px-4 py-3 text-muted text-sm">
              回答を入力...
            </div>
          )}
          {(question.type === "radio" || question.type === "checkbox") &&
            question.options.map((opt) => (
              <label
                className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3"
                key={opt}
              >
                <input disabled type={question.type} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
        </div>
      </Card.Content>
    </Card>
  );
}

export function SurveyPreview({ title, description, questions }: Props) {
  return (
    <div className="flex flex-col">
      <div className="border-border border-b bg-surface">
        <div className="flex flex-col items-center gap-1 px-4 py-5">
          <h2 className="font-bold text-xl">
            {title || <span className="text-muted">タイトル未入力</span>}
          </h2>
          <p className="text-muted text-sm">{questions.length}問のアンケート</p>
        </div>
      </div>

      {description && (
        <div className="border-border border-b px-4 py-4">
          <MarkdownRenderer content={description} />
        </div>
      )}

      <div className="flex flex-col gap-4 px-4 py-6">
        {questions.map((q, i) => (
          <PreviewQuestionCard index={i + 1} key={q.id} question={q} />
        ))}

        <Card className="w-full">
          <Card.Content>
            <Button fullWidth isDisabled size="lg">
              回答を送信する
            </Button>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
