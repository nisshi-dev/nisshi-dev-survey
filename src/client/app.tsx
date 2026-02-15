import { Route, Routes } from "react-router-dom";
import { AdminLayout } from "./admin/admin-layout";
import { AuthGuard } from "./admin/auth-guard";
import { DashboardPage } from "./admin/dashboard-page";
import { LoginPage } from "./admin/login-page";
import { SurveyCreatePage } from "./admin/survey-create-page";
import { SurveyDetailPage } from "./admin/survey-detail-page";
import { SurveyEditPage } from "./admin/survey-edit-page";
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
      <Route
        element={
          <AuthGuard>
            <AdminLayout />
          </AuthGuard>
        }
        path="/admin"
      >
        <Route element={<DashboardPage />} index />
        <Route element={<SurveyCreatePage />} path="surveys/new" />
        <Route element={<SurveyDetailPage />} path="surveys/:id" />
        <Route element={<SurveyEditPage />} path="surveys/:id/edit" />
      </Route>
    </Routes>
  );
}
