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

export interface ProjectRequest {
  title: string;
  description: string;
  budget?: number;
}

export async function createProjectRequest(payload: ProjectRequest) {
  const data = await fetchWithAuth(`${API_BASE}/projects/requests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data.project;
}

export async function getMyProjects() {
  const data = await fetchWithAuth(`${API_BASE}/projects`);
  return data;
}

export async function getProject(projectId: string) {
  const data = await fetchWithAuth(`${API_BASE}/projects/${projectId}`);
  // If the backend returns detailed structure:
  if (data.milestones) {
    return data;
  }
  return data.project;
}

export async function sendProjectMessage(projectId: string, content: string, fileUrl?: string) {
  const data = await fetchWithAuth(`${API_BASE}/projects/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, fileUrl })
  });
  return data.message;
}

export async function uploadProjectAsset(projectId: string, fileName: string, fileUrl: string, fileType?: string) {
  const data = await fetchWithAuth(`${API_BASE}/projects/${projectId}/assets`, {
    method: 'POST',
    body: JSON.stringify({ fileName, fileUrl, fileType })
  });
  return data.asset;
}

export async function getAdminAllProjects() {
  const data = await fetchWithAuth(`${API_BASE}/projects/admin/all`);
  return data;
}

export async function updateAdminProjectStatus(projectId: string, update: { status?: string, budget?: number, pmId?: string, pmName?: string }) {
  const data = await fetchWithAuth(`${API_BASE}/projects/admin/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(update)
  });
  return data.project;
}

export async function createAdminMilestone(projectId: string, title: string, description?: string, dueDate?: string) {
  const data = await fetchWithAuth(`${API_BASE}/projects/admin/${projectId}/milestones`, {
    method: 'POST',
    body: JSON.stringify({ title, description, dueDate })
  });
  return data.milestone;
}

export async function updateAdminMilestoneStatus(milestoneId: string, status: string) {
  const data = await fetchWithAuth(`${API_BASE}/projects/admin/milestones/${milestoneId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  });
  return data.milestone;
}