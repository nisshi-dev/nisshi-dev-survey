import {
  Button,
  Card,
  Checkbox,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApiSurveyByIdSubmit } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";

interface Props {
  surveyId: string;
  questions: Question[];
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

function QuestionBadge({ index }: { index: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 font-semibold text-accent text-xs">
      {index}
    </span>
  );
}

function TextQuestionField({
  question,
  index,
}: {
  question: Extract<Question, { type: "text" }>;
  index: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <span className="font-medium text-sm">{question.label}</span>
      </div>
      <TextField isRequired name={question.id}>
        <Label className="sr-only">{question.label}</Label>
        <Input placeholder="回答を入力..." />
      </TextField>
    </div>
  );
}

function ChoiceQuestionField({
  question,
  index,
}: {
  question: Extract<Question, { type: "radio" | "checkbox" }>;
  index: number;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <QuestionBadge index={index} />
        <legend className="font-medium text-sm">{question.label}</legend>
      </div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt) => (
          <label
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:border-accent/50 hover:bg-accent/5 has-[:checked]:border-accent has-[:checked]:bg-accent/10"
            key={opt}
          >
            <input
              className="accent-[var(--accent)]"
              name={question.id}
              required={question.type === "radio"}
              type={question.type}
              value={opt}
            />
            <span className="text-sm">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function SurveyForm({ surveyId, questions }: Props) {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostApiSurveyByIdSubmit(surveyId);
  const [sendCopy, setSendCopy] = useState(false);
  const [respondentEmail, setRespondentEmail] = useState("");

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
    await trigger(
      sendCopy ? { answers, sendCopy: true, respondentEmail } : { answers }
    );
    navigate(`/survey/${surveyId}/complete`);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="flex w-full flex-col gap-4">
        {questions.map((q, i) => (
          <motion.div
            {...fadeInUp}
            key={q.id}
            transition={{
              duration: 0.4,
              delay: Math.min(i * 0.1, 0.8),
            }}
          >
            <Card className="w-full">
              <Card.Content>
                <fieldset className="flex flex-col gap-2">
                  {q.type === "text" && (
                    <TextQuestionField index={i + 1} question={q} />
                  )}
                  {(q.type === "radio" || q.type === "checkbox") && (
                    <ChoiceQuestionField index={i + 1} question={q} />
                  )}
                </fieldset>
              </Card.Content>
            </Card>
          </motion.div>
        ))}

        {error && (
          <motion.div {...fadeInUp} transition={{ duration: 0.3 }}>
            <Card className="border-danger/20 bg-danger/5">
              <Card.Content>
                <p className="text-danger text-sm">
                  送信に失敗しました。もう一度お試しください。
                </p>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        <motion.div
          {...fadeInUp}
          transition={{
            duration: 0.4,
            delay: Math.min(questions.length * 0.1, 0.8),
          }}
        >
          <Card className="w-full">
            <Card.Content>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="send-copy"
                    isSelected={sendCopy}
                    onChange={setSendCopy}
                  >
                    <Checkbox.Control>
                      <Checkbox.Indicator />
                    </Checkbox.Control>
                  </Checkbox>
                  <Label htmlFor="send-copy">
                    回答のコピーをメールで受け取る
                  </Label>
                </div>

                <AnimatePresence initial={false}>
                  {sendCopy && (
                    <motion.div
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      initial={{ opacity: 0, height: 0 }}
                      key="email-input"
                      style={{ overflow: "hidden" }}
                      transition={{ duration: 0.2 }}
                    >
                      <TextField
                        isRequired
                        name="respondentEmail"
                        onChange={setRespondentEmail}
                        type="email"
                        value={respondentEmail}
                      >
                        <Label>メールアドレス</Label>
                        <Input placeholder="example@mail.com" />
                      </TextField>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        <motion.div
          {...fadeInUp}
          transition={{
            duration: 0.4,
            delay: Math.min((questions.length + 1) * 0.1, 0.8),
          }}
        >
          <Card className="w-full">
            <Card.Content>
              <Button fullWidth isPending={isMutating} size="lg" type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "送信中..." : "回答を送信する"}
                  </>
                )}
              </Button>
            </Card.Content>
          </Card>
        </motion.div>
      </div>
    </Form>
  );
}
