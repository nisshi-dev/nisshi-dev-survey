import { NavLink, Outlet } from "react-router-dom";

export function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <nav style={{ width: 240, padding: 16, borderRight: "1px solid #eee" }}>
        <h2>nisshi-dev Survey</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li>
            <NavLink to="/admin">ダッシュボード</NavLink>
          </li>
        </ul>
      </nav>
      <main style={{ flex: 1, padding: 24 }}>
        <Outlet />
      </main>
    </div>
  );
}
