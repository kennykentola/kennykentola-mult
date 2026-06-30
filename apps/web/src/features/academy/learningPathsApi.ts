import { getSessionJwt } from '../../lib/sessionJwt';

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/learning-paths`;

export type CurriculumModule = {
  title: string;
  description: string;
  duration: string;
  topics: string[];
};

export type LearningPath = {
  $id?: string;
  slug: string;
  title: string;
  description: string;
  iconName: string;
  color: string;
  borderColor: string;
  duration: string;
  level: string;
  prerequisites: string;
  technologies: string[];
  careerOutcomes: string[];
  curriculum: string; // JSON string from DB
};

export async function fetchLearningPaths(): Promise<LearningPath[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) {
    throw new Error('Failed to fetch learning paths');
  }
  return res.json();
}

export async function fetchLearningPathBySlug(slug: string): Promise<LearningPath> {
  const res = await fetch(`${API_BASE}/${slug}`);
  if (!res.ok) {
    throw new Error('Failed to fetch learning path');
  }
  return res.json();
}

export async function createLearningPath(data: Partial<LearningPath>): Promise<LearningPath> {
  const jwt = await getSessionJwt();
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to create learning path');
  }
  return res.json();
}

export async function updateLearningPath(id: string, data: Partial<LearningPath>): Promise<LearningPath> {
  const jwt = await getSessionJwt();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to update learning path');
  }
  return res.json();
}

export async function deleteLearningPath(id: string): Promise<void> {
  const jwt = await getSessionJwt();
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${jwt}`
    }
  });
  if (!res.ok) {
    throw new Error('Failed to delete learning path');
  }
}
