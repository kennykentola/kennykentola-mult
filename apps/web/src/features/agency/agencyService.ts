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
  $createdAt: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = () => {
  const token = localStorage.getItem('jwt_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const agencyService = {
  async submitBrief(payload: { title: string; description: string; projectType: string; budget?: number; deadline?: string }) {
    const res = await fetch(`${API_URL}/agency/requests`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit agency brief');
    return data.project;
  },

  async getMyProjects(): Promise<AgencyProject[]> {
    const res = await fetch(`${API_URL}/agency`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch agency projects');
    return data.projects;
  },

  async getAllProjectsAdmin(): Promise<AgencyProject[]> {
    const res = await fetch(`${API_URL}/agency/admin/all`, {
      headers: getHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch all agency projects');
    return data.projects;
  },

  async updateProjectAdmin(projectId: string, payload: { status?: string; quotePrice?: number; deadline?: string }) {
    const res = await fetch(`${API_URL}/agency/admin/${projectId}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update agency project');
    return data.project;
  }
};
