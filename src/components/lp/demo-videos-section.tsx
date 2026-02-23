import { motion } from "motion/react";

export function DemoVideosSection() {
  return (
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
  );
}
