import { Link } from "@heroui/react";
import { motion } from "motion/react";
import { Navigate, useLocation } from "react-router-dom";

function AnimatedCheckmark() {
  return (
    <motion.div
      animate={{ scale: 1 }}
      className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/30"
      initial={{ scale: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
    >
      <motion.svg
        aria-hidden="true"
        className="h-10 w-10 text-emerald-500"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.5}
        viewBox="0 0 24 24"
      >
        <motion.path
          animate={{ pathLength: 1 }}
          d="M5 13l4 4L19 7"
          initial={{ pathLength: 0 }}
          transition={{ duration: 0.4, delay: 0.5, ease: "easeOut" }}
        />
      </motion.svg>
    </motion.div>
  );
}

export function CompletePage() {
  const location = useLocation();
  const state = location.state as { submitted?: boolean } | null;

  if (!state?.submitted) {
    return <Navigate replace to="/" />;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at top, oklch(0.696 0.17 162.48) 0%, transparent 55%)",
        }}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative flex w-full max-w-sm flex-col items-center text-center"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4 }}
      >
        <AnimatedCheckmark />
        <motion.h1
          animate={{ opacity: 1, y: 0 }}
          className="mb-2 font-bold text-2xl tracking-tight"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          回答完了
        </motion.h1>
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="text-muted"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          ご回答ありがとうございました。
        </motion.p>

        <motion.div
          animate={{ scaleX: 1, opacity: 1 }}
          className="my-8 h-px w-16 bg-border"
          initial={{ scaleX: 0, opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        />

        <motion.div
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Link href="https://workshop.nisshi.dev/">
            nisshi-dev工房公式サイト（整備中）
            <Link.Icon />
          </Link>
          <Link href="https://nisshi.dev">
            nisshi-dev個人サイト
            <Link.Icon />
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
}
