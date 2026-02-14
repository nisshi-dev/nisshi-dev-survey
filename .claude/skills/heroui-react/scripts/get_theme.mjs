#!/usr/bin/env node
/**
 * HeroUI v3 のテーマ変数とデザイントークンを取得する。
 *
 * 使い方:
 *   node get_theme.mjs
 *
 * 出力:
 *   oklch カラー形式で common/light/dark に分類されたテーマ変数
 */

const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const APP_PARAM = "app=react-skills";

// API が利用不可の場合のフォールバックテーマリファレンス
const FALLBACK_THEME = {
  common: {
    base: [
      { name: "--font-sans", value: "ui-sans-serif, system-ui, sans-serif" },
      { name: "--font-mono", value: "ui-monospace, monospace" },
      { name: "--radius-sm", value: "0.375rem" },
      { name: "--radius-md", value: "0.5rem" },
      { name: "--radius-lg", value: "0.75rem" },
      { name: "--radius-full", value: "9999px" },
    ],
    calculated: [{ name: "--spacing-unit", value: "0.25rem" }],
  },
  dark: {
    semantic: [
      { name: "--color-background", value: "oklch(14.5% 0 0)" },
      { name: "--color-foreground", value: "oklch(98.4% 0 0)" },
      { name: "--color-accent", value: "oklch(55.1% 0.228 264.1)" },
      { name: "--color-danger", value: "oklch(63.7% 0.237 25.3)" },
      { name: "--color-success", value: "oklch(76.5% 0.177 163.2)" },
      { name: "--color-warning", value: "oklch(79.5% 0.184 86.0)" },
    ],
  },
  latestVersion: "3.0.0-beta",
  light: {
    semantic: [
      { name: "--color-background", value: "oklch(100% 0 0)" },
      { name: "--color-foreground", value: "oklch(14.5% 0 0)" },
      { name: "--color-accent", value: "oklch(55.1% 0.228 264.1)" },
      { name: "--color-danger", value: "oklch(63.7% 0.237 25.3)" },
      { name: "--color-success", value: "oklch(76.5% 0.177 163.2)" },
      { name: "--color-warning", value: "oklch(79.5% 0.184 86.0)" },
    ],
  },
  note: "これはフォールバックです。完全なテーマ変数を取得するには、API にアクセスできることを確認してください。",
  source: "fallback",
  theme: "default",
};

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
 * テーマ変数を表示用に整形する。
 */
function formatVariables(variables) {
  const lines = [];

  for (const variable of variables) {
    const name = variable.name || "";
    const value = variable.value || "";
    const desc = variable.description || "";

    if (desc) {
      lines.push(`  ${name}: ${value}; /* ${desc} */`);
    } else {
      lines.push(`  ${name}: ${value};`);
    }
  }

  return lines.join("\n");
}

/**
 * テーマ変数を取得するメイン関数。
 */
async function main() {
  console.error("# テーマ変数を取得中...");

  const rawData = await fetchApi("/v1/themes/variables?theme=default");

  let data;
  let version;

  if (rawData) {
    // API レスポンス形式を処理: { themes: [...], latestVersion: "..." }
    if (rawData.themes && rawData.themes.length > 0) {
      data = rawData.themes[0]; // 最初のテーマ（デフォルト）を取得
      version = rawData.latestVersion || rawData.version || "不明";
    } else {
      // ダイレクト形式
      data = rawData;
      version = rawData.latestVersion || "不明";
    }
  } else {
    console.error("# API 失敗、フォールバックテーマリファレンスを使用...");
    data = FALLBACK_THEME;
    version = FALLBACK_THEME.latestVersion || "不明";
  }

  // 可読性のため CSS 風の整形構造で出力
  console.log("/* HeroUI v3 テーマ変数 */");
  console.log(`/* テーマ: ${data.theme || "default"} */`);
  console.log(`/* バージョン: ${version} */`);
  console.log();

  // 共通変数
  if (data.common) {
    console.log(":root {");
    console.log("  /* ベース変数 */");
    if (data.common.base) {
      console.log(formatVariables(data.common.base));
    }
    console.log();
    console.log("  /* 計算変数 */");
    if (data.common.calculated) {
      console.log(formatVariables(data.common.calculated));
    }
    console.log("}");
    console.log();
  }

  // ライトモード
  if (data.light) {
    console.log(":root, [data-theme='light'] {");
    console.log("  /* ライトモード セマンティック変数 */");
    if (data.light.semantic) {
      console.log(formatVariables(data.light.semantic));
    }
    console.log("}");
    console.log();
  }

  // ダークモード
  if (data.dark) {
    console.log("[data-theme='dark'] {");
    console.log("  /* ダークモード セマンティック変数 */");
    if (data.dark.semantic) {
      console.log(formatVariables(data.dark.semantic));
    }
    console.log("}");
  }

  // プログラム利用のために生の JSON を stderr に出力
  console.error("\n# 生の JSON 出力:");
  console.error(JSON.stringify(rawData || data, null, 2));
}

main();
