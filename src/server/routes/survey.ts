import { Hono } from "hono";

const app = new Hono();

// アンケート取得
app.get("/:id", async (c) => {
  const id = c.req.param("id");

  // TODO: Prisma でアンケート取得
  return c.json({
    id,
    title: "サンプルアンケート",
    questions: [{ id: "q1", type: "text", label: "ご意見をお聞かせください" }],
  });
});

// 回答送信
app.post("/:id/submit", async (c) => {
  const id = c.req.param("id");
  const { answers } = await c.req.json();

  if (!answers) {
    return c.json({ error: "Answers required" }, 400);
  }

  // TODO: Prisma で回答保存
  return c.json({ success: true, surveyId: id });
});

export default app;
