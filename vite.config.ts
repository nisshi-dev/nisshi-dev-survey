import path from "node:path";
import devServer from "@hono/vite-dev-server";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const NON_API_ROUTES = /^(?!\/api\/)/;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    plugins: [
      tailwindcss(),
      react(),
      devServer({
        entry: "src/server/index.ts",
        exclude: [NON_API_ROUTES],
        injectClientScript: false,
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
