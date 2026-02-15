import { Hono } from "hono";
import { beforeEach, describe, expect, test, vi } from "vitest";
import surveysApp from "./surveys";

vi.mock("@/server/lib/db", () => ({
  prisma: {
    survey: {
      findMany: vi.fn(),
      create: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const { prisma } = await import("@/server/lib/db");
const mockFindMany = vi.mocked(prisma.survey.findMany);
const mockCreate = vi.mocked(prisma.survey.create);
const mockFindUnique = vi.mocked(prisma.survey.findUnique);

function createApp() {
  const app = new Hono();
  app.route("/admin/surveys", surveysApp);
  return app;
}

describe("GET /admin/surveys", () => {
  beforeEach(() => {
    mockFindMany.mockReset();
  });

  test("アンケート一覧を返す", async () => {
    mockFindMany.mockResolvedValue([
      {
        id: "survey-1",
        title: "テストアンケート",
        description: null,
        questions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    const app = createApp();
    const res = await app.request("/admin/surveys");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.surveys).toHaveLength(1);
    expect(body.surveys[0].id).toBe("survey-1");
    expect(body.surveys[0].title).toBe("テストアンケート");
  });
});

describe("POST /admin/surveys", () => {
  beforeEach(() => {
    mockCreate.mockReset();
  });

  test("アンケートを作成して 201 を返す", async () => {
    const questions = [{ type: "text", id: "q1", label: "ご意見" }];
    mockCreate.mockResolvedValue({
      id: "survey-new",
      title: "新しいアンケート",
      description: null,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/admin/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: "新しいアンケート", questions }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("survey-new");
    expect(body.title).toBe("新しいアンケート");
    expect(body.questions).toEqual(questions);
  });

  test("description 付きでアンケートを作成して 201 を返す", async () => {
    const questions = [{ type: "text", id: "q1", label: "ご意見" }];
    const description = "## 概要\nこのアンケートについて";
    mockCreate.mockResolvedValue({
      id: "survey-desc",
      title: "説明付きアンケート",
      description,
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/admin/surveys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "説明付きアンケート",
        description,
        questions,
      }),
    });

    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toBe("survey-desc");
    expect(body.description).toBe(description);
  });
});

describe("GET /admin/surveys/:id", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  test("アンケート詳細を返す", async () => {
    const questions = [{ type: "text", id: "q1", label: "ご意見" }];
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: "テスト説明",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/admin/surveys/survey-1");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.id).toBe("survey-1");
    expect(body.title).toBe("テストアンケート");
    expect(body.description).toBe("テスト説明");
    expect(body.questions).toEqual(questions);
  });

  test("存在しないアンケートで 404 を返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const app = createApp();
    const res = await app.request("/admin/surveys/nonexistent");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });
});

describe("GET /admin/surveys/:id/responses", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  test("回答一覧を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [
        {
          id: "resp-1",
          surveyId: "survey-1",
          answers: { q1: "回答です" },
          createdAt: new Date(),
        },
      ],
    } as never);

    const app = createApp();
    const res = await app.request("/admin/surveys/survey-1/responses");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.surveyId).toBe("survey-1");
    expect(body.responses).toHaveLength(1);
    expect(body.responses[0].answers).toEqual({ q1: "回答です" });
  });

  test("存在しないアンケートで 404 を返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const app = createApp();
    const res = await app.request("/admin/surveys/nonexistent/responses");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });
});
