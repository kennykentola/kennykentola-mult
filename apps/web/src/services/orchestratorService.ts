import { Client, Databases, Query } from 'appwrite';
import { appwriteConfig, databases } from '../lib/appwrite';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const orchestratorService = {
  async generateAsset(topic: string) {
    const response = await fetch(`${API_BASE}/orchestrator/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ topic })
    });

    if (!response.ok) {
      throw new Error('Failed to generate asset');
    }

    return response.json();
  },

  async getAssets() {
    try {
      const response = await databases.listDocuments(
        appwriteConfig.databaseId,
        'ai_generated_assets',
        [Query.orderDesc('createdAt')]
      );
      return response.documents;
    } catch (error) {
      console.error('Error fetching AI assets:', error);
      return [];
    }
  },

  async postAsset(id: string) {
    const response = await fetch(`${API_BASE}/orchestrator/post/${id}`, { method: 'POST' });
    if (!response.ok) throw new Error('Failed to post asset');
    return response.json();
  },

  async deleteAsset(id: string) {
    const response = await fetch(`${API_BASE}/orchestrator/asset/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete asset');
    return response.json();
  }
};
