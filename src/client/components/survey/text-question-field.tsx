import { Input, Label, TextField } from "@heroui/react";
import type { Question } from "@/shared/schema/survey";
import { QuestionBadge } from "./question-badge";

interface Props {
  question: Extract<Question, { type: "text" }>;
  index: number;
}

export function TextQuestionField({ question, index }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">
          {question.label}
          {question.required && <span className="ml-1 text-danger"> *</span>}
        </span>
      </div>
      <TextField isRequired={question.required} name={question.id}>
        <Label className="sr-only">{question.label}</Label>
        <Input placeholder="回答を入力..." />
      </TextField>
    </div>
  );
}
