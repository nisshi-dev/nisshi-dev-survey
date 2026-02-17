import { Input, Radio, RadioGroup, TextField } from "@heroui/react";
import { useState } from "react";
import type { Question } from "@/shared/schema/survey";
import { OTHER_VALUE } from "@/shared/schema/survey";
import { QuestionBadge } from "./question-badge";

interface Props {
  index: number;
  question: Extract<Question, { type: "radio" }>;
}

export function RadioQuestionField({ question, index }: Props) {
  const [selectedValue, setSelectedValue] = useState("");
  const [otherText, setOtherText] = useState("");

  const isOtherSelected = selectedValue === OTHER_VALUE;
  const actualValue = isOtherSelected ? otherText : selectedValue;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">
          {question.label}
          {question.required && <span className="ml-1 text-danger"> *</span>}
        </span>
      </div>
      <input name={question.id} type="hidden" value={actualValue} />
      <RadioGroup
        aria-label={question.label}
        isRequired={question.required}
        onChange={setSelectedValue}
        value={selectedValue}
      >
        {question.options.map((opt) => (
          <Radio key={opt} value={opt}>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            {opt}
          </Radio>
        ))}
        {question.allowOther && (
          <Radio value={OTHER_VALUE}>
            <Radio.Control>
              <Radio.Indicator />
            </Radio.Control>
            その他
          </Radio>
        )}
      </RadioGroup>
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
