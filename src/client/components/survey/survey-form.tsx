import { Button, Card, Form, Spinner } from "@heroui/react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostApiSurveyByIdSubmit } from "@/generated/api/survey/survey";
import type { Question } from "@/shared/schema/survey";
import { CheckboxQuestionField } from "./checkbox-question-field";
import { EmailCopySection } from "./email-copy-section";
import { RadioQuestionField } from "./radio-question-field";
import { TextQuestionField } from "./text-question-field";

interface Props {
  surveyId: string;
  questions: Question[];
  params?: Record<string, string>;
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function SurveyForm({ surveyId, questions, params }: Props) {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostApiSurveyByIdSubmit(surveyId);
  const [sendCopy, setSendCopy] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    const answers: Record<string, string | string[]> = {};
    for (const q of questions) {
      if (q.type === "checkbox") {
        answers[q.id] = formData.getAll(q.id) as string[];
      } else {
        answers[q.id] = (formData.get(q.id) as string) ?? "";
      }
    }

    const respondentEmail = formData.get("respondentEmail") as string;
    const hasParams = params && Object.keys(params).length > 0;
    await trigger({
      answers,
      ...(hasParams && { params }),
      ...(sendCopy && respondentEmail && { sendCopy: true, respondentEmail }),
    });
    navigate(`/survey/${surveyId}/complete`, { state: { submitted: true } });
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
                {q.type === "text" && (
                  <TextQuestionField index={i + 1} question={q} />
                )}
                {q.type === "radio" && (
                  <RadioQuestionField index={i + 1} question={q} />
                )}
                {q.type === "checkbox" && (
                  <CheckboxQuestionField index={i + 1} question={q} />
                )}
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
              <EmailCopySection
                onSendCopyChange={setSendCopy}
                sendCopy={sendCopy}
              />
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
