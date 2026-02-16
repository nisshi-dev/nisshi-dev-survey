import {
  Button,
  Card,
  Form,
  Input,
  Label,
  Spinner,
  TextField,
} from "@heroui/react";
import { useNavigate } from "react-router-dom";
import { usePostApiAdminAuthLogin } from "@/generated/api/auth/auth";

export function LoginPage() {
  const navigate = useNavigate();
  const { trigger, isMutating, error } = usePostApiAdminAuthLogin();

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <Card.Header>
          <Card.Title>nisshi-dev Survey 管理画面</Card.Title>
          <Card.Description>
            管理者アカウントでログインしてください
          </Card.Description>
        </Card.Header>
        <Form onSubmit={handleSubmit}>
          <Card.Content className="flex flex-col gap-4">
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
          <Card.Footer>
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
    </div>
  );
}
