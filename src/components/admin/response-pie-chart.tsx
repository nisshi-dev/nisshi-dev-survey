import { Card } from "@heroui/react";
import { Pie, PieChart, Tooltip } from "recharts";
import type { CheckboxQuestion, RadioQuestion } from "@/types/survey";

const COLORS = [
  "#006FEE",
  "#9353D3",
  "#17C964",
  "#F5A524",
  "#F31260",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
];

interface Props {
  question: RadioQuestion | CheckboxQuestion;
  responses: Array<{ answers: Record<string, string | string[]> }>;
}

function tally(question: Props["question"], responses: Props["responses"]) {
  const counts = new Map<string, number>();
  for (const opt of question.options) {
    counts.set(opt, 0);
  }
  for (const r of responses) {
    const answer = r.answers[question.id];
    if (Array.isArray(answer)) {
      for (const v of answer) {
        if (counts.has(v)) {
          counts.set(v, (counts.get(v) ?? 0) + 1);
        }
      }
    } else if (typeof answer === "string" && counts.has(answer)) {
      counts.set(answer, (counts.get(answer) ?? 0) + 1);
    }
  }
  return question.options.map((name) => ({
    name,
    value: counts.get(name) ?? 0,
    fill: COLORS[question.options.indexOf(name) % COLORS.length],
  }));
}

export function ResponsePieChart({ question, responses }: Props) {
  const data = tally(question, responses);
  const totalAnswers = responses.length;

  return (
    <Card>
      <Card.Header>
        <h3 className="font-semibold text-sm">{question.label}</h3>
      </Card.Header>
      <Card.Content>
        {totalAnswers === 0 ? (
          <p className="py-4 text-center text-muted text-sm">回答なし</p>
        ) : (
          <div className="flex flex-row items-center gap-4">
            <PieChart height={160} width={160}>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                innerRadius={30}
                nameKey="name"
                outerRadius={70}
              />
              <Tooltip />
            </PieChart>
            <ul className="flex flex-col gap-1 text-sm">
              {data.map((d, i) => (
                <li className="flex items-center gap-2" key={d.name}>
                  <span
                    className="inline-block size-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  {d.name}: {d.value}件
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card.Content>
    </Card>
  );
}
