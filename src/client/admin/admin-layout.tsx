import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { usePostApiAdminAuthLogout } from "@/generated/api/auth/auth";

export function AdminLayout() {
  const navigate = useNavigate();
  const { trigger } = usePostApiAdminAuthLogout();

  const handleLogout = async () => {
    await trigger();
    navigate("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, padding: 16, borderRight: "1px solid #eee" }}>
        <h2>nisshi-dev Survey</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <NavLink to="/admin">ダッシュボード</NavLink>
          </li>
        </ul>
        <button onClick={handleLogout} type="button">
          ログアウト
        </button>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
