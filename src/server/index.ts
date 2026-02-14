import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import survey from "./routes/survey";
import adminAuth from "./routes/admin/auth";
import adminSurveys from "./routes/admin/surveys";
const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

// 回答者向け API（認証不要）
app.route("/survey", survey);

// 管理画面向け API
app.route("/admin/auth", adminAuth);
// TODO: adminAuth middleware を追加
app.route("/admin/surveys", adminSurveys);

export default app;

// ローカル開発用
if (process.env.NODE_ENV !== "production") {
  const { serve } = await import("@hono/node-server");
  serve({ fetch: app.fetch, port: 3000 }, (info) => {
    console.log(`🔥 Hono server running at http://localhost:${info.port}`);
  });
}
