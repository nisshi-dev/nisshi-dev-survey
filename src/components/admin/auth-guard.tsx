import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useGetAdminAuthMe } from "@/generated/api/auth/auth";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { data, isLoading } = useGetAdminAuthMe();

  if (isLoading || !data) {
    return <p>読み込み中...</p>;
  }

  if (data.status !== 200) {
    return <Navigate replace to="/admin/login" />;
  }

  return <>{children}</>;
}
