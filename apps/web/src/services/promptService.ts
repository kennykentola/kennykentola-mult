import { databases, appwriteConfig } from '../lib/appwrite';
import { Query } from 'appwrite';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const promptService = {
  async generatePrompt(topic: string) {
    const response = await fetch(`${API_BASE}/prompts/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error('Failed to generate prompt');
    }

    return response.json();
  },

  async getPrompts(publicOnly: boolean = false) {
    try {
      const queries = [Query.orderDesc('$createdAt')];
      if (publicOnly) {
        queries.push(Query.equal('isPublished', true));
      }
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'ai_prompts',
        queries
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching AI prompts:', error);
      return [];
    }
  },

  async deletePrompt(id: string) {
    await databases.deleteDocument(
      appwriteConfig.databaseId,
      'ai_prompts',
      id
    );
  },

  async togglePublish(id: string, currentStatus: boolean) {
    await databases.updateDocument(
      appwriteConfig.databaseId,
      'ai_prompts',
      id,
      { isPublished: !currentStatus }
    );
  }
};
