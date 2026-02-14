#!/usr/bin/env node
/**
 * HeroUI v3 で利用可能な全コンポーネントの一覧を取得する。
 *
 * 使い方:
 *   node list_components.mjs
 *
 * 出力:
 *   コンポーネント配列、最新バージョン、件数を含む JSON
 */

const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const APP_PARAM = "app=react-skills";
const LLMS_TXT_URL = "https://v3.heroui.com/react/llms.txt";

/**
 * アナリティクス用の app パラメータ付きで HeroUI API からデータを取得する。
 */
async function fetchApi(endpoint) {
  const separator = endpoint.includes("?") ? "&" : "?";
  const url = `${API_BASE}${endpoint}${separator}${APP_PARAM}`;

  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "HeroUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      console.error(`HTTP エラー ${response.status}: ${response.statusText}`);

      return null;
    }

    return await response.json();
  } catch (error) {
    console.error(`API エラー: ${error.message}`);

    return null;
  }
}

/**
 * フォールバックとして llms.txt URL からコンポーネント一覧を取得する。
 */
async function fetchFallback() {
  try {
    const response = await fetch(LLMS_TXT_URL, {
      headers: { "User-Agent": "HeroUI-Skill/1.0" },
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) {
      return null;
    }

    const content = await response.text();

    // Markdown からコンポーネント名を抽出: - [ComponentName](url) パターン
    // Components セクション（### Components）配下のリンクを検索
    const components = [];
    let inComponentsSection = false;

    for (const line of content.split("\n")) {
      // Components セクションに入ったか確認（### ヘッダー）
      if (line.trim() === "### Components") {
        inComponentsSection = true;
        continue;
      }

      // Components セクションを出たか確認（別の ### ヘッダー）
      if (inComponentsSection && line.trim().startsWith("### ")) {
        break;
      }

      // Markdown リンクパターンからコンポーネント名を抽出
      // マッチ: - [ComponentName](https://v3.heroui.com/docs/react/components/component-name)
      // 特定コンポーネントなしの /components にリンクする "All Components" はスキップ
      if (inComponentsSection) {
        const match = line.match(
          /^\s*-\s*\[([^\]]+)\]\(https:\/\/v3\.heroui\.com\/docs\/react\/components\/[a-z]/
        );

        if (match) {
          components.push(match[1]);
        }
      }
    }

    if (components.length > 0) {
      console.error(`# フォールバックを使用: ${LLMS_TXT_URL}`);

      return {
        components: components.sort(),
        count: components.length,
        latestVersion: "不明",
      };
    }

    return null;
  } catch (error) {
    console.error(`フォールバックエラー: ${error.message}`);

    return null;
  }
}

/**
 * HeroUI v3 で利用可能な全コンポーネントを一覧表示するメイン関数。
 */
async function main() {
  let data = await fetchApi("/v1/components");

  // API がコンポーネント付きの有効なデータを返したか確認
  if (!(data && data.components) || data.components.length === 0) {
    console.error(
      "# API がコンポーネントを返しませんでした、フォールバックを試行..."
    );
    data = await fetchFallback();
  }

  if (!(data && data.components) || data.components.length === 0) {
    console.error(
      "エラー: API とフォールバックの両方からコンポーネント一覧の取得に失敗"
    );
    process.exit(1);
  }

  // 整形された JSON を出力
  console.log(JSON.stringify(data, null, 2));

  // 人間が読みやすいように stderr にサマリーを出力
  console.error(
    `\n# ${data.components.length} 個のコンポーネントが見つかりました（${data.latestVersion || "不明"}）`
  );
}

main();
