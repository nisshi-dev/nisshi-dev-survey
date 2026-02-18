import { Analytics } from "@vercel/analytics/react";
import { Route, Routes } from "react-router-dom";
import { AuthGuard } from "./components/admin/auth-guard";
import { AdminLayout } from "./routes/admin/_layout";
import { DashboardPage } from "./routes/admin/dashboard";
import { LoginPage } from "./routes/admin/login";
import { SurveyCreatePage } from "./routes/admin/survey-create";
import { SurveyDetailPage } from "./routes/admin/survey-detail";
import { SurveyEditPage } from "./routes/admin/survey-edit";
import { LandingPage } from "./routes/lp";
import { CompletePage } from "./routes/survey/complete";
import { SurveyPage } from "./routes/survey/respond";

export function App() {
  return (
    <>
      <Routes>
        <Route element={<LandingPage />} path="/" />

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
      <Analytics />
    </>
  );
}
