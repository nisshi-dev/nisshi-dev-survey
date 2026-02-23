import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { ExternalLinkIcon } from "../components/icons/external-link-icon";
import { GitHubIcon } from "../components/icons/github-icon";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function useHealthCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data: { status: string }) => {
        setStatus(data.status === "ok" ? "ok" : "error");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return status;
}

const STATUS_DOT = {
  loading: "bg-yellow-400",
  ok: "bg-emerald-400",
  error: "bg-red-400",
} as const;

const STATUS_LABEL = {
  loading: "API: 確認中...",
  ok: "API サーバー稼働中",
  error: "API サーバー停止中",
} as const;

function StatusIndicator({ status }: { status: "loading" | "ok" | "error" }) {
  return (
    <motion.a
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1 text-muted text-xs transition-colors hover:bg-surface-secondary"
      href={`${API_URL}/health`}
      initial={{ opacity: 0 }}
      rel="noopener noreferrer"
      target="_blank"
      transition={{ duration: 0.5, delay: 0.25 }}
    >
      <span className="relative flex h-2 w-2">
        {status === "ok" && (
          <span
            className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${STATUS_DOT[status]}`}
          />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${STATUS_DOT[status]}`}
        />
      </span>
      {STATUS_LABEL[status]}
    </motion.a>
  );
}

export function LandingPage() {
  const health = useHealthCheck();

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-4 pt-8 pb-8 md:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--accent) 0%, transparent 55%)",
        }}
      />

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
              現在は nisshi-dev
              のワークフローに合わせてカスタマイズ・運用中です。
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

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-8 grid w-full max-w-7xl grid-cols-1 gap-6 md:grid-cols-2"
        initial={{ opacity: 0, y: 24 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="flex flex-col gap-2">
          <h2 className="text-center font-medium text-muted text-xs uppercase tracking-wider">
            管理者ダッシュボード
          </h2>
          <video
            autoPlay
            className="w-full rounded-xl border border-border/60 shadow-lg"
            loop
            muted
            playsInline
            src="/videos/admin-dashboard.webm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-center font-medium text-muted text-xs uppercase tracking-wider">
            アンケート回答
          </h2>
          <video
            autoPlay
            className="w-full rounded-xl border border-border/60 shadow-lg"
            loop
            muted
            playsInline
            src="/videos/survey-respond.webm"
          />
        </div>
      </motion.div>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative mt-10 grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {[
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
        ].map((feature) => (
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

      <div className="relative mt-8 flex flex-col items-center gap-4">
        <motion.p
          animate={{ opacity: 1 }}
          className="text-muted text-xs"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          すべてのソースコードを{" "}
          <a
            className="inline-flex items-center gap-0.5 underline underline-offset-2 transition-colors hover:text-foreground"
            href="https://github.com/nisshi-dev/nisshi-dev-survey/blob/main/LICENSE"
            rel="noopener noreferrer"
            target="_blank"
          >
            MIT License
            <ExternalLinkIcon className="inline h-2.5 w-2.5" />
          </a>{" "}
          で公開しています
        </motion.p>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.75 }}
        >
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface px-4 py-2 text-foreground text-sm transition-colors hover:bg-surface-secondary"
            href="https://github.com/nisshi-dev/nisshi-dev-survey"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="h-4 w-4" />
            Frontend
            <ExternalLinkIcon className="h-3 w-3 opacity-50" />
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-surface px-4 py-2 text-foreground text-sm transition-colors hover:bg-surface-secondary"
            href="https://github.com/nisshi-dev/nisshi-dev-survey-api"
            rel="noopener noreferrer"
            target="_blank"
          >
            <GitHubIcon className="h-4 w-4" />
            API
            <ExternalLinkIcon className="h-3 w-3 opacity-50" />
          </a>
        </motion.div>
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-sm text-white transition-colors hover:bg-emerald-600"
            href="https://workshop.nisshi.dev/"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt=""
              className="h-4 w-4 rounded-sm"
              height={16}
              src="/icons/workshop.png"
              width={16}
            />
            nisshi-dev工房
            <ExternalLinkIcon className="h-3 w-3 opacity-50" />
          </a>
          <a
            className="inline-flex items-center gap-2 rounded-lg bg-amber-800 px-4 py-2 text-sm text-white transition-colors hover:bg-amber-900"
            href="https://nisshi.dev"
            rel="noopener noreferrer"
            target="_blank"
          >
            <img
              alt=""
              className="h-4 w-4 rounded-sm"
              height={16}
              src="/icons/nisshi.png"
              width={16}
            />
            nisshi.dev
            <ExternalLinkIcon className="h-3 w-3 opacity-50" />
          </a>
        </motion.div>
      </div>

      <motion.p
        animate={{ opacity: 1 }}
        className="mt-8 text-muted text-xs"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        &copy; 2026 nisshi-dev
      </motion.p>
    </div>
  );
}
