import type { MiddlewareHandler } from "hono";

export const adminAuth: MiddlewareHandler = async (c, next) => {
  // TODO: Cookie からセッション検証
  // const sessionId = getCookie(c, "session");
  // if (!sessionId) return c.json({ error: "Unauthorized" }, 401);

  await next();
};
