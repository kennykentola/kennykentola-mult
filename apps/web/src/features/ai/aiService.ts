import { getSessionJwt } from '../../lib/sessionJwt';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const generateContent = async (topic: string, type: 'blog' | 'newsletter', instructions?: string) => {
  const token = await getSessionJwt();
  
  if (!token) {
    throw new Error('Authentication required');
  }

  const response = await fetch(`${API_URL}/ai/generate-content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ topic, type, instructions })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to generate content');
  }

  const data = await response.json();
  return data.content;
};
