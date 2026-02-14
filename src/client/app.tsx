import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/admin-layout";
import { DashboardPage } from "./admin/dashboard-page";
import { LoginPage } from "./admin/login-page";
import { CompletePage } from "./survey/complete-page";
import { SurveyPage } from "./survey/survey-page";

export function App() {
  return (
    <Routes>
      {/* 回答者向け */}
      <Route element={<SurveyPage />} path="/survey/:id" />
      <Route element={<CompletePage />} path="/survey/:id/complete" />

      {/* 管理画面 */}
      <Route element={<LoginPage />} path="/admin/login" />
      <Route element={<AdminLayout />} path="/admin">
        <Route element={<DashboardPage />} index />
      </Route>
    </Routes>
  );
}
