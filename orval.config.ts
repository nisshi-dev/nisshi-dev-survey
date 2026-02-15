import { defineConfig } from "orval";

export default defineConfig({
  survey: {
    input: "./openapi.json",
    output: {
      target: "./src/generated/api/index.ts",
      client: "swr",
      httpClient: "fetch",
      mode: "tags-split",
      schemas: "./src/generated/api/schemas",
      baseUrl: "",
    },
  },
});
