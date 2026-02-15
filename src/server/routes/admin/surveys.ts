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
  UpdateSurveyStatusSchema,
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
      select: { id: true, title: true, status: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
    return c.json({
      surveys: surveys.map((s) => ({
        ...s,
        createdAt: s.createdAt.toISOString(),
      })),
    });
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
        status: survey.status,
        createdAt: survey.createdAt.toISOString(),
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
      status: survey.status,
      createdAt: survey.createdAt.toISOString(),
      questions: parsed.success ? parsed.output : [],
    });
  }
);

app.patch(
  "/:id",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "アンケートステータス更新",
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
  validator("json", UpdateSurveyStatusSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");
    const existing = await prisma.survey.findUnique({ where: { id } });
    if (!existing) {
      return c.json({ error: "Survey not found" }, 404);
    }
    const survey = await prisma.survey.update({
      where: { id },
      data: { status },
    });
    const parsed = safeParse(QuestionsSchema, survey.questions);
    return c.json({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      status: survey.status,
      createdAt: survey.createdAt.toISOString(),
      questions: parsed.success ? parsed.output : [],
    });
  }
);

app.delete(
  "/:id",
  describeRoute({
    tags: ["Admin Surveys"],
    summary: "アンケート削除",
    responses: {
      200: {
        description: "削除成功",
      },
      400: {
        description: "削除不可",
        content: {
          "application/json": {
            schema: resolver(ErrorResponseSchema),
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
    if (survey.status === "completed") {
      return c.json({ error: "Completed survey cannot be deleted" }, 400);
    }
    await prisma.survey.delete({ where: { id } });
    return c.json({ success: true });
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
