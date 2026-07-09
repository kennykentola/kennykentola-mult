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
  amountPaid?: number;
  assignedMentorId?: string;
  assignedMentorName?: string;
  proposalUrl: string;
  documentationUrl: string;
  sourceCodeUrl: string;
  paymentReceiptUrl?: string;
  initialDocumentUrl?: string;
  paymentId: string;
  $createdAt: string;
  $updatedAt: string;
}

export interface AcademicMessageDto {
  $id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  content: string;
  fileUrl?: string;
  $createdAt: string;
}

export interface AcademicTaskDto {
  $id: string;
  projectId: string;
  title: string;
  completed: boolean;
  $createdAt: string;
}

export interface AcademicPaymentDto {
  $id: string;
  projectId: string;
  amount: number;
  receiptUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  installmentNumber: number;
  $createdAt: string;
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let token = null;
  try {
    token = await getSessionJwt();
  } catch (err) {
    // User is likely a guest, proceed without token
  }
  
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
  initialDocumentUrl?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/requests`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return response.project;
}

export async function submitAcademicPaymentReceipt(id: string, paymentReceiptUrl: string): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/${id}/payment`, {
    method: 'PATCH',
    body: JSON.stringify({ paymentReceiptUrl })
  });
  return response.project;
}

export async function fetchMyAcademicProjects(): Promise<AcademicProjectDto[]> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects`);
  return response.projects;
}

export async function fetchAcademicProjectById(id: string): Promise<{ project: AcademicProjectDto, messages: AcademicMessageDto[] }> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/${id}`);
  return { project: response.project, messages: response.messages || [] };
}

export async function sendAcademicMessage(projectId: string, content: string, fileUrl?: string): Promise<AcademicMessageDto> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, fileUrl }),
  });
  return data.message;
}

// ──────────────────────────────────────────────────
// TASKS
// ──────────────────────────────────────────────────

export async function fetchProjectTasks(projectId: string): Promise<AcademicTaskDto[]> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/tasks`);
  return data.tasks;
}

export async function createProjectTask(projectId: string, title: string): Promise<AcademicTaskDto> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/tasks`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
  return data.task;
}

export async function updateProjectTask(projectId: string, taskId: string, completed: boolean): Promise<AcademicTaskDto> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/tasks/${taskId}`, {
    method: 'PATCH',
    body: JSON.stringify({ completed }),
  });
  return data.task;
}

export async function deleteProjectTask(projectId: string, taskId: string): Promise<void> {
  await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' });
}

// ──────────────────────────────────────────────────
// PAYMENTS
// ──────────────────────────────────────────────────

export async function fetchProjectPayments(projectId: string): Promise<AcademicPaymentDto[]> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/payments`);
  return data.payments;
}

export async function createProjectPayment(projectId: string, amount: number, receiptUrl: string): Promise<AcademicPaymentDto> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/payments`, {
    method: 'POST',
    body: JSON.stringify({ amount, receiptUrl }),
  });
  return data.payment;
}

export async function approveProjectPayment(projectId: string, paymentId: string): Promise<AcademicPaymentDto> {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/${projectId}/payments/${paymentId}/approve`, {
    method: 'PATCH'
  });
  return data.payment;
}

export async function approveAcademicProject(id: string): Promise<AcademicProjectDto> {
  const response = await fetchWithAuth(`${API_BASE}/academic-projects/${id}/approve`, {
    method: 'PATCH'
  });
  return response.project;
}

// ADMIN METHODS

export async function fetchAllAdminAcademicProjects() {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/admin/all`);
  return data.projects as AcademicProjectDto[];
}

export async function fetchMentorAcademicProjects() {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/mentor/all`);
  return data.projects as AcademicProjectDto[];
}

export async function updateMentorProject(projectId: string, payload: Partial<AcademicProjectDto>) {
  const data = await fetchWithAuth(`${API_BASE}/academic-projects/mentor/${projectId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return data.project as AcademicProjectDto;
}

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
