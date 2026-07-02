import { getSessionJwt } from '../../lib/sessionJwt';

export interface AgencyProject {
  $id: string;
  clientId: string;
  title: string;
  description: string;
  projectType: string;
  status: string;
  budget?: number;
  quotePrice?: number;
  deadline?: string;
  pipelineStage?: string;
  pmId?: string;
  assignedTeam?: string[];
  clientName?: string;
  clientEmail?: string;
  $createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = async () => {
  const token = await getSessionJwt();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const agencyService = {
  async submitBrief(payload: { title: string; description: string; projectType: string; budget?: number; deadline?: string }) {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/agency/requests`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit agency brief');
    return data.project;
  },

  async getMyProjects(): Promise<AgencyProject[]> {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/agency`, {
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch agency projects');
    return data.projects;
  },

  async getProject(projectId: string): Promise<{ project: AgencyProject, milestones: any[], invoices: any[] }> {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/agency/${projectId}`, {
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch project details');
    return data;
  },

  async getAllProjectsAdmin(): Promise<AgencyProject[]> {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/agency/admin/all`, {
      headers
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch all agency projects');
    return data.projects;
  },

  async updateProjectAdmin(projectId: string, payload: { status?: string; quotePrice?: number; deadline?: string; pipelineStage?: string; pmId?: string; assignedTeam?: string[] }) {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/agency/admin/${projectId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update agency project');
    return data.project;
  }
};
