import { Routes, Route } from "react-router-dom";
import { SurveyPage } from "./survey/SurveyPage";
import { CompletePage } from "./survey/CompletePage";
import { LoginPage } from "./admin/LoginPage";
import { AdminLayout } from "./admin/AdminLayout";
import { DashboardPage } from "./admin/DashboardPage";

export function App() {
  return (
    <Routes>
      {/* 回答者向け */}
      <Route path="/survey/:id" element={<SurveyPage />} />
      <Route path="/survey/:id/complete" element={<CompletePage />} />

      {/* 管理画面 */}
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<DashboardPage />} />
      </Route>
    </Routes>
  );
}
