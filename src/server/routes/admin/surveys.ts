import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import { IdParamSchema } from "@/shared/schema/common";
import {
  AdminSurveyResponseSchema,
  CreateSurveySchema,
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
  (c) => {
    // TODO: Prisma でアンケート一覧取得
    return c.json({ surveys: [] });
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
  (c) => {
    // TODO: Prisma でアンケート作成（c.req.valid("json") で取得）
    return c.json({ message: "TODO: implement create survey" }, 201);
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
    },
  }),
  validator("param", IdParamSchema),
  (c) => {
    const { id } = c.req.valid("param");
    // TODO: Prisma でアンケート取得
    return c.json({ id, message: "TODO: implement get survey" });
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
    },
  }),
  validator("param", IdParamSchema),
  (c) => {
    const { id } = c.req.valid("param");
    // TODO: Prisma で回答一覧取得
    return c.json({ surveyId: id, responses: [] });
  }
);

export default app;
