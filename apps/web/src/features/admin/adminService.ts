import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getSessionJwt();
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function getAdminAnalytics() {
  const data = await fetchWithAuth(`${API_BASE}/admin/analytics`);
  return data;
}

export async function fetchAdminUsers() {
  const data = await fetchWithAuth(`${API_BASE}/admin/users`);
  return data;
}
