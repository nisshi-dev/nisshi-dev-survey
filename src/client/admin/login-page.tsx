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
    <div>
      <h1>nisshi-dev Survey 管理画面</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">メールアドレス</label>
          <input id="email" name="email" required type="email" />
        </div>
        <div>
          <label htmlFor="password">パスワード</label>
          <input id="password" name="password" required type="password" />
        </div>
        {error && <p>ログインに失敗しました。</p>}
        <button disabled={isMutating} type="submit">
          {isMutating ? "ログイン中..." : "ログイン"}
        </button>
      </form>
    </div>
  );
}
