import { routes, type VercelConfig } from "@vercel/config/v1";

export const config: VercelConfig = {
  rewrites: [
    routes.rewrite("/api/(.*)", "/src/server/entry-vercel.ts"),
    routes.rewrite("/(.*)", "/index.html"),
  ],
};
