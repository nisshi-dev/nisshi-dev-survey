import {
  Button,
  Card,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { usePostAdminAuthLogin } from "@/generated/api/auth/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostAdminAuthLogin();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await trigger({
      email: fd.get("email") as string,
      password: fd.get("password") as string,
    });
    navigate("/admin");
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
          <Form onSubmit={handleSubmit}>
            <Card.Content className="flex flex-col gap-6">
              <TextField isRequired name="email" type="email">
                <Label>メールアドレス</Label>
                <Input placeholder="admin@example.com" />
              </TextField>
              <TextField isRequired name="password" type="password">
                <Label>パスワード</Label>
                <Input placeholder="••••••••" />
              </TextField>
              {error && (
                <p className="text-danger text-sm">ログインに失敗しました。</p>
              )}
            </Card.Content>
            <Card.Footer className="pt-4">
              <Button fullWidth isPending={isMutating} type="submit">
                {({ isPending }) => (
                  <>
                    {isPending ? <Spinner color="current" size="sm" /> : null}
                    {isPending ? "ログイン中..." : "ログイン"}
                  </>
                )}
              </Button>
            </Card.Footer>
          </Form>
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
