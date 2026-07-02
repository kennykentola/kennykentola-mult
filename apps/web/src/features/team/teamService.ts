import { getSessionJwt } from '../../lib/sessionJwt';
import { AgencyProject } from '../agency/agencyService';

export interface TeamSprint {
  $id: string;
  projectId: string;
  title: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'planned';
}

export interface TeamTask {
  $id: string;
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  assigneeId?: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  storyPoints?: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getHeaders = async () => {
  const token = await getSessionJwt();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const teamService = {
  // Assigned Projects
  getProjects: async (): Promise<AgencyProject[]> => {
    const res = await fetch(`${API_URL}/team/projects`, {
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch assigned projects');
    const data = await res.json();
    return data.projects;
  },

  // Sprints
  getSprints: async (projectId: string): Promise<TeamSprint[]> => {
    const res = await fetch(`${API_URL}/team/sprints/${projectId}`, {
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch sprints');
    const data = await res.json();
    return data.sprints;
  },

  createSprint: async (payload: Partial<TeamSprint>): Promise<TeamSprint> => {
    const res = await fetch(`${API_URL}/team/sprints`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create sprint');
    const data = await res.json();
    return data.sprint;
  },

  // Tasks
  getTasks: async (projectId: string): Promise<TeamTask[]> => {
    const res = await fetch(`${API_URL}/team/tasks/${projectId}`, {
      headers: await getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch tasks');
    const data = await res.json();
    return data.tasks;
  },

  createTask: async (payload: Partial<TeamTask>): Promise<TeamTask> => {
    const res = await fetch(`${API_URL}/team/tasks`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to create task');
    const data = await res.json();
    return data.task;
  },

  updateTaskStatus: async (taskId: string, payload: Partial<TeamTask>): Promise<TeamTask> => {
    const res = await fetch(`${API_URL}/team/tasks/${taskId}`, {
      method: 'PATCH',
      headers: await getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update task');
    const data = await res.json();
    return data.task;
  }
};
