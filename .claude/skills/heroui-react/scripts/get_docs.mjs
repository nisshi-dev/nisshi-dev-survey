#!/usr/bin/env node
/**
 * HeroUI v3 のコンポーネント以外のドキュメント（ガイド、テーマ、リリースノート）を取得する。
 *
 * 使い方:
 *   node get_docs.mjs /docs/react/getting-started/theming
 *   node get_docs.mjs /docs/react/releases/v3-0-0-beta-3
 *
 * 出力:
 *   MDX ドキュメントの内容
 *
 * 注意: コンポーネントドキュメントには get_component_docs.mjs を使用すること。
 */

const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const FALLBACK_BASE = "https://v3.heroui.com";
const APP_PARAM = "app=react-skills";

/**
 * HeroUI API からドキュメントを取得する。
 * v1 エンドポイントパターン: /v1/docs/:path を使用
 */
async function fetchApi(path) {
  // v1 API は /docs/ プレフィックスなしのパスを期待する
  // 入力: /docs/react/getting-started/theming
  // API が期待: react/getting-started/theming（ルートは /v1/docs/:path(*)）
  const apiPath = path.startsWith("/docs/")
    ? path.slice(6) // /docs/ プレフィックスを除去
    : path.startsWith("/")
      ? path.slice(1) // 先頭の / を除去
      : path;

  const separator = "?";
  const url = `${API_BASE}/v1/docs/${apiPath}${separator}${APP_PARAM}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "HeroUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

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
 * フォールバックとして v3.heroui.com から MDX を直接取得する。
 */
async function fetchFallback(path) {
  // パスが /docs で始まり .mdx で終わることを確認
  let cleanPath = path.replace(/^\//, "");

  if (!cleanPath.endsWith(".mdx")) {
    cleanPath = `${cleanPath}.mdx`;
  }

  const url = `${FALLBACK_BASE}/${cleanPath}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "HeroUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return { error: `HTTP ${response.status}: ${response.statusText}`, path };
    }

    const content = await response.text();

    return {
      content,
      contentType: "mdx",
      path,
      source: "fallback",
      url,
    };
  } catch (error) {
    return { error: `取得エラー: ${error.message}`, path };
  }
}

/**
 * 指定パスのドキュメントを取得するメイン関数。
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error("使い方: node get_docs.mjs <パス>");
    console.error("例: node get_docs.mjs /docs/react/getting-started/theming");
    console.error();
    console.error("利用可能なパス:");
    console.error("  /docs/react/getting-started/theming");
    console.error("  /docs/react/getting-started/colors");
    console.error("  /docs/react/getting-started/animations");
    console.error("  /docs/react/releases/v3-0-0-beta-3");
    console.error();
    console.error(
      "注意: コンポーネントドキュメントには get_component_docs.mjs を使用してください。"
    );
    process.exit(1);
  }

  const path = args[0];

  // コンポーネントドキュメントを取得しようとしていないか確認
  if (path.includes("/components/")) {
    console.error(
      "# 警告: コンポーネントドキュメントには get_component_docs.mjs を使用してください。"
    );
    const componentName = path.split("/").pop().replace(".mdx", "");
    const titleCase =
      componentName.charAt(0).toUpperCase() + componentName.slice(1);

    console.error(`# 例: node get_component_docs.mjs ${titleCase}`);
  }

  console.error(`# ${path} のドキュメントを取得中...`);

  // まず API を試行
  const data = await fetchApi(path);

  if (data && data.content) {
    data.source = "api";
    console.log(data.content);

    return;
  }

  // フォールバックで直接取得
  console.error("# API 失敗、フォールバックを使用...");
  const fallbackData = await fetchFallback(path);

  if (fallbackData.content) {
    console.log(fallbackData.content);
  } else {
    console.log(JSON.stringify(fallbackData, null, 2));
    process.exit(1);
  }
}

main();
