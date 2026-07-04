const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  token?: string,
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(err.error ?? "Request failed", res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(path: string, token?: string)                  => request<T>("GET",    path, undefined, token),
  post:   <T>(path: string, body: unknown, token?: string)   => request<T>("POST",   path, body, token),
  patch:  <T>(path: string, body: unknown, token?: string)   => request<T>("PATCH",  path, body, token),
  delete: <T>(path: string, token?: string)                  => request<T>("DELETE", path, undefined, token),
};
