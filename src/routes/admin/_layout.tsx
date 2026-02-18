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
      <nav className="flex w-60 flex-col border-border border-r bg-surface p-4">
        <h2 className="mb-4 font-bold text-lg">nisshi-dev-survey</h2>
        <ul className="flex flex-1 flex-col gap-1 p-0">
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
        <Button onPress={handleLogout} variant="ghost">
          ログアウト
        </Button>
      </nav>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
