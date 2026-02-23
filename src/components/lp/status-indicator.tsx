import { motion } from "motion/react";
import { API_URL } from "../../hooks/use-health-check";

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

export function StatusIndicator({
  status,
}: {
  status: "loading" | "ok" | "error";
}) {
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
