import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { IdParamSchema } from "@/shared/schema/common";
import {
  SubmitAnswersSchema,
  SubmitSuccessResponseSchema,
  SurveyResponseSchema,
} from "@/shared/schema/survey";

const app = new Hono();

// アンケート取得
app.get(
  "/:id",
  describeRoute({
    tags: ["Survey"],
    summary: "アンケート取得",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(SurveyResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", IdParamSchema),
  (c) => {
    const { id } = c.req.valid("param");

    // TODO: Prisma でアンケート取得
    return c.json({
      id,
      title: "サンプルアンケート",
      questions: [
        { id: "q1", type: "text" as const, label: "ご意見をお聞かせください" },
      ],
    });
  }
);

// 回答送信
app.post(
  "/:id/submit",
  describeRoute({
    tags: ["Survey"],
    summary: "回答送信",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(SubmitSuccessResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", IdParamSchema),
  validator("json", SubmitAnswersSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { answers } = c.req.valid("json");

    if (!answers) {
      return c.json({ error: "Answers required" }, 400);
    }

    // TODO: Prisma で回答保存
    return c.json({ success: true, surveyId: id });
  }
);

export default app;
