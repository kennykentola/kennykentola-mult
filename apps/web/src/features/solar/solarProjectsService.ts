import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

async function fetchWithAuth(url: string, options: RequestInit = {}, requiresAuth: boolean = true) {
  let token = null;
  if (requiresAuth) {
    try {
      token = await getSessionJwt();
    } catch (err) {
      // Not logged in
    }
  }

  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers: { ...headers, ...options.headers },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export interface SolarProject {
  $id?: string;
  title: string;
  size: string;
  location: string;
  type: string;
  savings: string;
  image: string;
  description: string;
  roi?: string;
  co2Offset?: string;
  gridIndependence?: string;
  uptime?: string;
  equipment?: string[];
  timeline?: string;
}

export async function getSolarProjects() {
  const data = await fetchWithAuth(`${API_BASE}/solar/projects`, { cache: 'no-store' }, false);
  return data.projects;
}

export async function getSolarProject(id: string) {
  const data = await fetchWithAuth(`${API_BASE}/solar/projects/${id}`, { cache: 'no-store' }, false);
  return data.project;
}

export async function createAdminSolarProject(project: SolarProject) {
  const data = await fetchWithAuth(`${API_BASE}/solar/projects`, {
    method: 'POST',
    body: JSON.stringify(project)
  });
  return data.project;
}

export async function updateAdminSolarProject(id: string, project: Partial<SolarProject>) {
  const data = await fetchWithAuth(`${API_BASE}/solar/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(project)
  });
  return data.project;
}

export async function deleteAdminSolarProject(id: string) {
  const data = await fetchWithAuth(`${API_BASE}/solar/projects/${id}`, {
    method: 'DELETE'
  });
  return data;
}
