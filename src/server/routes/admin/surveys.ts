import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => {
  // TODO: Prisma でアンケート一覧取得
  return c.json({ surveys: [] });
});

app.post("/", (c) => {
  // TODO: Prisma でアンケート作成
  return c.json({ message: "TODO: implement create survey" }, 201);
});

app.get("/:id", (c) => {
  const id = c.req.param("id");
  // TODO: Prisma でアンケート取得
  return c.json({ id, message: "TODO: implement get survey" });
});

app.get("/:id/responses", (c) => {
  const id = c.req.param("id");
  // TODO: Prisma で回答一覧取得
  return c.json({ surveyId: id, responses: [] });
});

export default app;
