import { motion } from "motion/react";

const FEATURES = [
  {
    title: "AI エージェント & API ファースト",
    description:
      "Claude Code スキルや OpenAPI ベースの Data API で、アンケート設計〜回答投入を自動化",
  },
  {
    title: "データエントリ方式",
    description:
      "パラメータ付き配布 URL で、バージョン別・イベント別の回答を確実に追跡",
  },
  {
    title: "回答者フレンドリー",
    description: "アカウント登録不要。URL を開くだけで即回答",
  },
];

export function FeaturesSection() {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="relative mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      {FEATURES.map((feature) => (
        <div
          className="rounded-lg border border-border/60 bg-surface p-4"
          key={feature.title}
        >
          <h3 className="font-medium text-foreground text-sm">
            {feature.title}
          </h3>
          <p className="mt-1 text-muted text-xs leading-relaxed">
            {feature.description}
          </p>
        </div>
      ))}
    </motion.div>
  );
}
