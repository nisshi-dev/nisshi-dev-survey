import { motion } from "motion/react";
import { ExternalLinkIcon } from "../icons/external-link-icon";
import { GitHubIcon } from "../icons/github-icon";

export function FooterSection() {
  return (
    <>
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
    </>
  );
}
