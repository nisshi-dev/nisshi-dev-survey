import { Button, Card } from "@heroui/react";
import { motion } from "motion/react";
import { authClient } from "@/lib/auth-client";

export function LoginPage() {
  const handleGoogleLogin = () => {
    authClient.signIn.social({
      provider: "google",
      callbackURL: "/admin",
    });
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          background:
            "radial-gradient(ellipse at top, var(--accent) 0%, transparent 55%)",
        }}
      />

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mb-8 text-center">
          <h1 className="font-bold text-2xl tracking-tight">
            nisshi-dev-survey
          </h1>
          <p className="mt-1 text-muted text-sm">管理画面</p>
        </div>

        <Card>
          <Card.Content className="flex flex-col gap-4">
            <Button fullWidth onPress={handleGoogleLogin}>
              Google でログイン
            </Button>
          </Card.Content>
        </Card>
      </motion.div>

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
