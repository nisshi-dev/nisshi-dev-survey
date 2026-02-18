import { Checkbox, CheckboxGroup, Input, TextField } from "@heroui/react";
import { useState } from "react";
import type { Question } from "@/types/survey";
import { OTHER_VALUE } from "@/types/survey";
import { QuestionBadge } from "./question-badge";

interface Props {
  index: number;
  question: Extract<Question, { type: "checkbox" }>;
}

export function CheckboxQuestionField({ question, index }: Props) {
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [otherText, setOtherText] = useState("");

  const isOtherSelected = selectedValues.includes(OTHER_VALUE);
  // hidden input に入れる実際の値: __other__ を otherText に置換
  const actualValues = selectedValues.map((v) =>
    v === OTHER_VALUE ? otherText : v
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">
          {question.label}
          {question.required && <span className="ml-1 text-danger"> *</span>}
        </span>
      </div>
      {actualValues.map((val, i) => (
        <input
          key={`${question.id}-hidden-${i}`}
          name={question.id}
          type="hidden"
          value={val}
        />
      ))}
      <CheckboxGroup
        aria-label={question.label}
        onChange={setSelectedValues}
        value={selectedValues}
      >
        {question.options.map((opt) => (
          <Checkbox key={opt} value={opt}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            {opt}
          </Checkbox>
        ))}
        {question.allowOther && (
          <Checkbox value={OTHER_VALUE}>
            <Checkbox.Control>
              <Checkbox.Indicator />
            </Checkbox.Control>
            その他
          </Checkbox>
        )}
      </CheckboxGroup>
      {isOtherSelected && (
        <TextField aria-label="その他の回答">
          <Input
            onChange={(e) => setOtherText(e.target.value)}
            placeholder="入力してください"
            value={otherText}
          />
        </TextField>
      )}
    </div>
  );
}
