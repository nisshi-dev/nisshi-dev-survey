import { Hono } from "hono";
import { beforeEach, describe, expect, test, vi } from "vitest";
import surveyApp from "./survey";

vi.mock("@/server/lib/db", () => ({
  prisma: {
    survey: { findUnique: vi.fn() },
    response: { create: vi.fn() },
  },
}));

vi.mock("@/server/lib/email", () => ({
  sendResponseCopyEmail: vi.fn().mockResolvedValue(undefined),
}));

const { prisma } = await import("@/server/lib/db");
const mockFindUnique = vi.mocked(prisma.survey.findUnique);
const mockCreateResponse = vi.mocked(prisma.response.create);

const { sendResponseCopyEmail } = await import("@/server/lib/email");
const mockSendEmail = vi.mocked(sendResponseCopyEmail);

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
    mockSendEmail.mockReset();
    mockSendEmail.mockResolvedValue(undefined);
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

  test("sendCopy なし（後方互換）で sendResponseCopyEmail を呼ばない", async () => {
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
      answers: { q1: "良い" },
      createdAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: { q1: "良い" } }),
    });

    expect(res.status).toBe(200);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test("sendCopy: false で sendResponseCopyEmail を呼ばない", async () => {
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
      answers: { q1: "良い" },
      createdAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: { q1: "良い" },
        sendCopy: false,
      }),
    });

    expect(res.status).toBe(200);
    expect(mockSendEmail).not.toHaveBeenCalled();
  });

  test("sendCopy: true + メールなしで 400 を返す", async () => {
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "active",
      questions: [{ type: "text", id: "q1", label: "ご意見" }],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: { q1: "良い" },
        sendCopy: true,
      }),
    });

    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeDefined();
  });

  test("sendCopy: true + メールありで 200 + sendResponseCopyEmail 呼び出し", async () => {
    const questions = [{ type: "text", id: "q1", label: "ご意見" }];
    mockFindUnique.mockResolvedValue({
      id: "survey-1",
      title: "テストアンケート",
      description: null,
      status: "active",
      questions,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    mockCreateResponse.mockResolvedValue({
      id: "resp-1",
      surveyId: "survey-1",
      answers: { q1: "良い" },
      createdAt: new Date(),
    });

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: { q1: "良い" },
        sendCopy: true,
        respondentEmail: "test@example.com",
      }),
    });

    expect(res.status).toBe(200);
    expect(mockSendEmail).toHaveBeenCalledWith({
      to: "test@example.com",
      surveyTitle: "テストアンケート",
      questions,
      answers: { q1: "良い" },
    });
  });

  test("メール送信失敗でもレスポンスは 200", async () => {
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
      answers: { q1: "良い" },
      createdAt: new Date(),
    });
    mockSendEmail.mockRejectedValue(new Error("Resend API error"));

    const app = createApp();
    const res = await app.request("/survey/survey-1/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: { q1: "良い" },
        sendCopy: true,
        respondentEmail: "test@example.com",
      }),
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });
});
