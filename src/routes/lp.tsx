import { Link } from "@heroui/react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

function useHealthCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`${API_URL}/health`, { credentials: "include" })
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
    <motion.div
      animate={{ opacity: 1 }}
      className="flex items-center gap-2 text-muted text-xs"
      initial={{ opacity: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
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
    </motion.div>
  );
}

export function LandingPage() {
  const health = useHealthCheck();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--accent) 0%, transparent 55%)",
        }}
      />

      <div className="relative flex w-full max-w-md flex-col items-center gap-12">
        <div className="flex flex-col items-center gap-5 text-center">
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
            <h1 className="font-bold text-4xl tracking-tight">
              nisshi-dev-survey
            </h1>
            <span className="text-muted text-sm">v{__APP_VERSION__}</span>
          </motion.div>

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1"
            initial={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <p className="text-muted leading-relaxed">
              シンプルなアンケート収集サービスを開発中です。
            </p>
            <p className="text-muted text-sm">
              現在は nisshi-dev
              のワークフローに合わせてカスタマイズ・運用中です。
            </p>
          </motion.div>
        </div>

        <motion.div
          animate={{ scaleX: 1, opacity: 1 }}
          className="h-px w-12 bg-accent/40"
          initial={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        />

        <motion.nav
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link href="https://workshop.nisshi.dev/">
            nisshi-dev工房公式サイト（整備中）
            <Link.Icon />
          </Link>
          <Link href="https://nisshi.dev">
            nisshi.dev 個人サイト
            <Link.Icon />
          </Link>
        </motion.nav>

        <StatusIndicator status={health} />
      </div>

      <motion.p
        animate={{ opacity: 1 }}
        className="absolute bottom-6 text-muted text-xs"
        initial={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 1 }}
      >
        &copy; 2026 nisshi-dev
      </motion.p>
    </div>
  );
}
