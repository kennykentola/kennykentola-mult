import { Client, Databases, Storage, Users } from 'node-appwrite';
import * as dotenv from 'dotenv';

dotenv.config();

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;

if (!projectId || !apiKey) {
  console.warn(
    '[Appwrite Service] Warning: APPWRITE_PROJECT_ID or APPWRITE_API_KEY environment variables are missing. Database integrations will fail until they are configured.'
  );
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId || 'mock-project-id')
  .setKey(apiKey || 'mock-api-key');

export const appwriteClient = client;
export const databases = new Databases(client);
export const storage = new Storage(client);
export const users = new Users(client);

console.log('[Appwrite Service] Client initialized successfully.');
