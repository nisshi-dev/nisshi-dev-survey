import { defineConfig } from "orval";

export default defineConfig({
  survey: {
    input: process.env.OPENAPI_URL || "./openapi.json",
    output: {
      target: "./src/generated/api/index.ts",
      client: "swr",
      httpClient: "fetch",
      mode: "tags-split",
      schemas: "./src/generated/api/schemas",
      baseUrl: "",
      override: {
        mutator: {
          path: "./src/client/lib/api-fetcher.ts",
          name: "apiFetcher",
        },
      },
    },
  },
});
