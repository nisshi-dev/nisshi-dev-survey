import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/AdminLayout";
import { DashboardPage } from "./admin/DashboardPage";
import { LoginPage } from "./admin/LoginPage";
import { CompletePage } from "./survey/CompletePage";
import { SurveyPage } from "./survey/SurveyPage";

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
