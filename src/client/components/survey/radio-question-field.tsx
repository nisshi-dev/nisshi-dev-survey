import { Radio, RadioGroup } from "@heroui/react";
import type { Question } from "@/shared/schema/survey";
import { QuestionBadge } from "./question-badge";

interface Props {
  question: Extract<Question, { type: "radio" }>;
  index: number;
}

export function RadioQuestionField({ question, index }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">{question.label}</span>
      </div>
      <RadioGroup aria-label={question.label} isRequired name={question.id}>
        {question.options.map((opt) => (
          <Radio key={opt} value={opt}>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            {opt}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
