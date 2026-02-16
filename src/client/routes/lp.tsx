import { Card, Link } from "@heroui/react";
import { motion } from "motion/react";

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
};

export function LandingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Card>
          <Card.Content className="flex flex-col items-center gap-4 py-10 text-center">
            <motion.p
              {...fadeInUp}
              className="font-medium text-accent text-sm"
              transition={{ duration: 0.4 }}
            >
              準備中
            </motion.p>
            <motion.h1
              {...fadeInUp}
              className="font-bold text-3xl"
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              nisshi-dev Survey
            </motion.h1>
            <motion.div
              {...fadeInUp}
              className="flex flex-col gap-1"
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <p className="text-muted">
                シンプルなアンケート収集サービスを開発中です。
              </p>
              <p className="text-muted text-sm">
                現在は nisshi-dev
                のワークフローに合わせてカスタマイズ・運用中です。
              </p>
            </motion.div>
          </Card.Content>
          <Card.Footer className="justify-center pb-8">
            <motion.div
              {...fadeInUp}
              className="flex flex-col items-center gap-2"
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Link href="https://workshop.nisshi.dev/">
                nisshi-dev工房公式サイト（整備中）
                <Link.Icon />
              </Link>
              <Link href="https://nisshi.dev">
                nisshi.dev 個人サイト
                <Link.Icon />
              </Link>
            </motion.div>
          </Card.Footer>
        </Card>
      </div>
    </div>
  );
}
