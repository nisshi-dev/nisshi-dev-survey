import {
  Button,
  Card,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { usePostApiSurveyByIdSubmit } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";

interface Props {
  surveyId: string;
  questions: Question[];
}

export function SurveyForm({ surveyId, questions }: Props) {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostApiSurveyByIdSubmit(surveyId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const answers: Record<string, string | string[]> = {};
    for (const q of questions) {
      if (q.type === "checkbox") {
        answers[q.id] = fd.getAll(q.id) as string[];
      } else {
        answers[q.id] = (fd.get(q.id) as string) ?? "";
      }
    }
    await trigger({ answers });
    navigate(`/survey/${surveyId}/complete`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Card className="w-full">
        <Card.Content className="flex flex-col gap-6">
          {questions.map((q) => (
            <fieldset className="flex flex-col gap-2" key={q.id}>
              {q.type === "text" && (
                <TextField isRequired name={q.id}>
                  <Label>{q.label}</Label>
                  <Input placeholder="回答を入力..." />
                </TextField>
              )}
              {q.type === "radio" && (
                <div className="flex flex-col gap-2">
                  <legend className="font-medium text-sm">{q.label}</legend>
                  <div className="flex flex-col gap-1">
                    {q.options.map((opt) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface-secondary"
                        key={opt}
                      >
                        <input
                          className="accent-[var(--accent)]"
                          name={q.id}
                          required
                          type="radio"
                          value={opt}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {q.type === "checkbox" && (
                <div className="flex flex-col gap-2">
                  <legend className="font-medium text-sm">{q.label}</legend>
                  <div className="flex flex-col gap-1">
                    {q.options.map((opt) => (
                      <label
                        className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 hover:bg-surface-secondary"
                        key={opt}
                      >
                        <input
                          className="accent-[var(--accent)]"
                          name={q.id}
                          type="checkbox"
                          value={opt}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </fieldset>
          ))}
        </Card.Content>
        <Card.Footer className="flex flex-col gap-3">
          {error && (
            <p className="text-danger text-sm">
              送信に失敗しました。もう一度お試しください。
            </p>
          )}
          <Button fullWidth isPending={isMutating} type="submit">
            {({ isPending }) => (
              <>
                {isPending ? <Spinner color="current" size="sm" /> : null}
                {isPending ? "送信中..." : "回答を送信する"}
              </>
            )}
          </Button>
        </Card.Footer>
      </Card>
    </Form>
  );
}
