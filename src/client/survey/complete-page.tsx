import { Button, Card } from "@heroui/react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

export function CompletePage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.4 }}
      >
        <Card>
          <Card.Content className="py-12 text-center">
            <p className="mb-2 text-4xl">&#x2705;</p>
            <h1 className="mb-2 font-bold text-2xl">回答完了</h1>
            <p className="text-muted">ご回答ありがとうございました。</p>
          </Card.Content>
          <Card.Footer className="justify-center">
            <Button variant="secondary">
              <Link to="/">トップに戻る</Link>
            </Button>
          </Card.Footer>
        </Card>
      </motion.div>
    </div>
  );
}
