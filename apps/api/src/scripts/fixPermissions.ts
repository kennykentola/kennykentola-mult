import { Client, Databases, Permission, Role } from 'node-appwrite';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://fra.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID;
const apiKey = process.env.APPWRITE_API_KEY;
const databaseId = 'multicompany';

if (!projectId || !apiKey) {
  console.error('Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY');
  process.exit(1);
}

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(apiKey);

const databases = new Databases(client);

async function fixPermissions() {
  const collections = ['ai_prompts', 'ai_generated_assets', 'blog_posts'];

  for (const collectionId of collections) {
    try {
      console.log(`Updating permissions for collection ${collectionId}...`);
      await databases.updateCollection(
        databaseId,
        collectionId,
        collectionId, // name
        [
          Permission.read(Role.any()),
          Permission.create(Role.any()),
          Permission.update(Role.any()),
          Permission.delete(Role.any()),
        ]
      );
      console.log(`Successfully updated permissions for ${collectionId}`);
    } catch (error: any) {
      console.error(`Failed to update ${collectionId}:`, error.message);
    }
  }
}

fixPermissions().then(() => console.log('Done.')).catch(console.error);
