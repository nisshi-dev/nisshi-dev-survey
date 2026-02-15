import { Hono } from "hono";
import { beforeEach, describe, expect, test, vi } from "vitest";
import surveyApp from "./survey";

vi.mock("@/server/lib/db", () => ({
  prisma: {
    survey: { findUnique: vi.fn() },
    response: { create: vi.fn() },
  },
}));

const { prisma } = await import("@/server/lib/db");
const mockFindUnique = vi.mocked(prisma.survey.findUnique);
const mockCreateResponse = vi.mocked(prisma.response.create);

function createApp() {
  const app = new Hono();
  app.route("/survey", surveyApp);
  return app;
}

describe("GET /survey/:id", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
  });

  test("active なアンケートを取得する", async () => {
    const questions = [{ type: "text", id: "q1", label: "ご意見" }];
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: "テスト説明",
      status: "active",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1");
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
    const res = await app.request("/survey/nonexistent");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });

  test("draft のアンケートで 404 を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "draft",
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });

  test("completed のアンケートで 404 を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "completed",
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });
});

describe("POST /survey/:id/submit", () => {
  beforeEach(() => {
    mockFindUnique.mockReset();
    mockCreateResponse.mockReset();
  });

  test("active なアンケートに回答を送信する", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "active",
      questions: [{ type: "text", id: "q1", label: "ご意見" }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCreateResponse.mockResolvedValue({
      id: "resp-1",
      surveyId: "survey-1",
      answers: { q1: "良いです" },
      createdAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { q1: "良いです" } }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.surveyId).toBe("survey-1");
  });

  test("存在しないアンケートへの送信で 404 を返す", async () => {
    mockFindUnique.mockResolvedValue(null);

    const app = createApp();
    const res = await app.request("/survey/nonexistent/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { q1: "回答" } }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });

  test("draft のアンケートへの送信で 404 を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "draft",
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { q1: "回答" } }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });

  test("completed のアンケートへの送信で 404 を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "completed",
      questions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { q1: "回答" } }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error).toBe("Survey not found");
  });
});
