import { Button } from "@heroui/react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { usePostAdminAuthLogout } from "@/generated/api/auth/auth";

export function AdminLayout() {
  const navigate = useNavigate();
  const { trigger } = usePostAdminAuthLogout();

  const handleLogout = async () => {
    await trigger();
    navigate("/admin/login");
  };

  return (
    <div className="flex min-h-screen">
      <nav className="flex w-56 shrink-0 flex-col border-border/60 border-r bg-surface px-3 py-5">
        <div className="mb-6 px-3">
          <h2 className="font-bold text-sm tracking-tight">
            nisshi-dev-survey
          </h2>
          <p className="text-muted text-xs">管理画面</p>
        </div>
        <ul className="flex flex-1 flex-col gap-0.5 p-0">
          <li className="list-none">
            <NavLink
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-accent/10 font-medium text-accent"
                    : "text-foreground hover:bg-surface-secondary"
                }`
              }
              end
              to="/admin"
            >
              ダッシュボード
            </NavLink>
          </li>
        </ul>
        <div className="border-border/60 border-t pt-3">
          <Button fullWidth onPress={handleLogout} size="sm" variant="ghost">
            ログアウト
          </Button>
          <p className="mt-2 text-center text-muted/60 text-xs">
            &copy; 2026 nisshi-dev
          </p>
        </div>
      </nav>
      <main className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
