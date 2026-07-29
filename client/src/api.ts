const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function apiPost(path: string, body: unknown, token?: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: token } : {}), // NOTE: no "Bearer " prefix — her middleware expects raw token
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function apiGet(path: string, token?: string) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: token } : {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}