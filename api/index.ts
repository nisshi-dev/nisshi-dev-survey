// biome-ignore lint/style/noExportedImports: Vercel entry point requires import + re-export
import app from "../src/server/index.js";

export const config = {
  runtime: "nodejs",
};

export default app;
