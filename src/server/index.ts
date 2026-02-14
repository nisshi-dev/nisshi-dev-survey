import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import adminAuth from "./routes/admin/auth";
import adminSurveys from "./routes/admin/surveys";
import survey from "./routes/survey";

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
