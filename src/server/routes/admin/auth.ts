import { Hono } from "hono";

const app = new Hono();

app.post("/login", (c) => {
  // TODO: Prisma で認証 & セッション発行
  return c.json({ message: "TODO: implement login" });
});

app.post("/logout", (c) => {
  // TODO: セッション削除
  return c.json({ message: "TODO: implement logout" });
});

app.get("/me", (c) => {
  // TODO: セッション検証
  return c.json({ message: "TODO: implement session check" });
});

export default app;
