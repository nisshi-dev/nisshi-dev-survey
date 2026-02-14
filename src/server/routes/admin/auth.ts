import { Hono } from "hono";

const app = new Hono();

app.post("/login", async (c) => {
  const { email, password } = await c.req.json();
  // TODO: Prisma で認証 & セッション発行
  return c.json({ message: "TODO: implement login" });
});

app.post("/logout", async (c) => {
  // TODO: セッション削除
  return c.json({ message: "TODO: implement logout" });
});

app.get("/me", async (c) => {
  // TODO: セッション検証
  return c.json({ message: "TODO: implement session check" });
});

export default app;
