/**
 * Prisma v7 の生成コードで使われる .ts インポート指定子を .js に変換する。
 *
 * Prisma v7 は `from "./internal/class.ts"` のように .ts 拡張子でインポートを生成する。
 * Vercel の @vercel/node はファイルを個別にトランスパイルしインポート指定子を書き換えないため、
 * ランタイムでモジュール解決が失敗する。このスクリプトで .ts → .js に置換して回避する。
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";

const PRISMA_DIR = "src/generated/prisma";

function collectTsFiles(dir) {
  const entries = readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (extname(entry.name) === ".ts") {
      files.push(fullPath);
    }
  }
  return files;
}

// 相対パスの .ts インポート指定子を .js に変換
// from "./foo.ts" → from "./foo.js"
// from '../bar.ts' → from '../bar.js'
const importPattern = /(from\s+["'])(\.\.?\/[^"']*?)\.ts(["'])/g;

const files = collectTsFiles(PRISMA_DIR);
let fixedCount = 0;

for (const file of files) {
  const content = readFileSync(file, "utf-8");
  const replaced = content.replace(importPattern, "$1$2.js$3");
  if (replaced !== content) {
    writeFileSync(file, replaced, "utf-8");
    fixedCount++;
  }
}

console.log(`fix-prisma-imports: ${fixedCount} files updated in ${PRISMA_DIR}`);
