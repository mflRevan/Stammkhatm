const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export const api = {
  get: (path: string) =>
    fetch(`${API_URL}${path}`, {
      credentials: "include",
    }),

  post: (path: string, body: unknown) =>
    fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }),

  put: (path: string, body: unknown) =>
    fetch(`${API_URL}${path}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    }),
};
