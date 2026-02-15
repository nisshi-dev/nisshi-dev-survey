import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { safeParse } from "valibot";
import { prisma } from "@/server/lib/db";
import { ErrorResponseSchema, IdParamSchema } from "@/shared/schema/common";
import {
  QuestionsSchema,
  SubmitAnswersSchema,
  SubmitSuccessResponseSchema,
  SurveyResponseSchema,
} from "@/shared/schema/survey";

const app = new Hono();

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
      404: {
        description: "見つからない",
        content: {
          "application/json": {
            schema: resolver(ErrorResponseSchema),
          },
        },
      },
    },
  }),
  validator("param", IdParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const survey = await prisma.survey.findUnique({ where: { id } });
    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }
    const parsed = safeParse(QuestionsSchema, survey.questions);
    return c.json({
      id: survey.id,
      title: survey.title,
      questions: parsed.success ? parsed.output : [],
    });
  }
);

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
      404: {
        description: "見つからない",
        content: {
          "application/json": {
            schema: resolver(ErrorResponseSchema),
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

    const survey = await prisma.survey.findUnique({ where: { id } });
    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }

    await prisma.response.create({
      data: { surveyId: id, answers },
    });

    return c.json({ success: true, surveyId: id });
  }
);

export default app;
