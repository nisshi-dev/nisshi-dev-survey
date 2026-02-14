#!/usr/bin/env node
/**
 * HeroUI v3 コンポーネントの完全なドキュメント（MDX）を取得する。
 *
 * 使い方:
 *   node get_component_docs.mjs Button
 *   node get_component_docs.mjs Button Card TextField
 *
 * 出力:
 *   インポート、使い方、バリアント、props、使用例を含む MDX ドキュメント
 */

const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const FALLBACK_BASE = "https://v3.heroui.com";
const APP_PARAM = "app=react-skills";

/**
 * PascalCase を kebab-case に変換する。
 */
function toKebabCase(name) {
  return name
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

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
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

/**
 * フォールバックとして v3.heroui.com から MDX を直接取得する。
 */
async function fetchFallback(component) {
  const kebabName = toKebabCase(component);
  const url = `${FALLBACK_BASE}/docs/react/components/${kebabName}.mdx`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "HeroUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return { component, error: `${component} のドキュメント取得に失敗` };
    }

    const content = await response.text();

    return {
      component,
      content,
      contentType: "mdx",
      source: "fallback",
      url,
    };
  } catch {
    return { component, error: `${component} のドキュメント取得に失敗` };
  }
}

/**
 * コンポーネントドキュメントを取得するメイン関数。
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error(
      "使い方: node get_component_docs.mjs <コンポーネント1> [コンポーネント2] ..."
    );
    console.error("例: node get_component_docs.mjs Button Card");
    process.exit(1);
  }

  const components = args;

  // まず API を試行 - バッチリクエストには POST /v1/components/docs を使用
  console.error(`# ドキュメントを取得中: ${components.join(", ")}...`);
  const data = await fetchApi("/v1/components/docs", "POST", { components });

  if (data && data.results) {
    // 結果を出力
    if (data.results.length === 1) {
      // 単一コンポーネント - 読みやすいようにコンテンツを直接出力
      const result = data.results[0];

      if (result.content) {
        console.log(result.content);
      } else if (result.error) {
        console.error(`# ${result.component} のエラー: ${result.error}`);
        console.log(JSON.stringify(result, null, 2));
      } else {
        console.log(JSON.stringify(result, null, 2));
      }
    } else {
      // 複数コンポーネント - JSON 配列として出力
      console.log(JSON.stringify(data, null, 2));
    }

    return;
  }

  // 個別コンポーネント取得にフォールバック
  console.error("# API 失敗、フォールバックを使用...");
  const results = [];

  for (const component of components) {
    const result = await fetchFallback(component);

    results.push(result);
  }

  // 結果を出力
  if (results.length === 1) {
    // 単一コンポーネント - 読みやすいようにコンテンツを直接出力
    const result = results[0];

    if (result.content) {
      console.log(result.content);
    } else {
      console.log(JSON.stringify(result, null, 2));
    }
  } else {
    // 複数コンポーネント - JSON 配列として出力
    console.log(JSON.stringify(results, null, 2));
  }
}

main();
