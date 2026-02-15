import { Hono } from "hono";
import { describeRoute, resolver, validator } from "hono-openapi";
import {
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  MeResponseSchema,
} from "@/shared/schema/auth";

const app = new Hono();

app.post(
  "/login",
  describeRoute({
    tags: ["Auth"],
    summary: "ログイン",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(LoginResponseSchema),
          },
        },
      },
    },
  }),
  validator("json", LoginRequestSchema),
  (c) => {
    // TODO: Prisma で認証 & セッション発行（c.req.valid("json") で取得）
    return c.json({ message: "TODO: implement login" });
  }
);

app.post(
  "/logout",
  describeRoute({
    tags: ["Auth"],
    summary: "ログアウト",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(LogoutResponseSchema),
          },
        },
      },
    },
  }),
  (c) => {
    // TODO: セッション削除
    return c.json({ message: "TODO: implement logout" });
  }
);

app.get(
  "/me",
  describeRoute({
    tags: ["Auth"],
    summary: "セッション確認",
    responses: {
      200: {
        description: "成功",
        content: {
          "application/json": {
            schema: resolver(MeResponseSchema),
          },
        },
      },
    },
  }),
  (c) => {
    // TODO: セッション検証
    return c.json({ message: "TODO: implement session check" });
  }
);

export default app;
