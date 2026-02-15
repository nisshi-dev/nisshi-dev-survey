import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { safeParse } from "valibot";
import { prisma } from "@/server/lib/db";
import { ErrorResponseSchema, IdParamSchema } from "@/shared/schema/common";
import {
  AdminSurveyResponseSchema,
  CreateSurveySchema,
  QuestionsSchema,
  SurveyListResponseSchema,
  SurveyResponsesSchema,
} from "@/shared/schema/survey";

const app = new Hono();

app.get(
  "/",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "アンケート一覧取得",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(SurveyListResponseSchema),
          },
        },
      },
    },
  }),
  async (c) => {
    const surveys = await prisma.survey.findMany({
      select: { id: true, title: true },
      orderBy: { createdAt: "desc" },
    });
    return c.json({ surveys });
  }
);

app.post(
  "/",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "アンケート作成",
    responses: {
      201: {
        description: "作成成功",
        content: {
          "application/json": {
            schema: resolver(AdminSurveyResponseSchema),
          },
        },
      },
    },
  }),
  validator("json", CreateSurveySchema),
  async (c) => {
    const { title, description, questions } = c.req.valid("json");
    const survey = await prisma.survey.create({
      data: { title, description, questions },
    });
    const parsed = safeParse(QuestionsSchema, survey.questions);
    return c.json(
      {
        id: survey.id,
        title: survey.title,
        description: survey.description,
        questions: parsed.success ? parsed.output : [],
      },
      201
    );
  }
);

app.get(
  "/:id",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "アンケート詳細取得",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(AdminSurveyResponseSchema),
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
      description: survey.description,
      questions: parsed.success ? parsed.output : [],
    });
  }
);

app.get(
  "/:id/responses",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "回答一覧取得",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(SurveyResponsesSchema),
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
    const survey = await prisma.survey.findUnique({
      where: { id },
      include: { responses: { select: { id: true, answers: true } } },
    });
    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }
    return c.json({
      surveyId: survey.id,
      responses: survey.responses.map((r) => ({
        id: r.id,
        answers: r.answers as Record<string, string | string[]>,
      })),
    });
  }
);

export default app;
