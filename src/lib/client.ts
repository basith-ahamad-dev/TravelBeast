export type ApiResult<T = unknown> = { ok: boolean; status: number; data: T & { error?: string; fields?: Record<string, string> } };

/** Small fetch wrapper for admin forms. Never throws. */
export async function api<T = unknown>(url: string, method: string, body?: unknown): Promise<ApiResult<T>> {
  try {
    const res = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: "Network error. Please try again." } as never };
  }
}
