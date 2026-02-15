import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { openAPIRouteHandler } from "hono-openapi";
import { adminAuth } from "./middleware/admin-auth";
import adminAuthRoutes from "./routes/admin/auth";
import adminSurveys from "./routes/admin/surveys";
import survey from "./routes/survey";

const app = new Hono().basePath("/api");

app.use("*", logger());
app.use("*", cors());

app.get("/health", (c) => c.json({ status: "ok" }));

// 回答者向け API（認証不要）
app.route("/survey", survey);

// 管理画面向け API
app.route("/admin/auth", adminAuthRoutes);
app.use("/admin/surveys/*", adminAuth);
app.route("/admin/surveys", adminSurveys);

// OpenAPI JSON
app.get(
  "/doc",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "nisshi-dev Survey API",
        version: "1.0.0",
        description: "アンケート作成・回答収集 API",
      },
      servers: [{ url: "/", description: "Local" }],
    },
  })
);

// Swagger UI
app.get("/ui", swaggerUI({ url: "/api/doc" }));

export default app;
