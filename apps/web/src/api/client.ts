const API_BASE = '/api/admin';

function getAuthHeader(): Record<string, string> {
  const key = localStorage.getItem('admin_api_key');
  if (!key) return {};
  return { Authorization: `Bearer ${key}` };
}

export async function adminFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...options?.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem('admin_api_key');
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(body.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem('admin_api_key');
}

export function login(key: string): void {
  localStorage.setItem('admin_api_key', key);
}

export function logout(): void {
  localStorage.removeItem('admin_api_key');
  window.location.href = '/login';
}