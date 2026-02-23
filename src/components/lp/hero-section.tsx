import { motion } from "motion/react";
import { StatusIndicator } from "./status-indicator";

export function HeroSection({
  health,
}: {
  health: "loading" | "ok" | "error";
}) {
  return (
    <div className="relative flex w-full max-w-lg flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        <motion.span
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-medium text-accent text-xs tracking-wider"
          initial={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          準備中
        </motion.span>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex items-baseline gap-2"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="font-bold text-2xl tracking-tight sm:text-4xl">
            nisshi-dev-survey
          </h1>
          <span className="text-muted text-xs sm:text-sm">
            v{__APP_VERSION__}
          </span>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-1"
          initial={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-muted text-sm leading-relaxed sm:text-base">
            Google Forms
            の軽量版。AIエージェントからアンケート設計〜データ投入まで一気通貫で自動化できます。
          </p>
          <p className="text-muted text-xs sm:text-sm">
            現在は nisshi-dev のワークフローに合わせてカスタマイズ・運用中です。
          </p>
        </motion.div>

        <StatusIndicator status={health} />
      </div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 12 }}
        transition={{ duration: 0.5, delay: 0.35 }}
      >
        <a
          className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-medium text-white text-xs shadow-accent/25 shadow-lg transition-all hover:brightness-110 active:scale-[0.98] sm:px-6 sm:py-3 sm:text-sm"
          href="https://survey.nisshi.dev/survey/cmlzb4omy0000psp76bkn4fto?entry=cmlzbemt50000psp7wd91n5ps"
          rel="noopener noreferrer"
          target="_blank"
        >
          サンプルアンケートを試す
          <span aria-hidden>→</span>
        </a>
      </motion.div>
    </div>
  );
}
