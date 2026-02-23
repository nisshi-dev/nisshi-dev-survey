import { useEffect, useState } from "react";
import { API_URL } from "../lib/constants";

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
