#!/usr/bin/env node
/**
 * HeroUI v3 コンポーネントの CSS スタイル（BEM クラス）を取得する。
 *
 * 使い方:
 *   node get_styles.mjs Button
 *   node get_styles.mjs Button Card Chip
 *
 * 出力:
 *   各コンポーネントの BEM クラスを含む CSS ファイル内容と GitHub URL
 */

const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const GITHUB_RAW_BASE =
  "https://raw.githubusercontent.com/heroui-inc/heroui/refs/heads/v3";
const APP_PARAM = "app=react-skills";

/**
 * アナリティクス用の app パラメータ付きで HeroUI API からデータを取得する。
 */
async function fetchApi(endpoint, method = "GET", body = null) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${API_BASE}${endpoint}${separator}${APP_PARAM}`;

  try {
    const options = {
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HeroUI-Skill/1.0",
      },
      method,
      signal: AbortSignal.timeout(30_000),
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      console.error(`# API エラー: HTTP ${response.status}`);

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`# API エラー: ${error.message}`);

    return null;
  }
}

/**
 * フォールバックとして GitHub から CSS スタイルを直接取得する。
 */
async function fetchGithubFallback(component) {
  // スタイルパスの一般的なパターンを試行
  const patterns = [
    `packages/styles/src/components/${component.toLowerCase()}.css`,
    `packages/styles/components/${component.toLowerCase()}.css`,
  ];

  for (const path of patterns) {
    const url = `${GITHUB_RAW_BASE}/${path}`;

    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "HeroUI-Skill/1.0" },
        signal: AbortSignal.timeout(30_000),
      });

      if (response.ok) {
        const content = await response.text();

        return {
          component,
          filePath: path,
          githubUrl: `https://github.com/heroui-inc/heroui/blob/v3/${path}`,
          source: "fallback",
          stylesCode: content,
        };
      }
    } catch {}
  }

  return { component, error: `${component} のスタイル取得に失敗` };
}

/**
 * 指定コンポーネントの CSS スタイルを取得するメイン関数。
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "使い方: node get_styles.mjs <コンポーネント1> [コンポーネント2] ..."
    );
    console.error("例: node get_styles.mjs Button Card");
    process.exit(1);
  }

  const components = args;

  // まず API を試行
  console.error(`# スタイルを取得中: ${components.join(", ")}...`);
  const data = await fetchApi("/v1/components/styles", "POST", { components });

  if (data && data.results) {
    for (const result of data.results) {
      result.source = "api";
    }

    // 結果を出力
    if (data.results.length === 1) {
      const result = data.results[0];

      if (result.stylesCode) {
        console.log(`/* ファイル: ${result.filePath || "不明"} */`);
        console.log(`/* GitHub: ${result.githubUrl || "不明"} */`);
        console.log();
        console.log(result.stylesCode);
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      console.log(JSON.stringify(data, null, 2));
    }

    return;
  }

  // GitHub からの直接取得にフォールバック
  console.error("# API 失敗、GitHub フォールバックを使用...");
  const results = [];

  for (const component of components) {
    const result = await fetchGithubFallback(component);

    results.push(result);
  }

  if (results.length === 1) {
    const result = results[0];

    if (result.stylesCode) {
      console.log(`/* ファイル: ${result.filePath || "不明"} */`);
      console.log(`/* GitHub: ${result.githubUrl || "不明"} */`);
      console.log();
      console.log(result.stylesCode);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    console.log(JSON.stringify({ results }, null, 2));
  }
}

main();
