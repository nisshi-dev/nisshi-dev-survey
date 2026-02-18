import { Card } from "@heroui/react";
import type { TextQuestion } from "@/types/survey";

interface Props {
  question: TextQuestion;
  responses: Array<{ answers: Record<string, string | string[]> }>;
}

export function TextResponseList({ question, responses }: Props) {
  const answers = responses
    .map((r) => r.answers[question.id])
    .filter((a): a is string => typeof a === "string" && a.length > 0);

  return (
    <Card>
      <Card.Header>
        <h3 className="font-semibold text-sm">{question.label}</h3>
      </Card.Header>
      <Card.Content>
        {answers.length === 0 ? (
          <p className="py-4 text-center text-muted text-sm">回答なし</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {answers.map((a, i) => (
              <li
                className="rounded-lg bg-surface-secondary px-3 py-2 text-sm"
                key={`${question.id}-${i}`}
              >
                {a}
              </li>
            ))}
          </ul>
        )}
      </Card.Content>
    </Card>
  );
}
