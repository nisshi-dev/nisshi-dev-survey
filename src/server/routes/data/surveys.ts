import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { safeParse } from "valibot";
import { prisma } from "@/server/lib/db";
import { ErrorResponseSchema, IdParamSchema } from "@/shared/schema/common";
import {
  AdminSurveyResponseSchema,
  DataCreateSurveySchema,
  DataSubmitResponsesSchema,
  QuestionsSchema,
  SurveyListResponseSchema,
  type SurveyParam,
  SurveyParamsSchema,
} from "@/shared/schema/survey";

function parseSurveyParams(raw: unknown): SurveyParam[] {
  const result = safeParse(SurveyParamsSchema, raw);
  return result.success ? result.output : [];
}

const app = new Hono();

app.post(
  "/",
  describeRoute({
    tags: ["Data"],
    summary: "アンケート作成（データ投入用）",
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
  validator("json", DataCreateSurveySchema),
  async (c) => {
    const { title, description, questions, params, status } =
      c.req.valid("json");
    const survey = await prisma.survey.create({
      data: {
        title,
        description,
        questions,
        ...(params && { params }),
        ...(status && { status }),
      },
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
        params: parseSurveyParams(survey.params),
      },
      201
    );
  }
);

app.get(
  "/",
  describeRoute({
    tags: ["Data"],
    summary: "アンケート一覧取得（データ投入用）",
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

app.get(
  "/:id",
  describeRoute({
    tags: ["Data"],
    summary: "アンケート詳細取得（データ投入用）",
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
      params: parseSurveyParams(survey.params),
    });
  }
);

app.post(
  "/:id/responses",
  describeRoute({
    tags: ["Data"],
    summary: "回答一括送信（データ投入用）",
    responses: {
      201: {
        description: "作成成功",
      },
      400: {
        description: "アンケートが受付中でない",
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
  validator("json", DataSubmitResponsesSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const { responses } = c.req.valid("json");

    const survey = await prisma.survey.findUnique({ where: { id } });
    if (!survey) {
      return c.json({ error: "Survey not found" }, 404);
    }
    if (survey.status !== "active") {
      return c.json({ error: "Survey is not active" }, 400);
    }

    const result = await prisma.response.createMany({
      data: responses.map((r) => ({
        surveyId: id,
        answers: r.answers,
        ...(r.params && { params: r.params }),
        ...(r.dataEntryId && { dataEntryId: r.dataEntryId }),
      })),
    });

    return c.json({ count: result.count }, 201);
  }
);

export default app;
