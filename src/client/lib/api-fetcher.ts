const API_URL = import.meta.env.VITE_API_URL || "";

export const apiFetcher = async <T>(
  input: RequestInfo,
  init?: RequestInit
): Promise<T> => {
  const url = typeof input === "string" ? `${API_URL}${input}` : input;
  const res = await fetch(url, { ...init, credentials: "include" });
  const body = [204, 205, 304].includes(res.status) ? null : await res.text();
  const data = body ? JSON.parse(body) : {};
  return { data, status: res.status, headers: res.headers } as T;
};
