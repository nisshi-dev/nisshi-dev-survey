import { Checkbox, CheckboxGroup } from "@heroui/react";
import type { Question } from "@/shared/schema/survey";
import { QuestionBadge } from "./question-badge";

interface Props {
  question: Extract<Question, { type: "checkbox" }>;
  index: number;
}

export function CheckboxQuestionField({ question, index }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">
          {question.label}
          {question.required && <span className="ml-1 text-danger"> *</span>}
        </span>
      </div>
      <CheckboxGroup aria-label={question.label} name={question.id}>
        {question.options.map((opt) => (
          <Checkbox key={opt} value={opt}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            {opt}
          </Checkbox>
        ))}
      </CheckboxGroup>
    </div>
  );
}
