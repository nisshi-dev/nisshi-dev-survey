import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export { API_URL };

export function useHealthCheck() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((res) => res.json())
      .then((data: { status: string }) => {
        setStatus(data.status === "ok" ? "ok" : "error");
      })
      .catch(() => {
        setStatus("error");
      });
  }, []);

  return status;
}
