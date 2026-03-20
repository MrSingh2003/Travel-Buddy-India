const API_BASE_URL =
  (
    import.meta.env.VITE_TRAVEL_BUDDY_API_BASE_URL ||
    import.meta.env.NEXT_PUBLIC_TRAVEL_BUDDY_API_BASE_URL
  )?.replace(/\/$/, "") ||
  "http://localhost:8080/api";

type RequestInitWithJson = RequestInit & {
  json?: unknown;
};

export async function apiRequest<T>(path: string, init?: RequestInitWithJson): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    body: init?.json ? JSON.stringify(init.json) : init?.body,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function buildQuery(params: Record<string, string>) {
  return new URLSearchParams(params).toString();
}
