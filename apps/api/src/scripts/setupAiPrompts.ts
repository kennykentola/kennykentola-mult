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

async function setupAiPromptsCollection() {
  const collectionId = 'ai_prompts';
  const collectionName = 'AI Prompts';

  try {
    console.log(`Checking if collection ${collectionId} exists...`);
    await databases.getCollection(databaseId, collectionId);
    console.log(`Collection ${collectionId} already exists.`);
  } catch (error: any) {
    if (error.code === 404) {
      console.log(`Creating collection ${collectionId}...`);
      await databases.createCollection(
        databaseId,
        collectionId,
        collectionName,
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ]
      );

      console.log('Creating attributes...');
      
      // title
      await databases.createStringAttribute(databaseId, collectionId, 'title', 255, true);
      // category
      await databases.createStringAttribute(databaseId, collectionId, 'category', 255, true);
      // promptText (large)
      await databases.createStringAttribute(databaseId, collectionId, 'promptText', 10000, true);
      // aiResponse (large)
      await databases.createStringAttribute(databaseId, collectionId, 'aiResponse', 100000, true);
      // isPublished
      await databases.createBooleanAttribute(databaseId, collectionId, 'isPublished', false, false);
      
      console.log(`Collection ${collectionId} created successfully.`);
    } else {
      console.error('Error setting up collection:', error);
    }
  }
}

setupAiPromptsCollection().then(() => {
  console.log('Done.');
}).catch(err => {
  console.error(err);
});
