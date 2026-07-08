import { getSessionJwt } from '../../lib/sessionJwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export async function getAllSettings() {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/settings`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!res.ok) throw new Error('Failed to fetch settings');
  const data = await res.json();
  return data.settings;
}

export async function getSettingByKey(key: string) {
  const res = await fetch(`${API_URL}/settings/${key}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch setting');
  }
  const data = await res.json();
  return data.setting?.value;
}

export async function updateSetting(key: string, value: string) {
  const token = await getSessionJwt();
  const res = await fetch(`${API_URL}/settings/${key}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ value })
  });
  if (!res.ok) throw new Error('Failed to update setting');
  const data = await res.json();
  return data.setting;
}
