import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface AcademicProjectDto {
  $id: string;
  studentId: string;
  title: string;
  description: string;
  universityName: string;
  department: string;
  degree: string;
  level: string;
  status: string;
  serviceScope: string;
  assignedDeveloper: string;
  price: number;
  proposalUrl: string;
  documentationUrl: string;
  sourceCodeUrl: string;
  paymentId: string;
  $createdAt: string;
  $updatedAt: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = await getSessionJwt();
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || 'API request failed');
  }
  return response.json();
}

export async function requestAcademicProject(data: {
  title: string;
  description: string;
  universityName?: string;
  department?: string;
  degree?: string;
  level?: string;
  serviceScope: string;
}): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/requests`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.project;
}

export async function fetchMyAcademicProjects(): Promise<AcademicProjectDto[]> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects`);
  return response.projects;
}

export async function fetchAcademicProjectById(id: string): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/${id}`);
  return response.project;
}

// ADMIN METHODS

export async function fetchAllAcademicProjects(): Promise<AcademicProjectDto[]> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/admin/all`);
  return response.projects;
}

export async function updateAcademicProject(id: string, updates: Partial<AcademicProjectDto>): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/admin/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates)
  });
  return response.project;
}
